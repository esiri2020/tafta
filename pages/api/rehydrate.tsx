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
      console.log('Starting rehydration process...');
      const limit = 100000
      const last_date = await prisma.rehydrationDate.findFirst({
        orderBy: {
          created_at: 'desc'
        }
      })
      
      console.log('Last rehydration date:', last_date?.created_at);
      
      // Force fresh data by adding a timestamp to the URL
      const timestamp = new Date().getTime();
      const { data } = await api.get(`/enrollments?limit=${limit}&_t=${timestamp}`)

      // Log only essential enrollment data
      console.log('\n=== THINKIFIC ENROLLMENTS ===');
      console.log('Total enrollments:', data.items.length);
      
      // Log completion statistics
      const completionStats = data.items.reduce((acc: any, item: Data) => {
        const status = item.completed ? 'completed' : 
                      item.percentage_completed > 0 ? 'in_progress' : 'not_started';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      console.log('Completion stats:', completionStats);

      const userEmails = data.items.map((item: Data) => item.user_email.toLowerCase())
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
      })

      console.log('\n=== USER MATCHING ===');
      console.log('Found users:', users.length, 'out of', userEmails.length, 'enrollments');

      const user_list: Promise<any>[] = []
      let processedCount = 0;
      let skippedCount = 0;
      let roleMismatchCount = 0;
      let noCohortCount = 0;

      const enrollments: any[] = await Promise.all(data.items.map(async (item: Data) => {
        let { user_email, user_name, ...data } = item
        user_email = user_email.toLowerCase()
        const user = users.find((user) => user.email.toLowerCase() === user_email)
        
        if (!user) {
          skippedCount++;
          return;
        }
        if (user.role !== "APPLICANT") {
          roleMismatchCount++;
          return;
        }
        const userCohortId = user.userCohort.at(-1)?.id
        if (!userCohortId) {
          noCohortCount++;
          return
        }
        processedCount++;

        // Handle percentage_completed
        if (typeof data.percentage_completed !== 'number' || isNaN(data.percentage_completed)) {
          data.percentage_completed = data.completed ? 100 : 0;
        }

        // Ensure completed status is boolean
        data.completed = Boolean(data.completed);

        const enrollment = await prisma.enrollment.upsert({
          where: {
            id: data.id
          },
          update: {
            enrolled: true,
            ...data,
            userCohort: {
              connect: { id: userCohortId }
            }
          },
          create: {
            enrolled: true,
            ...data,
            userCohort: {
              connect: { id: userCohortId }
            }
          }
        })

        return enrollment
      }))

      console.log('\n=== PROCESSING SUMMARY ===');
      console.log({
        totalEnrollments: data.items.length,
        processedCount,
        skippedCount,
        roleMismatchCount,
        noCohortCount,
        updatedCount: enrollments.length,
        completionStats
      });
      
      return res.send({ message: 'Synchronizing', count: enrollments.length })
    } catch (err) {
      console.error(err)
      if (err instanceof Error) {
        return res.send(err.message)
      }
      return res.send('An error occurred')
    }
  }
}