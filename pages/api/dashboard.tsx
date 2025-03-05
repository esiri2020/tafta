import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prismadb";

interface Profile {
  ageRange: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const token = await getToken({ req });
    if (!token || !token.userData) {
      return res.status(401).send({
        error:
          "You must be signed in to view the protected content on this page.",
      });
    }
    if (
      token.userData.role !== "SUPERADMIN" &&
      token.userData.role !== "ADMIN"
    ) {
      return res.status(403).send({
        error: "Unauthorized.",
      });
    }
    const { cohortId }: { cohortId?: string } = req.query;

    if (!cohortId) return res.status(400);

    const total_enrolled_by_courses = await prisma.enrollment.count({
      where: {
        userCohort: {
          cohortId,
        },
      },
    });
    const total_enrolled_applicants = await prisma.user.count({
      where: {
        userCohort: {
          some: {
            cohortId,
            enrollments: {
              some: {},
            },
          },
        },
      },
    });
    const female_enrollments = await prisma.user.count({
      where: {
        profile: {
          gender: {
            equals: "FEMALE",
          },
        },
        userCohort: {
          some: {
            cohortId,
            enrollments: {
              some: {},
            },
          },
        },
      },
    });
    const male_enrollments = await prisma.user.count({
      where: {
        profile: {
          gender: {
            equals: "MALE",
          },
        },
        userCohort: {
          some: {
            cohortId,
            enrollments: {
              some: {},
            },
          },
        },
      },
    });
    const active_enrollees = await prisma.user.count({
      where: {
        userCohort: {
          some: {
            cohortId,
            enrollments: {
              some: {
                AND: [
                  {
                    started_at: {
                      not: null,
                    },
                  },
                  {
                    completed: {
                      equals: false,
                    },
                  },
                ],
              },
            },
          },
        },
      },
    });
    const certified_enrollees = await prisma.user.count({
      where: {
        userCohort: {
          some: {
            cohortId,
            enrollments: {
              some: {
                completed: {
                  equals: true,
                },
              },
            },
          },
        },
      },
    });
    const total_applicants = await prisma.user.count({
      where: {
        userCohort: {
          some: {
            cohortId,
          },
        },
      },
    });
    const enrollment_completion_graph =
      await prisma.enrollmentCompletionGraph.findMany({
        where: {
          date: {
            not: null,
          },
          count: {
            not: 0,
          },
        },
      });
    const inactive_enrollments = await prisma.enrollment.count({
      where: {
        started_at: {
          equals: null,
        },
        userCohort: {
          cohortId,
        },
      },
    });

    // Define the age ranges in descending order
    const ageRanges = [
      { min: 16, max: 20, label: "16-20" },
      { min: 21, max: 25, label: "21-25" },
      { min: 26, max: 30, label: "26-30" },
      { min: 31, max: 35, label: "31-35" },
      { min: 36, max: 40, label: "36-40" },
      { min: 41, max: 45, label: "41-45" },
      { min: 46, max: 50, label: "46-50" },
      { min: 51, max: 55, label: "51-55" },
      { min: 56, max: 60, label: "56-60" },
      { min: 61, max: 65, label: "61-65" },
      // Add more age ranges as needed
    ];

    // Initialize an object to store the counts for each age group
    const ageGroupCounts: Record<string, number> = {};

    // Fetch profiles from the database
    const profiles = await prisma.profile.findMany();

    profiles.forEach((profile: Profile) => {
      const ageRange = profile.ageRange;
      if (ageRange && ageRange.match(/^\d+\s*-\s*\d+$/)) {
        // Extract the minimum and maximum ages from the 'ageRange' field
        const [minAgeStr, maxAgeStr] = ageRange.split("-");
        const minAge = parseInt(minAgeStr.trim());
        const maxAge = parseInt(maxAgeStr.trim());

        // Find the corresponding age range
        const ageRangeObj = ageRanges.find(
          (range) => minAge >= range.min && maxAge <= range.max
        );

        // If the age falls within one of the defined age ranges, increment the count
        if (ageRangeObj) {
          if (!ageGroupCounts[ageRangeObj.label]) {
            ageGroupCounts[ageRangeObj.label] = 0;
          }
          ageGroupCounts[ageRangeObj.label]++;
        }
      }
    });

    // Now, ageRanges will be in descending order and ageGroupCounts will have the counts

