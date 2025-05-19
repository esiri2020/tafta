import { getToken } from "next-auth/jwt"
import api from "../../../lib/axios.setup"
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../../lib/prismadb"
import { bigint_filter } from "../enrollments"
import type { Prisma } from '.prisma/client'

// TODO: Create cohort group on thinkific on cohort creation. ✔️

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle POST request
  if (req.method === "POST") {
    try {
      const token = await getToken({ req })
      if (!token || !token.userData || token.userData.role !== "SUPERADMIN") {
        return res.status(401).json({ error: "Unauthorized." })
      }

      const { cohortCourses, centers, values } = typeof (req.body) === 'object' ? req.body : JSON.parse(req.body)
      
      const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const cohort = await tx.cohort.create({
          data: {
            ...values,
            cohortCourses: cohortCourses?.length ? {
              createMany: {
                data: cohortCourses.map(({course_id, course_limit}: 
                  {course_id: string,course_limit: string})=> ({
                  course_id: BigInt(course_id), 
                  course_limit, 
                  courseId: course_id
                }))
              }
            } : undefined,
            centers: centers?.length ? {
              create: centers.map((c: { location: any; numberOfSeats: any; centerName: any }) => ({
                location: c.location,
                seats: c.numberOfSeats,
                name: c.centerName,
              }))
            } : undefined
          }
        })
        
        const { data: { group } } = await api.post('/groups', { name: values.name })
        return { cohort, group }
      })

      return res.status(201).json({ message: 'success', ...result })
    } catch (err) {
      console.error('Error creating cohort:', err)
      return res.status(400).json({ 
        message: err instanceof Error ? err.message : 'An error occurred',
        error: err instanceof Error ? err.stack : undefined
      })
    }
  }

  // Handle GET request
  try {
    console.log('Query parameters:', req.query)

    const { 
      page = '0', 
      limit = '100', 
      filter: _filter, 
      query 
    } = req.query

    // Parse filter parameter
    let filter: boolean | undefined
    if (_filter === 'true') filter = true
    else if (_filter === 'false') filter = false

    const take = parseInt(limit as string)
    const skip = take * parseInt(page as string)

    console.log('Processed parameters:', { take, skip, filter })

    const [count, cohorts] = await Promise.all([
      prisma.cohort.count({
        where: { active: filter }
      }),
      prisma.cohort.findMany({
        where: { active: filter },
        include: {
          cohortCourses: true,
          CohortToLocation: {
            include: {
              Location: true
            }
          }
        },
        take,
        skip
      })
    ])

    return res.status(200).json({ 
      message: 'success', 
      cohorts: bigint_filter(cohorts), 
      count,
      params: { page, limit, filter: _filter, query }
    })
  } catch (err) {
    console.error('Error fetching cohorts:', err)
    return res.status(400).json({ 
      message: err instanceof Error ? err.message : 'An error occurred',
      error: err instanceof Error ? err.stack : undefined
    })
  }
}