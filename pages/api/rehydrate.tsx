import { getToken } from "next-auth/jwt"
import api from "../../lib/axios.setup"
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../lib/prismadb"
import { Enrollment, User } from "@prisma/client";
import { bigint_filter } from "./enrollments";

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
      // const { data: _data } = await api.get('/enrollments?limit=1')
      const { data } = await api.get(`/enrollments?limit=${limit}&query[updated_after]=${
        last_date?.created_at? 
        last_date.created_at.toISOString().split('T')[0] : '2023-05-01'}T00:00:00Z`)

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

      const user_list: Promise<User>[] = []

      const enrollments: Enrollment[] = await data.items.map(async (item: Data) => {
        let { user_email, user_name, ...data } = item
        user_email = user_email.toLowerCase()
        const user = users.find((user) => user.email === user_email)
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

      // asyncForEach(data.items, async (item: Data) => {
      //     let { user_email, user_name, ...data } = item
      //     user_email = user_email.toLowerCase()
      //     if (!userEmails.includes(user_email)) {
      //         console.warn('No User: ' + user_email);
      //         return;
      //     }
      //     const user = await prisma.user.findUnique({
      //         where: {
      //             email: user_email
      //         },
      //         include: {
      //             userCohort: true
      //         }
      //     })
      //     if (!user) {
      //         console.warn('No User: ' + user_email);
      //         return;
      //     }
      //     if (user.role != "APPLICANT") return;
      //     const userCohortId = user.userCohort.pop()?.id
      //     if (!userCohortId) {
      //         console.error(`User ${user.email} has no cohort`)
      //         return
      //     }
      //     if (user.thinkific_user_id === null) {
      //         const updated_user = prisma.user.update({
      //             where: { id: user.id },
      //             data: {
      //                 thinkific_user_id: `${item.user_id}`
      //             }
      //         })
      //         user_list.push(updated_user)
      //     }
      //     if (data.percentage_completed) {
      //         data.percentage_completed = parseFloat(data.percentage_completed)
      //     }
      //     const enrollment = prisma.enrollment.upsert({
      //         where: {
      //             id: data.id
      //         },
      //         update: {
      //             enrolled: true,
      //             ...data,
      //         },
      //         create: {
      //             userCohortId: userCohortId,
      //             enrolled: true,
      //             ...data
      //         }
      //     })

      //     enrollment_list.push(enrollment)
      // }).then(async (result) => {
      //     const enrollment_result = await Promise.allSettled(enrollment_list)
      //     const user_result = await Promise.allSettled(user_list)
      // }).catch(err => {
      //     console.error(err)
      //     return res.send(err.message)
      // })
      const date = await prisma.rehydrationDate.create({
        data: {
          enrollment_count: enrollments.length
        }
      })
      
      return res.send({ message: 'Synchronizing', count: enrollments.length })
    } catch (err) {
      console.error(err)
      return res.send(err.message)
    }
  }
}