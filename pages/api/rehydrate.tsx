import { getToken } from "next-auth/jwt"
import api from "../../lib/axios.setup"
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../lib/prismadb"
import { bigint_filter } from "./enrollments"

type Role = 'ADMIN' | 'APPLICANT' | 'SUPERADMIN' | 'SUPPORT' | 'USER';
type RegistrationType = 'INDIVIDUAL' | 'ENTERPRISE';

// Define our own types based on the schema
interface User {
  id: string;
  email: string;
  password: string;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  role: Role;
  type: RegistrationType | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date;
  thinkific_user_id: string | null;
  userCohort?: {
    id: string;
    name: string;
    start_date: Date;
    end_date: Date;
    created_at: Date;
    updated_at: Date;
    enrollments?: {
      course_name: string;
      course_id: string;
      enrolled: boolean;
    }[];
  } | null;
  profile?: {
    id: string;
    user_id: string;
    created_at: Date;
    updated_at: Date;
  } | null;
}

interface Enrollment {
  id: number;
  userCohortId: string;
  enrolled: boolean;
  percentage_completed: number | null;
  expired: boolean;
  is_free_trial: boolean;
  completed: boolean;
  started_at: Date | null;
  activated_at: Date | null;
  completed_at: Date | null;
  updated_at: Date | null;
  expiry_date: Date | null;
}

async function asyncForEach(array: any[], callback: (arg0: any, arg1: number, arg2: any) => any) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

interface Data {
  user_email: string;
  user_name: string;
  id: number;
  user_id: number;
  course_name: string;
  course_id: number;
  percentage_completed: any;
  expired: boolean;
  is_free_trial: boolean;
  completed: boolean;
  started_at: Date;
  activated_at: Date;
  completed_at: Date;
  updated_at: Date;
  expiry_date: Date;
}

interface ThinkificUser {
  email: string;
  id: string;
  role: Role;
  userCohort: { id: string; }[];
  thinkific_user_id: string | null;
}

// Helper function to calculate percentage completed
const calculatePercentage = (data: Data): number => {
  if (data.completed) return 1;
  if (typeof data.percentage_completed === 'number') {
    return data.percentage_completed > 1 ? data.percentage_completed / 100 : data.percentage_completed;
  }
  if (typeof data.percentage_completed === 'string') {
    const val = parseFloat(data.percentage_completed);
    return isNaN(val) ? 0 : val > 1 ? val / 100 : val;
  }
  return 0;
};

// Helper function to validate enrollment data
const validateEnrollment = (item: Data): boolean => {
  if (!item.id || !item.user_email) {
    console.warn('Invalid enrollment data:', item);
    return false;
  }
  return true;
};

