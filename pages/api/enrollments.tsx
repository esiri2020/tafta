import {getToken} from 'next-auth/jwt';
import api from '../../lib/axios.setup';
import data from '../../input.json' assert {type: 'JSON'};
import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from '../../lib/prismadb';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime/library';

type Role = 'ADMIN' | 'APPLICANT' | 'SUPERADMIN' | 'SUPPORT' | 'USER' | 'GUEST';
type RegistrationType = 'INDIVIDUAL' | 'ORGANIZATION' | 'ENTERPRISE';

// Define our own types based on the schema
interface User {
  id: string;
  email: string;
  image: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  role: Role;
  type: RegistrationType | null;
  thinkific_user_id: string | null;
  profile: {
    id: string;
    ageRange?: string;
    stateOfResidence?: string;
    educationLevel?: string;
    gender?: string;
  } | null;
  userCohort: {
    enrollments: {
      course_name: string;
      course_id: bigint;
      enrolled: boolean;
    }[];
  }[];
}

interface Enrollment {
  id: bigint | null;
  uid: string;
  created_at: Date;
  course_id: bigint;
  course_name: string;
  enrolled: boolean | null;
  percentage_completed: number | null;
  expired: boolean | null;
  is_free_trial: boolean | null;
  completed: boolean | null;
  started_at: Date | null;
  activated_at: Date | null;
  completed_at: Date | null;
  updated_at: Date | null;
  expiry_date: Date | null;
  user_id: bigint | null;
  userCohort?: {
    id: string;
    user?: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      profile?: {
        gender: string;
      };
    };
    cohort?: {
      id: string;
      name: string;
    };
  };
}

