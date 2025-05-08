import type { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import prisma from "../../../../lib/prismadb"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req })
  if (!token) {
    return res.status(401).send({
      error: "You must be signed in to view the protected content on this page.",
    })
  }
  if (token.userData?.role !== 'SUPERADMIN') {
    return res.status(403).send({
      error: "Unauthorized.",
    })
  }

  const { id }: { id?: string } = req.query
  if (!id) return res.status(400).json({ message: "ID not supplied" });

  // Create usercohort
  if (req.method === 'POST') {
    const body = typeof (req.body) === 'object' ? req.body : JSON.parse(req.body)
    const { emails }: { emails: string[] } = body
    try {
      let users = await prisma.user.findMany({
        where: {
          AND: [
            {
              email: {
                in: emails
              }
            },
            {
              userCohort: {
                some: {
                  NOT: {
                    cohortId: id
                  }
                }
              }
            }
          ]
        }
      })

      const cohort = await prisma.cohort.update({
        where: {
          id
        },
        data: {
          userCohort: {
            createMany: {
              data: users.map(user => ({
                userId: user.id
              }))
            }
          }
        }
      })
      return res.status(200).send({ message: 'success', cohort })
    } catch (err) {
      console.error(err)
<<<<<<< HEAD
      return res.status(400).send(err instanceof Error ? err.message : 'An unknown error occurred')
=======
      if (err instanceof Error) {
        return res.status(400).send(err.message)
      }
      return res.status(400).send('An error occurred')
>>>>>>> 31ff53017003a0538b28a39456a22b39183ff621
    }
  }

  if (req.method === 'PATCH') {
    const body = typeof (req.body) === 'object' ? req.body : JSON.parse(req.body)
    const { cohortCourses, centers, values } = body
    try {
      const cohort = await prisma.cohort.update({
        where: {
          id: id
        },
        data: {
          ...values,
          cohortCourses: cohortCourses?.length ? {
            upsert: cohortCourses.map((c: any) => ({
              create: {
                course_id: BigInt(c.course_id),
                course_limit: c.course_limit,
                courseId: c.course_id
              },
              update: {
                course_id: BigInt(c.course_id),
                course_limit: c.course_limit,
                courseId: c.course_id
              },
              where: { id: c.id || '' }
            }))
          } : undefined,
          centers: centers.length ? {
            upsert: centers.map((c: any) => ({
              create: {
                location: c.location,
                seats: c.numberOfSeats,
                name: c.centerName,
              },
              update: {
                location: c.location,
                seats: c.numberOfSeats,
                name: c.centerName,
              },
              where: { id: c.id || '' }
            }))
          } : undefined
        }
      })

      return res.status(202).send({ message: 'success', cohort })
    } catch (err) {
      console.error(err)
<<<<<<< HEAD
      return res.status(400).send(err instanceof Error ? err.message : 'An unknown error occurred')
=======
      if (err instanceof Error) {
        return res.status(400).send(err.message)
      }
      return res.status(400).send('An error occurred')
>>>>>>> 31ff53017003a0538b28a39456a22b39183ff621
    }
  }

  if (req.method === 'DELETE') {
    try {
      const result = await prisma.cohort.delete({
        where: { id }
      })
      return res.status(200).send({ message: 'Cohort Deleted', result })
    } catch (err) {
      console.error(err)
<<<<<<< HEAD
      return res.status(400).send(err instanceof Error ? err.message : 'An unknown error occurred')
=======
      if (err instanceof Error) {
        return res.status(400).send(err.message)
      }
      return res.status(400).send('An error occurred')
>>>>>>> 31ff53017003a0538b28a39456a22b39183ff621
    }
  }

  try {
    const cohort = await prisma.cohort.findUnique({
      where: {
        id
      },
    });

    if (!cohort) {
      return res.status(404).json({ message: "Invalid ID" });
    }

    res.json({ message: "success", cohort });
  } catch (error) {
    console.error(error);
    res.status(400).json({ 
      message: "Something went wrong",
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }

}