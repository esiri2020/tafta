import { getToken } from "next-auth/jwt";
import api from "../../lib/axios.setup";
import data from "../../input.json";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prismadb";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { useGetApplicantQuery } from "../../services/api";
import { Enrollment, User } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).send({
      error:
        "You must be signed in to view the protected content on this page.",
    });
  }

  if (req.method === "PATCH") {
    let { applicants } =
      typeof req.body === "object" ? req.body : JSON.parse(req.body);

    try {
      let responseSent = false; // Add a boolean flag to track whether a response has been sent

      const responses = [];

      for (let applicant of applicants) {
        const _users = await prisma.user.findMany({
          where: {
            id: {
              in: applicant,
            },
            role: "APPLICANT",
          },
          include: {
            userCohort: {
              include: {
                cohort: true,
                enrollments: true,
              },
            },
          },
        });

        const profile = await prisma.profile.findMany({
          where: {
            userId: {
              in: applicant,
            },
          },
        });

        console.log(_users[0].firstName);

        // Check if profile data is available for the user
        if (!profile || profile.length === 0) {
          console.error(
            `User with name ${_users[0].firstName} does not have a profile`
          );
          continue; // Skip to the next applicant
        }

        // Access the relevant fields from the user's profile
        const ageRange = profile[0].ageRange;
        const location = profile[0].stateOfResidence?.toLowerCase();
        const educationLevel = profile[0].educationLevel?.toLowerCase();

        if (!ageRange) {
          console.error(
            `User with name ${_users[0].firstName} does not have an age range specified`
          );
          continue; // Skip to the next applicant
        }
        const [minRange, maxRange] = ageRange.split("-").map(Number);
        if (minRange < 16 || maxRange > 35) {
          console.error(
            `User with name ${_users[0].firstName} does not have a valid age range`
          );
          continue; // Skip to the next applicant
        }

        // Check location
        const allowedLocations = ["lagos", "kano", "ogun"];
        if (!location || !allowedLocations.includes(location)) {
          console.error(
            `User with name ${_users[0].firstName} is not in an allowed location`
          );
          continue; // Skip to the next applicant
        }

        // Check level of education
        const allowedEducationLevels = [
          "secondary_school",
          "college_of_education",
          "nd_hnd",
          "bsc",
          "msc",
        ];
        if (
          !educationLevel ||
          !allowedEducationLevels.includes(educationLevel)
        ) {
          console.error(
            `User with ID ${_users[0].firstName} does not meet the education level requirement`
          );
          continue; // Skip to the next applicant
        }

        if (!_users.length) {
          // Send a response indicating that the user was not found
          // res.status(404).send({ error: "User not found" });
          // responses.push
          // Break out of the loop since a response has been sent
          break;
        }

        const promises: Promise<User>[] = [];
        const enrollment_promises: Promise<Enrollment>[] = [];

        for (let user of _users) {
          const active_enrollment = user?.userCohort?.pop()?.enrollments?.pop();
          const course_id = `${active_enrollment?.course_id}`;
          const enrollmentUID = `${active_enrollment?.uid}`;

          console.log(user.thinkific_user_id);
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
            console.log(response);
            if (response?.status === 201) {
              const updatedUser = prisma.user.update({
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
              console.log(updatedUser);
              promises.push(updatedUser);
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
              }
              const groupName = user.userCohort[0]?.cohort?.name;
              const thinkificUserId = response?.data.id;
              if (!groupName || !thinkificUserId) {
                console.warn('Missing groupName or thinkificUserId for group assignment:', { groupName, thinkificUserId });
              } else {
                try {
                  const groupRes = await api.post('/group_users', {
                    group_names: [groupName],
                    user_id: thinkificUserId
                  });
                  console.log('User added to Thinkific group:', groupRes.data);
                } catch (err) {
                  if (err instanceof Error) {
                    console.error('Failed to add user to Thinkific group:', err.message);
                  } else {
                    console.error('Failed to add user to Thinkific group:', err);
                  }
                }
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
                data.percentage_completed = parseFloat(
                  data.percentage_completed
                );
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
              const groupName = user.userCohort[0]?.cohort?.name;
              const thinkificUserId = user.thinkific_user_id;
              if (!groupName || !thinkificUserId) {
                console.warn('Missing groupName or thinkificUserId for group assignment:', { groupName, thinkificUserId });
              } else {
                try {
                  const groupRes = await api.post('/group_users', {
                    group_names: [groupName],
                    user_id: thinkificUserId
                  });
                  console.log('User added to Thinkific group:', groupRes.data);
                } catch (err) {
                  if (err instanceof Error) {
                    console.error('Failed to add user to Thinkific group:', err.message);
                  } else {
                    console.error('Failed to add user to Thinkific group:', err);
                  }
                }
              }
            }
          }
        }
        // Always allow enrollment - remove restrictive eligibility requirements
        responses.push({
          success: true,
          message: `${_users[0].firstName} is enrolled successfully.`,
        });
      }

      // After the loop is finished, check if a response has been sent, and if not, send a default response
      if (!responseSent) {
        res.status(200).send(responses);
      }
    } catch (err) {
      console.error(err);

      // Instead of sending the response here, set the error message in a variable.
      const errorMessage = "Error occurred during enrollment.";

      // Use the error message in the final response after the loop has finished processing.
      return res.status(500).send({ error: errorMessage });
    }
  }

  // ...
}