export const bigint_filter = (data: Object) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await getToken({req});
  if (!token) {
    return res.status(401).send({
      error: 'Invalid authentication',
    });
  }

  if (req.method === 'GET') {
    try {
      const { user_email, page, limit, cohort } = req.query;
      
      // Handle pagination requests (admin dashboard)
      if (page !== undefined && limit !== undefined) {
        const pageNum = parseInt(page as string) || 0;
        const limitNum = parseInt(limit as string) || 10;
        const offset = pageNum * limitNum;
        
        let whereClause: any = {};
        
        // Add cohort filter if provided
        if (cohort) {
          whereClause.userCohort = {
            cohortId: cohort as string
          };
        }
        
        const enrollments = await prisma.enrollment.findMany({
          where: whereClause,
          include: {
            userCohort: {
              include: {
                cohort: true,
                user: {
                  include: {
                    profile: true
                  }
                }
              }
            }
          },
          skip: offset,
          take: limitNum,
          orderBy: {
            created_at: 'desc'
          }
        });
        
        const totalCount = await prisma.enrollment.count({
          where: whereClause
        });
        
        // Calculate statistics for the admin dashboard
        const whereCondition: any = cohort ? { userCohort: { cohortId: cohort as string } } : {};
        
        // Count total enrollments
        const count = await prisma.enrollment.count({
          where: whereCondition
        });

        // Count male and female enrollments
        let maleCount = 0;
        let femaleCount = 0;
        
        if (count > 0) {
          maleCount = await prisma.user.count({
            where: {
              profile: {
                gender: 'MALE',
              },
              userCohort: {
                some: {
                  // Apply cohort filter if specified
                  ...(whereCondition.userCohort?.cohortId ? {
                    cohortId: whereCondition.userCohort.cohortId,
                  } : {}),
                  enrollments: {
                    some: {
                      // Only count users with actual enrollments (not pending/expired)
                      enrolled: true,
                    },
                  },
                },
              },
            },
          });

          femaleCount = await prisma.user.count({
            where: {
              profile: {
                gender: 'FEMALE',
              },
              userCohort: {
                some: {
                  // Apply cohort filter if specified
                  ...(whereCondition.userCohort?.cohortId ? {
                    cohortId: whereCondition.userCohort.cohortId,
                  } : {}),
                  enrollments: {
                    some: {
                      // Only count users with actual enrollments (not pending/expired)
                      enrolled: true,
                    },
                  },
                },
              },
            },
          });
        }

        // Count unique users by status (not enrollment records) - consistent with dashboard logic
        const baseUserWhere = {
          userCohort: {
            some: {
              // Apply cohort filter if specified
              ...(whereCondition.userCohort?.cohortId ? {
                cohortId: whereCondition.userCohort.cohortId,
              } : {}),
              enrollments: {
                some: {
                  // Apply course filter if specified
                  ...(whereCondition.course_id ? {
                    course_id: whereCondition.course_id,
                  } : {}),
                },
              },
            },
          },
        };

        const activeCount = await prisma.user.count({
          where: {
            ...baseUserWhere,
            userCohort: {
              some: {
                ...baseUserWhere.userCohort.some,
                enrollments: {
                  some: {
                    ...baseUserWhere.userCohort.some.enrollments.some,
                    completed: false,
                    expired: false,
                    enrolled: true,
                  },
                },
              },
            },
          },
        });

        const completedCount = await prisma.user.count({
          where: {
            ...baseUserWhere,
            userCohort: {
              some: {
                ...baseUserWhere.userCohort.some,
                enrollments: {
                  some: {
                    ...baseUserWhere.userCohort.some.enrollments.some,
                    completed: true,
                  },
                },
              },
            },
          },
        });

        const expiredCount = await prisma.user.count({
          where: {
            ...baseUserWhere,
            userCohort: {
              some: {
                ...baseUserWhere.userCohort.some,
                enrollments: {
                  some: {
                    ...baseUserWhere.userCohort.some.enrollments.some,
                    expired: true,
                  },
                },
              },
            },
          },
        });

        const pendingCount = await prisma.user.count({
          where: {
            ...baseUserWhere,
            userCohort: {
              some: {
                ...baseUserWhere.userCohort.some,
                enrollments: {
                  some: {
                    ...baseUserWhere.userCohort.some.enrollments.some,
                    activated_at: null,
                  },
                },
              },
            },
          },
        });

        console.log('Enrollments API - Final counts:', {
          count,
          maleCount,
          femaleCount,
          activeCount,
          completedCount,
          expiredCount,
          pendingCount,
        });

        return res.status(200).json(bigint_filter({
          enrollments,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limitNum)
          },
          // Use filtered count instead of unfiltered count
          count: totalCount,
          maleCount,
          femaleCount,
          activeCount,
          completedCount,
          expiredCount,
          pendingCount,
        }));
      }
      
      // Handle user-specific enrollment requests
      if (!user_email) {
        return res.status(400).send({
          error: 'user_email parameter is required for user-specific requests',
        });
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: (user_email as string).toLowerCase() },
        include: {
          userCohort: {
            include: {
              cohort: true,
              enrollments: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(404).send({
          error: 'User not found',
        });
      }

      // Return user with enrollments in the expected format
      const response = {
        ...user,
        enrollments: user.userCohort?.[0]?.enrollments || []
      };
      
      return res.status(200).json(bigint_filter(response));
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      return res.status(500).send({
        error: 'Internal server error',
      });
    }
  }

  if (req.method === 'POST') {
    let {user_email, userCohortId, ...data} =
      typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    user_email = user_email.toLowerCase();

    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: {email: user_email},
        include: {
          userCohort: {
            include: {
              cohort: true,
            },
          },
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
        return res.status(404).send({message: 'User profile not found'});
      }

      if (data.percentage_completed) {
        data.percentage_completed = parseFloat(data.percentage_completed);
      }

      const enrollment = await prisma.enrollment.create({
        data: {
          enrolled: false,
          ...data,
          userCohort: {
            connect: {id: user.userCohort[0]?.id},
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
        [minRange, maxRange] = ageRange.split('-').map(Number);
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
          `User with name does not have a valid age range specified`,
        );
      }

      // Check location
      const allowedLocations = ['lagos', 'kano', 'ogun'];
      if (!location || !allowedLocations.includes(location)) {
        console.error(`User with name is not in an allowed location`);
      }

      // Check level of education
      const allowedEducationLevels = [
        'secondary_school',
        'college_of_education',
        'nd_hnd',
        'bsc',
        'msc',
      ];
      if (!educationLevel || !allowedEducationLevels.includes(educationLevel)) {
        console.error(
          `User with name does not meet the education level requirement`,
        );
      }

      console.log(minRange, maxRange, location, educationLevel);

      let is_eligible = false;

      if (
        minRange >= 16 &&
        maxRange <= 35 &&
        (location === 'lagos' || location === 'ogun' || location === 'kano') &&
        (educationLevel === 'bsc' || educationLevel === 'msc')
      ) {
        is_eligible = true;
      }

      console.log('is_eligible: ', is_eligible);

      // Always allow enrollment - remove restrictive eligibility requirements
      // Users can be enrolled regardless of age, location, or education level
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
            .post('/users', taftaAPIData)
            .catch(error => {
              // console.log(error);
              //   return res
              //     .status(400)
              //     .send({ message: error.response?.data || error.message });
              // });
              console.error(
                'LMS user creation failed:',
                error.response?.data || error.message,
              );
              return null;
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
            console.log('updatedUser: ', updatedUser);
            promises.push(Promise.resolve(updatedUser as any));

            const thinkific_data = {
              course_id: course_id,
              user_id: response.data.id,
              activated_at: new Date(Date.now()).toISOString(),
              // expiry_date: user?.userCohort?.pop()?.cohort?.end_date ? new Date(user?.userCohort?.pop()?.cohort?.end_date ).toISOString()
            };
            const response3 = await api.post('/enrollments', thinkific_data);
            if (response3.status === 201) {
              const {data: enrollment_data} = response3;
              let {user_email, user_name, ...data} = enrollment_data;
              if (data.percentage_completed) {
                data.percentage_completed = parseFloat(
                  data.percentage_completed,
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
              console.log('enrollment : ', enrollment);

              const groupName = user.userCohort[0]?.cohort?.name;
              const thinkificUserId = response?.data.id;
              if (groupName && thinkificUserId) {
                try {
                  const groupRes = await api.post('/group_users', {
                    group_names: [groupName],
                    user_id: thinkificUserId,
                  });
                  console.log('User added to Thinkific group:', groupRes.data);
                } catch (err) {
                  if (err instanceof Error) {
                    console.error(
                      'Failed to add user to Thinkific group:',
                      err.message,
                    );
                  } else {
                    console.error(
                      'Failed to add user to Thinkific group:',
                      err,
                    );
                  }
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
          const response3 = await api.post('/enrollments', thinkific_data);
          if (response3.status === 201) {
            const {data: enrollment_data} = response3;
            let {user_email, user_name, ...data} = enrollment_data;
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

            console.log('enrollment', enrollment);

            const groupName = user.userCohort[0]?.cohort?.name;
            const thinkificUserId = user.thinkific_user_id;
            if (groupName && thinkificUserId) {
              try {
                const groupRes = await api.post('/group_users', {
                  group_names: [groupName],
                  user_id: thinkificUserId,
                });
                console.log('User added to Thinkific group:', groupRes.data);
              } catch (err) {
                if (err instanceof Error) {
                  console.error(
                    'Failed to add user to Thinkific group:',
                    err.message,
                  );
                } else {
                  console.error('Failed to add user to Thinkific group:', err);
                }
              }
            }
          }
        }

        return res
          .status(201)
          .send(bigint_filter({message: 'Enrollment created', ...enrollment}));
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        return res.status(400).send(err.message);
      }
      return res.status(400).send('An error occurred');
    }
  }

  if (req.method === 'PUT') {
    let {user_email, ...data} = JSON.parse(req.body);
    user_email = user_email.toLowerCase();

    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: {email: user_email},
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
        .send(bigint_filter({message: 'Enrollment created', ...enrollment}));
    } catch (err) {
      console.error(err);
      if (err instanceof PrismaClientKnownRequestError)
        return res.status(404).send({message: 'User not found'});
      return res.status(500).send({
        error: 'E no work.',
      });
    }
  }
  const {
    page,
    limit,
    course: _course,
    status,
    cohort,
    gender,
    search,
    dateFrom,
    dateTo,
  }: {
    page?: string;
    limit?: string;
    course?: string;
    status?: string;
    cohort?: string;
    gender?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  } = req.query;
  const cohorts = cohort?.length ? cohort.split(',') : [];
  const course = _course?.length ? _course.split(',') : undefined;
  const take = parseInt(typeof limit == 'string' && limit ? limit : '10');
  const skip = take * parseInt(typeof page == 'string' ? page : '0');
  let count, enrollments;
  let maleCount = 0;
  let femaleCount = 0;
  let totalCount = 0;

  // Get cohort-specific course IDs for filtering
  const cohortCourseIds = cohorts.length > 0 ? await prisma.cohortCourse.findMany({
    where: { 
      cohortId: { in: cohorts }
    },
    select: { course_id: true },
  }).then(results => results.map(r => r.course_id)) : [];

  // Debug logging
  console.log('Enrollments API - cohorts:', cohorts);
  console.log('Enrollments API - cohortCourseIds:', cohortCourseIds);

  // Define search condition
  let whereCondition: any = {};

  // Base conditions
  if (cohorts.length > 0) {
    whereCondition.userCohort = {
      cohortId: {
        in: cohorts,
      },
    };
    // Only include enrollments for courses that belong to the selected cohorts
    if (cohortCourseIds.length > 0) {
      whereCondition.course_id = {
        in: cohortCourseIds,
      };
    }
  }

  // Course filter - if both course and cohort filters exist, intersect them
  if (course?.length) {
    if (whereCondition.course_id) {
      // If we already have a course_id filter (from cohort), intersect them
      const cohortCourseIdsSet = new Set(cohortCourseIds);
      const filteredCourseIds = course
        .map(e => BigInt(e))
        .filter(id => cohortCourseIdsSet.has(id));
      whereCondition.course_id = {
        in: filteredCourseIds,
      };
    } else {
      // No existing course filter, just use the course filter
      whereCondition.course_id = {
        in: course.map(e => BigInt(e)),
      };
    }
  }

  // Date range filter
  if (dateFrom && dateTo) {
    whereCondition.activated_at = {
      gte: dateFrom,
      lte: dateTo,
    };
  }

  // Status filter
  if (status) {
    switch (status) {
      case 'expired':
        whereCondition.expired = true;
        break;
      case 'completed':
        whereCondition.completed = true;
        break;
      case 'active':
        whereCondition.completed = false;
        whereCondition.expired = false;
        whereCondition.enrolled = true;
        break;
      case 'pending':
        whereCondition.activated_at = null;
        break;
    }
  }

  // Search filter
  if (search) {
    // If userCohort already exists in the condition, extend it
    if (whereCondition.userCohort) {
      whereCondition.userCohort.user = {
        OR: [
          {firstName: {contains: search, mode: 'insensitive'}},
          {lastName: {contains: search, mode: 'insensitive'}},
          {email: {contains: search, mode: 'insensitive'}},
        ],
      };
    } else {
      // Otherwise create it
      whereCondition.userCohort = {
        user: {
          OR: [
            {firstName: {contains: search, mode: 'insensitive'}},
            {lastName: {contains: search, mode: 'insensitive'}},
            {email: {contains: search, mode: 'insensitive'}},
          ],
        },
      };
    }
  }

  // Gender filter
  if (gender) {
    if (whereCondition.userCohort) {
      if (whereCondition.userCohort.user) {
        whereCondition.userCohort.user.profile = {
          gender: gender.toUpperCase(),
        };
      } else {
        whereCondition.userCohort.user = {
          profile: {
            gender: gender.toUpperCase(),
          },
        };
      }
    } else {
      whereCondition.userCohort = {
        user: {
          profile: {
            gender: gender.toUpperCase(),
          },
        },
      };
    }
  }

  try {
    if (
      (course && course.length) ||
      (status && status.length) ||
      (cohorts && cohorts.length) ||
      (dateFrom && dateTo) ||
      search ||
      gender
    ) {
      // Use the whereCondition for queries
      count = await prisma.enrollment.count({
        where: whereCondition,
      });

      enrollments = await prisma.enrollment.findMany({
        where: whereCondition,
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
              cohort: true, // Include cohort details
            },
          },
        },
        take,
        skip,
      });

      // Calculate male count with the same base filters
      const maleWhereCondition = {...whereCondition};
      if (maleWhereCondition.userCohort?.user?.profile) {
        maleWhereCondition.userCohort.user.profile.gender = 'MALE';
      } else if (maleWhereCondition.userCohort?.user) {
        maleWhereCondition.userCohort.user.profile = {gender: 'MALE'};
      } else if (maleWhereCondition.userCohort) {
        maleWhereCondition.userCohort.user = {profile: {gender: 'MALE'}};
      } else {
        maleWhereCondition.userCohort = {user: {profile: {gender: 'MALE'}}};
      }

      // Remove any gender filter that might already exist
      if (gender) {
        maleWhereCondition.userCohort.user.profile = {gender: 'MALE'};
      }

      maleCount = await prisma.enrollment.count({
        where: maleWhereCondition,
      });

      // Calculate female count
      const femaleWhereCondition = {...whereCondition};
      if (femaleWhereCondition.userCohort?.user?.profile) {
        femaleWhereCondition.userCohort.user.profile.gender = 'FEMALE';
      } else if (femaleWhereCondition.userCohort?.user) {
        femaleWhereCondition.userCohort.user.profile = {gender: 'FEMALE'};
      } else if (femaleWhereCondition.userCohort) {
        femaleWhereCondition.userCohort.user = {profile: {gender: 'FEMALE'}};
      } else {
        femaleWhereCondition.userCohort = {user: {profile: {gender: 'FEMALE'}}};
      }

      // Remove any gender filter that might already exist
      if (gender) {
        femaleWhereCondition.userCohort.user.profile = {gender: 'FEMALE'};
      }

      femaleCount = await prisma.enrollment.count({
        where: femaleWhereCondition,
      });
    } else {
      // Count unique users with enrollments (not enrollment records) - same logic as dashboard
      count = await prisma.user.count({
        where: {
          userCohort: {
            some: {
              // Apply cohort filter if specified
              ...(whereCondition.userCohort?.cohortId ? {
                cohortId: whereCondition.userCohort.cohortId,
              } : {}),
              enrollments: {
                some: {
                  // Apply course filter if specified
                  ...(whereCondition.course_id ? {
                    course_id: whereCondition.course_id,
                  } : {}),
                  // Only count users with actual enrollments (not pending/expired)
                  enrolled: true,
                },
              },
            },
          },
        },
      });

      // Calculate male and female counts using the same user-based logic
      maleCount = await prisma.user.count({
        where: {
          profile: {
            gender: 'MALE',
          },
          userCohort: {
            some: {
              // Apply cohort filter if specified
              ...(whereCondition.userCohort?.cohortId ? {
                cohortId: whereCondition.userCohort.cohortId,
              } : {}),
              enrollments: {
                some: {
                  // Apply course filter if specified
                  ...(whereCondition.course_id ? {
                    course_id: whereCondition.course_id,
                  } : {}),
                  // Only count users with actual enrollments (not pending/expired)
                  enrolled: true,
                },
              },
            },
          },
        },
      });

      femaleCount = await prisma.user.count({
        where: {
          profile: {
            gender: 'FEMALE',
          },
          userCohort: {
            some: {
              // Apply cohort filter if specified
              ...(whereCondition.userCohort?.cohortId ? {
                cohortId: whereCondition.userCohort.cohortId,
              } : {}),
              enrollments: {
                some: {
                  // Apply course filter if specified
                  ...(whereCondition.course_id ? {
                    course_id: whereCondition.course_id,
                  } : {}),
                  // Only count users with actual enrollments (not pending/expired)
                  enrolled: true,
                },
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

    return res.status(200).send({
      enrollments,
    });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) {
      return res.status(400).send(err.message);
    }
    return res.status(400).send('An error occurred');
  }
}

// const groupByKey = (list: Array<Record<string, any >>, key: string) => list.reduce((hash, obj) => ({...hash, [obj[key]]:( hash[obj[key]] || [] ).concat(obj)}), {})
