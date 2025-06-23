import { NextApiRequest, NextApiResponse } from "next";
import api from "../../lib/axios.setup";
import prisma from "../../lib/prismadb";
import { User } from "@prisma/client";

// === Helpers ===
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function executeWithRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      const retriable = error.message?.includes('Closed') || error.message?.includes('connection');
      if (retriable && i < retries - 1) {
        console.log(`Retry ${i + 1}/${retries} after DB error...`);
        await sleep(1000 * (i + 1));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached');
}

async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429 && i < retries - 1) {
        console.warn(`Rate limited. Waiting ${(i + 1) * 2000}ms`);
        await sleep((i + 1) * 2000);
        continue;
      }
      throw error;
    }
  }
  throw new Error('API fetch failed after retries');
}

// === Types ===
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

// === Main Handler ===
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const startTime = Date.now();
  try {
    console.log("🔄 Starting enrollment sync...");

    // Get the last successful sync date
    const lastSync = await prisma.rehydrationDate.findFirst({
      where: { status: "completed" },
      orderBy: { created_at: "desc" }
    });

    // Get start date from query parameter or use last sync date
    const startDate = req.query.start_date as string || 
      (lastSync ? new Date(lastSync.created_at).toISOString().split('T')[0] : "2025-01-01");
    
    const url = `/enrollments?limit=100000&query[updated_after]=${startDate}T00:00:00Z`;
    console.log(`Fetching enrollments from ${startDate}...`);

    const response = await fetchWithRetry(url);
    const enrollments = response.items || [];
    console.log(`Found ${enrollments.length} enrollments to process`);

    // Process enrollments in batches of 100
    const BATCH_SIZE = 100;
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let lastProgressLog = Date.now();

    for (let i = 0; i < enrollments.length; i += BATCH_SIZE) {
      const batch = enrollments.slice(i, i + BATCH_SIZE);
      console.log(`\nProcessing batch ${i/BATCH_SIZE + 1} of ${Math.ceil(enrollments.length/BATCH_SIZE)}`);

      // Process each enrollment in the batch
      for (const enrollment of batch) {
        try {
          // Only find user by Thinkific ID
          const user = await prisma.user.findFirst({
            where: { thinkific_user_id: enrollment.user_id.toString() }
          });

          // If user not found by Thinkific ID, skip
          if (!user) {
            console.log(`⚠️ Skipping enrollment ${enrollment.id}: No user with Thinkific ID ${enrollment.user_id}`);
            skippedCount++;
            continue;
          }

          // Get user's cohort
          const userCohort = await prisma.userCohort.findFirst({
            where: { userId: user.id }
          });

          if (!userCohort) {
            console.log(`⚠️ Skipping enrollment ${enrollment.id}: No cohort found for user ${user.email}`);
            skippedCount++;
            continue;
          }

          // Convert percentage_completed to float
          let percentageCompleted = null;
          if (enrollment.percentage_completed) {
            const val = parseFloat(enrollment.percentage_completed.toString());
            percentageCompleted = isNaN(val) ? null : (val > 1 ? val / 100 : val);
          }

          // Update or create enrollment
          await prisma.enrollment.upsert({
            where: {
              id: enrollment.id.toString()
            },
            update: {
              completed: enrollment.completed,
              completed_at: enrollment.completed_at ? new Date(enrollment.completed_at) : null,
              percentage_completed: percentageCompleted,
              updated_at: new Date()
            },
            create: {
              id: enrollment.id.toString(),
              user_id: enrollment.user_id.toString(),
              course_id: enrollment.course_id.toString(),
              course_name: enrollment.course_name,
              completed: enrollment.completed,
              completed_at: enrollment.completed_at ? new Date(enrollment.completed_at) : null,
              percentage_completed: percentageCompleted,
              userCohortId: userCohort.id,
              created_at: new Date(enrollment.created_at),
              updated_at: new Date()
            }
          });

          processedCount++;
          // Log progress every 5 seconds
          const now = Date.now();
          if (now - lastProgressLog >= 5000) {
            console.log(`\n📊 Progress Update:`);
            console.log(`   Processed: ${processedCount} enrollments`);
            console.log(`   Skipped: ${skippedCount} enrollments`);
            console.log(`   Errors: ${errorCount}`);
            console.log(`   Success Rate: ${((processedCount / (processedCount + skippedCount)) * 100).toFixed(1)}%`);
            lastProgressLog = now;
          }
        } catch (error) {
          console.error(`❌ Error processing enrollment ${enrollment.id}:`, error);
          errorCount++;
        }
      }

      // Add a small delay between batches to prevent connection pool exhaustion
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const duration = Date.now() - startTime;
    console.log(`\n✅ Sync completed:`);
    console.log(`   Total Processed: ${processedCount} enrollments`);
    console.log(`   Total Skipped: ${skippedCount} enrollments`);
    console.log(`   Total Errors: ${errorCount}`);
    console.log(`   Success Rate: ${((processedCount / (processedCount + skippedCount)) * 100).toFixed(1)}%`);
    console.log(`   Duration: ${(duration / 1000).toFixed(1)} seconds`);

    // Record sync log
    await prisma.rehydrationDate.create({
      data: {
        enrollment_count: processedCount,
        duration,
        status: "completed",
        error: errorCount > 0 ? `Completed with ${errorCount} errors` : null
      }
    });

    return res.status(200).json({
      message: "Rehydration completed",
      processed: processedCount,
      skipped: skippedCount,
      errors: errorCount,
      duration
    });

  } catch (error: any) {
    console.error("Rehydration error:", error);
    const duration = Date.now() - startTime;

    // Record failed sync
    await prisma.rehydrationDate.create({
      data: {
        enrollment_count: 0,
        duration,
        status: "failed",
        error: error.message
      }
    });

    return res.status(500).json({ error: error.message });
  }
}