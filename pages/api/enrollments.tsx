import { getToken } from "next-auth/jwt";
import api from "../../lib/axios.setup";
import data from "../../input.json" assert { type: "JSON" };
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prismadb";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const bigint_filter = (data: Object) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).send({
      error: "Invalid authentication",
    });
  }

  if (req.method === "POST") {
    let { user_email, userCohortId, ...data } =
      typeof req.body === "object" ? req.body : JSON.parse(req.body);
    user_email = user_email.toLowerCase();

    try {
      // set enrolled to true when uncommenting this out
      // const transaction = await prisma.$transaction(async (tx)=> {
      //   const user = await tx.user.findUniqueOrThrow({
      //     where: { email: user_email },
      //     include: {
      //       userCohort: true
      //     }
      //   })
      //   const userCohort = await tx.userCohort.findUniqueOrThrow({
      //     where:{
      //       id: data.userCohortId
      //     },
      //     include:{
      //       cohort: true
      //     }
      //   })
      //   const thinkific_data = {
      //     course_id: data.course_id,
      //     user_id: user.thinkific_user_id,
      //     activated_at: new Date(Date.now()).toISOString(),
      //     expiry_date: new Date(userCohort.cohort.end_date).toISOString()
      //   }
      //   const response = await api.post('/enrollments', thinkific_data)
      //   console.log(response)
      //   if(response.status===201){
      //     if (data.percentage_completed) {
      //       data.percentage_completed = parseFloat(data.percentage_completed)
      //     }

      //     const enrollment = await tx.enrollment.create({
      //       data: {
      //         enrolled: true,
      //         ...data,
      //         userCohort: {
      //           connect: {id: data.userCohortId}
      //         }
      //       }
      //     })
      //     return enrollment
      //   }
      //   return data
      // })
      const user = await prisma.user.findUniqueOrThrow({
        where: { email: user_email },
        include: {
          userCohort: true,
        },
      });

      if (data.percentage_completed) {
        data.percentage_completed = parseFloat(data.percentage_completed);
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          enrolled: false,
          ...data,
          userCohort: {
            connect: { id: user.userCohort[0]?.id },
          },
        },
      });
      //Send success response
      return res
        .status(201)
        .send(bigint_filter({ message: "Enrollment created", ...enrollment }));
    } catch (err) {
      console.error(err);
      if (err instanceof PrismaClientKnownRequestError)
        return res.status(404).send({ message: "User not found" });
      return res.status(500).send({
        error: "E no work.",
      });
    }
  }

  if (req.method === "PUT") {
    let { user_email, ...data } = JSON.parse(req.body);
    console.log(data, user_email);
    user_email = user_email.toLowerCase();

    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: { email: user_email },
      });

      const enrollment = await prisma.enrollment.upsert({
        where: {
          id: data.id,
        },
        update: {
          ...data,
          enrolled: data.id ? true : false,
        },
        create: {
          userId: user.id,
          ...data,
          enrolled: data.id ? true : false,
        },
      });
      //Send success response
      return res
        .status(201)
        .send(bigint_filter({ message: "Enrollment created", ...enrollment }));
    } catch (err) {
      console.error(err);
      if (err instanceof PrismaClientKnownRequestError)
        return res.status(404).send({ message: "User not found" });
      return res.status(500).send({
        error: "E no work.",
      });
    }
  }
  const {
    page,
    limit,
    course: _course,
    status,
    cohort,
  }: {
    page?: string;
    limit?: string;
    course?: string;
    status?: string;
    cohort?: string;
  } = req.query;
  const cohorts = cohort?.length ? cohort.split(",") : [];
  const course = _course?.length ? _course.split(",") : undefined;
  const take = parseInt(typeof limit == "string" && limit ? limit : "10");
  const skip = take * parseInt(typeof page == "string" ? page : "0");
  let count, enrollments, status_object;
  let maleCount = 0;
  let femaleCount = 0;
  let totalCount = 0;

  if (status) {
    switch (status) {
      case "expired":
        status_object = {
          expired: true,
        };
        break;
      case "completed":
        status_object = {
          completed: true,
        };
        break;
      case "active":
        status_object = {
          completed: false,
          expired: false,
          percentage_completed: {
            gt: 0,
          },
        };
        break;

      default:
        status_object = {};
        break;
    }
  }
  try {
    if (
      (course && course.length) ||
      (status && status.length) ||
      (cohorts && cohorts.length)
    ) {
      count = await prisma.enrollment.count({
        where: {
          course_id: course?.length
            ? {
                in: course.map((e) => BigInt(e)),
              }
            : undefined,
          userCohort:
            cohorts.length > 0
              ? {
                  cohortId: {
                    in: cohorts,
                  },
                }
              : undefined,
          ...status_object,
        },
      });
      enrollments = await prisma.enrollment.findMany({
        where: {
          course_id: course?.length
            ? {
                in: course.map((e) => BigInt(e)),
              }
            : undefined,
          userCohort:
            cohorts.length > 0
              ? {
                  cohortId: {
                    in: cohorts,
                  },
                }
              : undefined,
          ...status_object,
        },
        // include: {
        //   userCohort: {
        //     select: {
        //       user: {
        //         select: {
        //           id: true,
        //           firstName: true,
        //           lastName: true,
        //           email: true,
        //           profile: {
        //             select: {
        //               gender: true,
        //             },
        //           },
        //         },
        //       },
        //     },
        //   },
        // },
        // take,
        // skip,
        include: {
          userCohort: {
            select: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  profile: {
                    select: {
                      gender: true,
                    },
                  },
                },
              },
            },
          },
        },
        take,
        skip,
      });

      // Calculate male and female counts based on the total count
      maleCount = await prisma.enrollment.count({
        where: {
          AND: [
            {
              course_id: course?.length
                ? { in: course.map((e) => BigInt(e)) }
                : undefined,
            },
            {
              userCohort:
                cohorts.length > 0 ? { cohortId: { in: cohorts } } : undefined,
            },
          ],
          ...status_object,
          userCohort: {
            user: {
              profile: {
                gender: "MALE",
              },
            },
          },
        },
      });

      femaleCount = await prisma.enrollment.count({
        where: {
          AND: [
            {
              course_id: course?.length
                ? { in: course.map((e) => BigInt(e)) }
                : undefined,
            },
            {
              userCohort:
                cohorts.length > 0 ? { cohortId: { in: cohorts } } : undefined,
            },
          ],
          ...status_object,
          userCohort: {
            user: {
              profile: {
                gender: "FEMALE",
              },
            },
          },
        },
      });
    } else {
      count = await prisma.enrollment.count({});
      // Calculate male and female counts based on the total count
      maleCount = await prisma.enrollment.count({
        where: {
          AND: [
            {
              course_id: course?.length
                ? { in: course.map((e) => BigInt(e)) }
                : undefined,
            },
            {
              userCohort:
                cohorts.length > 0 ? { cohortId: { in: cohorts } } : undefined,
            },
          ],
          ...status_object,
          userCohort: {
            user: {
              profile: {
                gender: "MALE",
              },
            },
          },
        },
      });

      femaleCount = await prisma.enrollment.count({
        where: {
          AND: [
            {
              course_id: course?.length
                ? { in: course.map((e) => BigInt(e)) }
                : undefined,
            },
            {
              userCohort:
                cohorts.length > 0 ? { cohortId: { in: cohorts } } : undefined,
            },
          ],
          ...status_object,
          userCohort: {
            user: {
              profile: {
                gender: "FEMALE",
              },
            },
          },
        },
      });
      enrollments = await prisma.enrollment.findMany({
        include: {
          userCohort: {
            select: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  profile: {
                    select: {
                      gender: true,
                    },
                  },
                },
              },
            },
          },
        },
        take,
        skip,
      });
    }

    enrollments = bigint_filter(enrollments);
    console.log(count, maleCount, femaleCount);

    return res.status(200).send({ enrollments, count, maleCount, femaleCount });
  } catch (err) {
    console.error(err.message);
    return res.status(400).send(err.message);
  }
}

// const groupByKey = (list: Array<Record<string, any >>, key: string) => list.reduce((hash, obj) => ({...hash, [obj[key]]:( hash[obj[key]] || [] ).concat(obj)}), {})
