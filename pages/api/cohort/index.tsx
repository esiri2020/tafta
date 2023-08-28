import { getToken } from "next-auth/jwt"
import api from "../../../lib/axios.setup"
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../../lib/prismadb"
import { bigint_filter } from "../enrollments"

// TODO: Create cohort group on thinkific on cohort creation. ✔️

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const token = await getToken({ req })
    if (!token || !token.userData || token.userData.role !== "SUPERADMIN") {
      return res.status(401).send({
        error: "Unauthorized.",
      })
    }
    const { cohortCourses, centers, values } = typeof (req.body) === 'object' ? req.body : JSON.parse(req.body)
    try {
      return await prisma.$transaction(async (tx) => {
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
        return res.status(201).send({ message: 'success', cohort, group })
      })
    } catch (err) {
      console.error(err.message)
      return res.status(400).send({ message: err.message })
    }
  }
  try {
    const { page, limit, filter: _filter, query }: {
      page?: string,
      limit?: string,
      filter?: any,
      query?: string
    } = req.query;
    let filter: boolean | undefined
    if (_filter) {
      switch (_filter) {
        case 'true':
          filter = true
          break;
        case 'false':
          filter = false
          break;
        case 'undefined':
        default:
          filter = undefined
          break;
      }
    }
    const take = parseInt(typeof (limit) == 'string' && limit ? limit : '100')
    const skip = take * parseInt(typeof (page) == 'string' ? page : '0')
    let count, cohorts;
    count = await prisma.cohort.count({
      where: {
        active: filter,
      }
    })
    cohorts = await prisma.cohort.findMany({
      where: {
        active: filter
      },
      include: {
        cohortCourses: true,
        centers: true
      },
      take,
      skip
    })

    return res.status(200).send({ message: 'success', cohorts: bigint_filter(cohorts), count })
  } catch (err) {
    console.error(err.message)
    return res.status(400).send({ message: err.message })
  }
}