// Helper function to process a single enrollment with retries
const processEnrollment = async (item: Data, userCohortId: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      // Check if enrollment already exists and is completed
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: { id: item.id },
        select: {
          id: true,
          completed: true,
          percentage_completed: true
        }
      });

      // Skip if enrollment exists and is completed
      if (existingEnrollment?.completed) {
        console.log(`Skipping completed enrollment ${item.id} for ${item.user_email}`);
        return existingEnrollment;
      }

      const percentage = calculatePercentage(item);
      console.log(`Processing enrollment ${item.id} for ${item.user_email}:`, {
        percentage,
        completed: item.completed,
        course: item.course_name,
        existing: existingEnrollment ? 'Updating' : 'Creating'
      });

      const enrollment = await prisma.enrollment.upsert({
        where: { id: item.id },
        update: {
          enrolled: true,
          percentage_completed: percentage,
          completed: Boolean(item.completed),
          expired: Boolean(item.expired),
          is_free_trial: Boolean(item.is_free_trial),
          started_at: item.started_at,
          activated_at: item.activated_at,
          completed_at: item.completed_at,
          updated_at: item.updated_at,
          expiry_date: item.expiry_date,
          course_name: item.course_name,
          course_id: Number(item.course_id),
          userCohort: {
            connect: { id: userCohortId }
          }
        },
        create: {
          id: item.id,
          enrolled: true,
          percentage_completed: percentage,
          completed: Boolean(item.completed),
          expired: Boolean(item.expired),
          is_free_trial: Boolean(item.is_free_trial),
          started_at: item.started_at,
          activated_at: item.activated_at,
          completed_at: item.completed_at,
          updated_at: item.updated_at,
          expiry_date: item.expiry_date,
          course_name: item.course_name,
          course_id: Number(item.course_id),
          userCohort: {
            connect: { id: userCohortId }
          }
        }
      });

      // Verify the update
      const verified = await prisma.enrollment.findUnique({
        where: { id: item.id },
        select: {
          id: true,
          percentage_completed: true,
          completed: true,
          course_name: true
        }
      });

      if (!verified || verified.percentage_completed !== percentage) {
        throw new Error(`Verification failed for enrollment ${item.id}`);
      }

      return enrollment;
    } catch (error) {
      console.error(`Error processing enrollment ${item.id} (attempt ${i + 1}/${retries}):`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

// Vercel configuration
export const config = {
  maxDuration: 60, // Vercel's maximum execution time
};

// Constants
const BATCH_SIZE = 50;
const MAX_EXECUTION_TIME = 55 * 1000; // 55 seconds to allow for cleanup
const LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Lock management
async function acquireLock() {
  const lock = await prisma.rehydrationDate.findFirst({
    where: {
      created_at: {
        gte: new Date(Date.now() - LOCK_TIMEOUT)
      }
    }
  });
  return !lock;
}

// Get last sync time
async function getLastSyncTime() {
  const lastSync = await prisma.rehydrationDate.findFirst({
    orderBy: { created_at: 'desc' }
  });
  return lastSync?.created_at || new Date(0);
}

// Process a batch of enrollments
async function processBatch(enrollments: Data[], startTime: number) {
  if (Date.now() - startTime > MAX_EXECUTION_TIME) {
    return { processed: 0, remaining: enrollments.length };
  }

  const updates = [];
  for (const item of enrollments) {
    if (!validateEnrollment(item)) continue;
    
    const percentage = calculatePercentage(item);
    updates.push({
      where: { id: item.id },
      data: {
        enrolled: true,
        percentage_completed: percentage,
        completed: Boolean(item.completed),
        expired: Boolean(item.expired),
        is_free_trial: Boolean(item.is_free_trial),
        started_at: item.started_at,
        activated_at: item.activated_at,
        completed_at: item.completed_at,
        updated_at: item.updated_at,
        expiry_date: item.expiry_date,
        course_name: item.course_name,
        course_id: Number(item.course_id)
      }
    });
  }

  if (updates.length > 0) {
    await prisma.enrollment.updateMany({
      data: updates
    });
  }

  return { processed: updates.length, remaining: enrollments.length - updates.length };
}

// Error handling
async function handleError(error: any) {
  await prisma.rehydrationDate.create({
    data: {
      error: error.message,
      status: 'failed',
      enrollment_count: 0
    }
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Add cache control headers
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'GET') {
    try {
      // Check for existing lock
      if (!await acquireLock()) {
        return res.status(409).json({ 
          message: 'Another rehydration is in progress',
          error: true 
        });
      }

      console.log('Starting rehydration process...');
      const startTime = Date.now();
      
      // Get last sync time for incremental updates
      const lastSync = await getLastSyncTime();
      console.log('Last sync time:', lastSync);

      // Get enrollments with pagination
      let allEnrollments: Data[] = [];
      let page = 1;
      const limit = 1000;
      const timestamp = new Date().getTime();

      while (true) {
        if (Date.now() - startTime > MAX_EXECUTION_TIME) {
          console.log('Time limit reached, stopping enrollment fetch');
          break;
        }

        console.log(`Fetching page ${page} of enrollments...`);
        const { data } = await api.get(`/enrollments?limit=${limit}&page=${page}&_t=${timestamp}`);
        if (!data.items.length) break;
        allEnrollments = allEnrollments.concat(data.items);
        console.log(`Fetched ${data.items.length} enrollments from page ${page}`);
        page++;
      }

      console.log('\n=== THINKIFIC ENROLLMENTS ===');
      console.log('Total enrollments:', allEnrollments.length);
      
      // Log completion statistics
      const completionStats = allEnrollments.reduce((acc: any, item: Data) => {
        const status = item.completed ? 'completed' : 
                      item.percentage_completed > 0 ? 'in_progress' : 'not_started';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      console.log('Completion stats:', completionStats);

      // Get all users in one query
      const userEmails = allEnrollments.map((item: Data) => item.user_email.toLowerCase());
      console.log(`Fetching ${userEmails.length} users...`);
      
      const users = await prisma.user.findMany({
        where: {
          email: { in: userEmails }
        },
        select: {
          id: true,
          email: true,
          role: true,
          thinkific_user_id: true,
          userCohort: {
            select: {
              id: true
            }
          }
        }
      });

      console.log('\n=== USER MATCHING ===');
      console.log('Found users:', users.length, 'out of', userEmails.length, 'enrollments');

      // Process enrollments in batches
      const totalBatches = Math.ceil(allEnrollments.length / BATCH_SIZE);
      let processedCount = 0;
      let skippedCount = 0;
      let roleMismatchCount = 0;
      let noCohortCount = 0;
      let errorCount = 0;
      let completedSkippedCount = 0;
      let noUserFoundCount = 0;
      let updatedEnrollments: any[] = [];

      for (let batch = 0; batch < totalBatches; batch++) {
        if (Date.now() - startTime > MAX_EXECUTION_TIME) {
          console.log('Time limit reached, stopping batch processing');
          break;
        }

        const start = batch * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, allEnrollments.length);
        const batchItems = allEnrollments.slice(start, end);
        
        console.log(`\nProcessing batch ${batch + 1} of ${totalBatches}...`);
        console.log(`Items ${start + 1} to ${end} of ${allEnrollments.length}`);
        
        const batchResults = await Promise.allSettled(
          batchItems.map(async (item: Data) => {
            if (!validateEnrollment(item)) {
              console.warn(`Skipping invalid enrollment: ${item.id}`);
              skippedCount++;
              return null;
            }

            const user = users.find((user) => user.email.toLowerCase() === item.user_email.toLowerCase());
            if (!user) {
              console.warn(`No user found for email: ${item.user_email}`);
              noUserFoundCount++;
              skippedCount++;
              return null;
            }
            if (user.role !== "APPLICANT") {
              console.warn(`Role mismatch for user ${user.email}: ${user.role}`);
              roleMismatchCount++;
              return null;
            }

            const userCohortId = user.userCohort.at(-1)?.id;
            if (!userCohortId) {
              console.warn(`No cohort found for user: ${user.email}`);
              noCohortCount++;
              return null;
            }

            try {
              const { processed, remaining } = await processBatch([item], startTime);
              if (processed > 0) {
                processedCount++;
              } else {
                completedSkippedCount++;
              }
              return { processed, remaining };
            } catch (error) {
              console.error(`Error processing enrollment for ${item.user_email}:`, error);
              errorCount++;
              return null;
            }
          })
        );

        const successfulUpdates = batchResults
          .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
          .map(result => result.value)
          .filter(Boolean);

        updatedEnrollments = updatedEnrollments.concat(successfulUpdates);
        
        console.log(`Batch ${batch + 1} complete. Processed: ${successfulUpdates.length}`);
        console.log('Current stats:', {
          processed: processedCount,
          skipped: skippedCount,
          roleMismatch: roleMismatchCount,
          noCohort: noCohortCount,
          errors: errorCount,
          completedSkipped: completedSkippedCount,
          noUserFound: noUserFoundCount
        });
      }

      console.log('\n=== PROCESSING SUMMARY ===');
      console.log({
        totalEnrollments: allEnrollments.length,
        processedCount,
        skippedCount,
        roleMismatchCount,
        noCohortCount,
        errorCount,
        completedSkippedCount,
        noUserFoundCount,
        updatedCount: updatedEnrollments.length,
        completionStats,
        duration: `${(Date.now() - startTime) / 1000}s`
      });

      // Create a new RehydrationDate record
      await prisma.rehydrationDate.create({
        data: {
          enrollment_count: updatedEnrollments.length,
          status: 'completed',
          duration: Date.now() - startTime
        }
      });

      return res.status(200).json({ 
        message: 'Synchronization complete', 
        count: updatedEnrollments.length,
        stats: {
          processed: processedCount,
          skipped: skippedCount,
          roleMismatch: roleMismatchCount,
          noCohort: noCohortCount,
          errors: errorCount,
          completedSkipped: completedSkippedCount,
          noUserFound: noUserFoundCount,
          duration: `${(Date.now() - startTime) / 1000}s`
        }
      });
    } catch (err) {
      console.error('Rehydration error:', err);
      await handleError(err);
      return res.status(500).json({ 
        message: err instanceof Error ? err.message : 'An error occurred',
        error: true
      });
    }
  }
}