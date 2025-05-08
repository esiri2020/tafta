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
  if (req.method === 'GET') {
    try {
      const limit = 100000
      const last_date = await prisma.rehydrationDate.findFirst({
        orderBy: {
          created_at: 'desc'
        }
      })
      const { data } = await api.get(`/enrollments?limit=${limit}&query[updated_after]=${
        last_date?.created_at? 
        last_date.created_at.toISOString().split('T')[0] : '2023-05-01'}T00:00:00Z`)

      const userEmails = data.items.map((item: Data) => item.user_email.toLowerCase())
      const users = await prisma.user.findMany({
        select: {
          email: true,
          id: true,
          role: true,
          userCohort: {
            select: {
              id: true
            }
          },
          thinkific_user_id: true
        }
      }) as ThinkificUser[]

      const user_list: Promise<User>[] = []

      const enrollments: Enrollment[] = await data.items.map(async (item: Data) => {
        let { user_email, user_name, ...data } = item
        user_email = user_email.toLowerCase()
        const user = users.find((u: ThinkificUser) => u.email === user_email)
        if (!user) {
          console.warn('No User: ' + user_email);
          return;
        }
        if (user.role !== "APPLICANT") return;
        const userCohortId = user.userCohort.at(-1)?.id
        if (!userCohortId) {
          console.error(`User ${user.email} has no cohort`)
          return
        }
        if (user.thinkific_user_id === null) {
          const updated_user = prisma.user.update({
            where: { id: user.id },
            data: {
              thinkific_user_id: `${item.user_id}`
            }
          })
          user_list.push(updated_user)
        }
        if (data.percentage_completed) {
          data.percentage_completed = parseFloat(data.percentage_completed)
        }
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
      })

      if (user_list.length > 0) {
        await Promise.allSettled(user_list)
      }

      const date = await prisma.rehydrationDate.create({
        data: {
          enrollment_count: enrollments.length
        }
      })
      
      return res.send({ message: 'Synchronizing', count: enrollments.length })
    } catch (err) {
      console.error(err)
<<<<<<< HEAD
      return res.send(err instanceof Error ? err.message : 'An unknown error occurred')
=======
      if (err instanceof Error) {
      return res.send(err.message)
      }
      return res.send('An error occurred')
>>>>>>> 31ff53017003a0538b28a39456a22b39183ff621
    }
  }
}