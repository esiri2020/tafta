import { getToken } from "next-auth/jwt";
import api from "../../lib/axios.setup";
import data from "../../input.json" assert { type: "JSON" };
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prismadb";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Enrollment, User } from "@prisma/client";

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
      const user = await prisma.user.findUniqueOrThrow({
        where: { email: user_email },
        include: {
          userCohort: true,
        },
      });

      const userProfile = await prisma.profile.findUnique({
        where: {
          userId: user.id, // Assuming userId matches the user's email
        },
        select: {
          ageRange: true,
          stateOfResidence: true,
          educationLevel: true,
        },
      });

      if (!userProfile) {
        return res.status(404).send({ message: "User profile not found" });
      }

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

      const ageRange = userProfile.ageRange;
      const location = userProfile.stateOfResidence?.toLowerCase();
      const educationLevel = userProfile.educationLevel?.toLowerCase();

      let minRange, maxRange;
      maxRange = 0;
      minRange = 0;

      if (ageRange !== undefined && ageRange !== null) {
        [minRange, maxRange] = ageRange.split("-").map(Number);
        if (
          !isNaN(minRange) &&
          !isNaN(maxRange) &&
          minRange < 16 &&
          maxRange > 35
        ) {
          console.error(`User with name does not have a valid age range`);
        }
      } else {
        console.error(
          `User with name does not have a valid age range specified`
        );
      }

      // Check location
      const allowedLocations = ["lagos", "kano", "ogun"];
      if (!location || !allowedLocations.includes(location)) {
        console.error(`User with name is not in an allowed location`);
      }

      // Check level of education
      const allowedEducationLevels = [
        "secondary_school",
        "college_of_education",
        "nd_hnd",
        "bsc",
        "msc",
      ];
      if (!educationLevel || !allowedEducationLevels.includes(educationLevel)) {
        console.error(
          `User with name does not meet the education level requirement`
        );
      }

      // If all requirements are met, register on LMS
      if (
        minRange >= 16 &&
        maxRange <= 35 &&
        (location === "lagos" || location === "ogun" || location === "kano") &&
        (educationLevel === "bsc" || educationLevel === "msc")
      ) {
        const promises: Promise<User>[] = [];
        const enrollment_promises: Promise<Enrollment>[] = [];

        const activeEnrollment = enrollment; // Get the first enrollment
        const course_id = `${activeEnrollment?.course_id}`;
        const enrollmentUID = `${activeEnrollment?.uid}`;

        if (user.thinkific_user_id === null) {
          const taftaAPIData = {
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            skip_custom_fields_validation: true,
            send_welcome_email: true,
          };

          const response = await api
            .post("/users", taftaAPIData)
            .catch((error) => {
              // console.log(error);
              //   return res
              //     .status(400)
              //     .send({ message: error.response?.data || error.message });
              // });
            });
          if (response?.status === 201) {
            const promises: Promise<User>[] = [];

            const updatedUserPromise = prisma.user.update({
              where: {
                id: user.id,
              },
              data: {
                thinkific_user_id: `${response?.data.id}`,
              },
              include: {
                profile: {
                  select: {
                    id: true,
                  },
                },
                userCohort: {
                  select: {
                    enrollments: {
                      select: {
                        enrolled: true,
                        course_name: true,
                        course_id: true,
                      },
                    },
                  },
                },
              },
            });

            // Wait for the promise to resolve
            const updatedUser = await updatedUserPromise;
            console.log("updatedUser: ", updatedUser);
            promises.push(Promise.resolve(updatedUser));

            const thinkific_data = {
              course_id: course_id,
              user_id: response.data.id,
              activated_at: new Date(Date.now()).toISOString(),
              // expiry_date: user?.userCohort?.pop()?.cohort?.end_date ? new Date(user?.userCohort?.pop()?.cohort?.end_date ).toISOString()
            };
            const response3 = await api.post("/enrollments", thinkific_data);
            if (response3.status === 201) {
              const { data: enrollment_data } = response3;
              let { user_email, user_name, ...data } = enrollment_data;
              if (data.percentage_completed) {
                data.percentage_completed = parseFloat(
                  data.percentage_completed
                );
              }

              const enrollment_promises: Promise<Enrollment>[] = [];

              const enrollmentPromise = prisma.enrollment.update({
                where: {
                  uid: enrollmentUID,
                },
                data: {
                  enrolled: true,
                  ...data,
                },
              });

              const enrollment = await enrollmentPromise; // Use await here
              enrollment_promises.push(Promise.resolve(enrollment));
              console.log("enrollment : ", enrollment);
            }
          }

          // const response2 = await api.post('/group_users', {
          //     group_names: [user.userCohort.pop()?.cohort.name],
          //     user_id: response.data.id
          // })
        } else {
          const thinkific_data = {
            course_id: course_id,
            user_id: user.thinkific_user_id,
            activated_at: new Date(Date.now()).toISOString(),
            // expiry_date: user?.userCohort?.pop()?.cohort?.end_date ? new Date(user?.userCohort?.pop()?.cohort?.end_date ).toISOString()
          };
          const response3 = await api.post("/enrollments", thinkific_data);
          if (response3.status === 201) {
            const { data: enrollment_data } = response3;
            let { user_email, user_name, ...data } = enrollment_data;
            if (data.percentage_completed) {
              data.percentage_completed = parseFloat(data.percentage_completed);
            }
            const enrollment = prisma.enrollment.update({
              where: {
                uid: enrollmentUID,
              },
              data: {
                enrolled: true,
                ...data,
              },
            });
            enrollment_promises.push(enrollment);

            console.log("enrollment", enrollment);
          }
        }

        return res
          .status(201)
          .send(
            bigint_filter({ message: "Enrollment created", ...enrollment })
          );
      } else {
        // Send a response indicating that the user doesn't meet the requirements but has been enrolled
        return res.status(400).send({
          error:
            "User does not meet one or more requirements but has been enrolled.",
        });
      }
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