    // Convert the ageGroupCounts object into an array of objects with keys 'ageRange' and 'count'
    const age_range = Object.entries(ageGroupCounts)
      .map(([ageRange, count]) => ({
        ageRange,
        count,
      }))
      .sort((a, b) => {
        // Extract the minimum ages from the ageRange labels
        const aMinAge = parseInt(a.ageRange.split("-")[0]);
        const bMinAge = parseInt(b.ageRange.split("-")[0]);

        // Sort in descending order based on the minimum ages
        return bMinAge - aMinAge;
      })
      .reverse();

    const locations = [
      "Abia",
      "Adamawa",
      "Akwa Ibom",
      "Anambra",
      "Bauchi",
      "Bayelsa",
      "Benue",
      "Borno",
      "Cross River",
      "Delta",
      "Ebonyi",
      "Edo",
      "Ekiti",
      "Enugu",
      "FCT - Abuja",
      "Gombe",
      "Imo",
      "Jigawa",
      "Kaduna",
      "Kano",
      "Katsina",
      "Kebbi",
      "Kogi",
      "Kwara",
      "Lagos",
      "Nasarawa",
      "Niger",
      "Ogun",
      "Ondo",
      "Osun",
      "Oyo",
      "Plateau",
      "Rivers",
      "Sokoto",
      "Taraba",
      "Yobe",
      "Zamfara",
    ];

    const locationCounts = await Promise.all(
      locations.map(async (location) => {
        const count = await prisma.user.count({
          where: {
            profile: {
              stateOfResidence: {
                equals: location,
              },
            },
            userCohort: {
              some: {
                cohortId,
              },
            },
          },
        });
        return { location, count };
      })
    );

    // const coursesByLocation: Record<string, number> = {};
    // for (const location of locations) {
    //   const locationData = await prisma.location.findFirst({
    //     where: {
    //       name: location,
    //     },
    //     select: {
    //       id: true,
    //     },
    //   });

    //   if (locationData) {
    //     const enrollmentCount = await prisma.enrollment.count({
    //       where: {
    //         userCohort: {
    //           some: {
    //             AND: [
    //               { cohortId: { equals: cohortId } },
    //               { locationId: { equals: locationData.id } },
    //             ],
    //           },
    //         },
    //       },
    //     });

    //     coursesByLocation[location] = enrollmentCount;
    //   } else {
    //     coursesByLocation[location] = 0;
    //   }
    // }

    // Filter locations with count greater than 1
    const location = locationCounts.filter((item) => item.count > 0);
    // const courses_by_location = Object.fromEntries(
    //   Object.entries(coursesByLocation).filter(([location, count]) => count > 0)
    // );

    // Fetching status of residency data
    const statusOfResidency = {
      refugee: await prisma.user.count({
        where: {
          profile: {
            residencyStatus: {
              equals: "REFUGEE",
            },
          },
          userCohort: {
            some: {
              cohortId,
            },
          },
        },
      }),
      migrant_workers: await prisma.user.count({
        where: {
          profile: {
            residencyStatus: {
              equals: "MIGRANT_WORKER",
            },
          },
          userCohort: {
            some: {
              cohortId,
            },
          },
        },
      }),
      idp: await prisma.user.count({
        where: {
          profile: {
            residencyStatus: {
              equals: "IDP",
            },
          },
          userCohort: {
            some: {
              cohortId,
            },
          },
        },
      }),
      resident: await prisma.user.count({
        where: {
          profile: {
            residencyStatus: {
              equals: "RESIDENT",
            },
          },
          userCohort: {
            some: {
              cohortId,
            },
          },
        },
      }),
    };

    return res.send(
      JSON.stringify({
        total_enrolled_by_courses: total_enrolled_by_courses.toString(),
        total_enrolled_applicants: total_enrolled_applicants.toString(),
        female_enrollments: female_enrollments.toString(),
        male_enrollments: male_enrollments.toString(),
        active_enrollees: active_enrollees.toString(),
        certified_enrollees: certified_enrollees.toString(),
        total_applicants: total_applicants.toString(),
        enrollment_completion_graph: enrollment_completion_graph.map(
          (item) => ({
            date: item.date,
            count: item.count.toString(),
          })
        ),
        inactive_enrollments: inactive_enrollments.toString(),
        age_range: age_range.map((item) => ({
          ageRange: item.ageRange,
          count: item.count.toString(),
        })),
        location: location.map((item) => ({
          location: item.location,
          count: item.count.toString(),
        })),
        statusOfResidency: {
          refugee: statusOfResidency.refugee.toString(),
          migrant_workers: statusOfResidency.migrant_workers.toString(),
          idp: statusOfResidency.idp.toString(),
          resident: statusOfResidency.resident.toString(),
        },
      })
    );
  } catch (err) {
    console.error(err);
    res.send({
      error: err.message,
    });
  }
}
