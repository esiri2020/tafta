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
      if (err instanceof Error) {
        return res.status(400).send(err.message)
      }
      return res.status(400).send('An error occurred')
    }
  }

  if (req.method === 'PATCH') {
    const body = typeof (req.body) === 'object' ? req.body : JSON.parse(req.body)
    const { cohortCourses = [], centers = [], values } = body
    
    try {
      // Use transaction to handle cohort update with courses/locations
      const result = await prisma.$transaction(async (tx) => {
        // Update the cohort basic info
        const updatedCohort = await tx.cohort.update({
          where: { id },
          data: {
            name: String(values.name),
            start_date: new Date(values.start_date),
            end_date: new Date(values.end_date),
            active: Boolean(values.active),
            color: String(values.color),
          },
        });

        // Handle cohort courses
        if (Array.isArray(cohortCourses)) {
          // Delete existing cohort courses
          await tx.cohortCourse.deleteMany({
            where: { cohortId: id }
          });

          // Create new cohort courses
          if (cohortCourses.length > 0) {
            await tx.cohortCourse.createMany({
              data: cohortCourses.map((cc: any) => ({
                cohortId: id,
                courseId: String(cc.course_id),
                course_id: BigInt(cc.course_id),
                course_limit: parseInt(cc.course_limit) || 0,
              })),
            });
          }
        }

        // Handle locations (centers)
        if (Array.isArray(centers)) {
          // For locations, we'll just create new ones since they're not directly linked to cohorts
          if (centers.length > 0) {
            await tx.location.createMany({
              data: centers.map((center: any) => ({
                name: center.centerName,
                location: center.location,
                seats: parseInt(center.numberOfSeats) || 0,
              })),
            });
          }
        }

        return updatedCohort;
      });

      return res.status(202).send({ message: 'success', cohort: result });
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        return res.status(400).send(err.message);
      }
      return res.status(400).send('An error occurred');
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
      if (err instanceof Error) {
        return res.status(400).send(err.message)
      }
      return res.status(400).send('An error occurred')
    }
  }

  try {
    const cohort = await prisma.cohort.findUnique({
      where: {
        id
      },
      include: {
        cohortCourses: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
              }
            }
          }
        },
        // Note: centers are stored as locations and linked via CohortToLocation
      },
    });

    if (!cohort) {
      return res.status(404).json({ message: "Invalid ID" });
    }

    // Serialize BigInt values to strings
    const serializedCohort = {
      ...cohort,
      cohortCourses: cohort.cohortCourses?.map(cc => ({
        ...cc,
        course_id: cc.course_id.toString(), // Convert BigInt to string
      })) || []
    };

    res.json({ message: "success", cohort: serializedCohort });
  } catch (error) {
    console.error(error);
    res.status(400).json({ 
      message: "Something went wrong",
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    });
  }

}