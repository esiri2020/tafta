import {getToken} from 'next-auth/jwt';
import api from '../../../lib/axios.setup';
import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from '../../../lib/prismadb';
import {Enrollment, User} from '@prisma/client';
import {bigint_filter} from '../enrollments';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await getToken({req});
  if (!token) {
    return res.status(401).send({
      error:
        'You must be signed in to view the protected content on this page.',
    });
  }
  // Approve Applicant
  if (req.method === 'PATCH') {
    if (
      token?.userData?.role !== 'SUPERADMIN' &&
      token?.userData?.role !== 'ADMIN'
    ) {
      return res.status(403).send({
        error: 'Unauthorized.',
      });
    }
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    try {
      const _users = await prisma.user.findMany({
        where: {
          id: {
            in: body.ids,
          },
          role: 'APPLICANT',
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
      if (!_users.length) {
        return res.status(404).send({error: 'user not found'});
      }
      const promises: Promise<User>[] = [];
      const enrollment_promises: Promise<Enrollment>[] = [];
      for (let user of _users) {
        const active_enrollment = user?.userCohort?.pop()?.enrollments?.pop();
        const course_id = `${active_enrollment?.course_id}`;
        const enrollmentUID = `${active_enrollment?.uid}`;
        if (user.thinkific_user_id === null) {
          const taftaAPIData = {
            email: user.email,
            first_name: user.firstName,
            last_name: user.lastName,
            middle_name: user.middleName,
            skip_custom_fields_validation: true,
            send_welcome_email: true,
          };
          const response = await api
            .post('/users', taftaAPIData)
            .catch(error => {
              return res
                .status(400)
                .send({message: error.response?.data || error.message});
            });
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
                  include: {
                    referrer: true
                  }
                },
                userCohort: {
                  include: {
                    enrollments: true,
                    cohort: true,
                    location: true
                  },
                },
                assessment: true,
              },
            });
            promises.push(updatedUser);
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
      const results = await Promise.allSettled(promises);
      const enrollments_results = await Promise.allSettled(enrollment_promises);
      return res.status(201).send({message: 'success'});
    } catch (error: any) {
      console.error(error.response?.data || error);
      return res
        .status(400)
        .send({message: error.response?.data || error.message});
    }
  }
  if (req.method === 'DELETE') {
    if (token?.userData?.role !== 'SUPERADMIN') {
      return res.status(403).send({
        error: 'Unauthorized.',
      });
    }
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    try {
      const result = await prisma.user.deleteMany({
        where: {
          id: {in: body.ids},
          role: 'APPLICANT',
        },
      });
      return res.status(200).send({message: 'Users Deleted'});
    } catch (err: any) {
      console.error(err);
      if (err instanceof Error) {
        return res.status(400).send(err.message);
      }
      return res.status(400).send('An error occurred');
    }
  }
  // Pagination
  const {
    page,
    limit,
    filter,
    query,
    cohortId,
  }: {
    page?: string;
    limit?: string;
    filter?: string;
    query?: string;
    cohortId?: string;
  } = req.query;

  const take = parseInt(typeof limit == 'string' && limit ? limit : '30');
  const skip = take * parseInt(typeof page == 'string' ? page : '0');
  let count, applicants;
  const userCohortFilter = cohortId
    ? {
        some: {
          cohortId: cohortId,
        },
      }
    : undefined;

  // Parse the filter if it's a stringified JSON object
  interface FilterParams {
    gender?: string[];
    status?: string[];
    ageRange?: string[];
    educationLevel?: string[];
    employmentStatus?: string[];
    residencyStatus?: string[];
    communityArea?: string[];
    talpParticipation?: boolean | null;
    type?: string[];
    location?: string[];
    lga?: string[];
    [key: string]: any; // Add index signature to allow indexing with string
  }

  let parsedFilter: string | FilterParams | undefined = filter;

  try {
    if (filter && filter !== 'undefined' && filter !== '[object Object]' && filter !== '{}') {
      parsedFilter = JSON.parse(filter) as FilterParams;
    } else {
      parsedFilter = undefined;
    }
  } catch (e) {
    console.log('Filter parsing error:', e);
    // Keep the original filter value if parsing fails
    parsedFilter = undefined;
  }

  try {
    let filteredOutCount = 0;
    let filteredOutSample: any[] = [];
    let filterConditions: any = null;

    if (query) {
      const isEmail =
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
      if (isEmail.test(query)) {
        count = await prisma.user.count({
          where: {
            role: 'APPLICANT',
            email: {
              search: query,
            },
          },
        });
        applicants = await prisma.user.findMany({
          where: {
            role: 'APPLICANT',
            email: {
              search: query,
            },
          },
          include: {
            profile: {
              include: {
                referrer: true
              }
            },
            userCohort: {
              include: {
                enrollments: true,
                cohort: true,
                location: true
              },
            },
            assessment: true,
          },
          take,
          skip,
        });
      } else {
        count = await prisma.user.count({
          where: {
            role: 'APPLICANT',
            OR: [
              {
                firstName: {
                  search: query.split(' ').join(' | '),
                },
                lastName: {
                  search: query.split(' ').join(' | '),
                },
              },
            ],
          },
        });
        applicants = await prisma.user.findMany({
          where: {
            role: 'APPLICANT',
            OR: [
              {
                firstName: {
                  search: query.split(' ').join(' | '),
                },
                lastName: {
                  search: query.split(' ').join(' | '),
                },
              },
            ],
          },
          include: {
            profile: {
              include: {
                referrer: true
              }
            },
            userCohort: {
              include: {
                enrollments: true,
                cohort: true,
                location: true
              },
            },
            assessment: true,
          },
          take,
          skip,
        });
      }
    }
    // Check if parsedFilter is an object (complex filter)
    else if (
      typeof parsedFilter === 'object' &&
      parsedFilter !== null &&
      parsedFilter !== undefined
    ) {
      // Build filter conditions based on the parsed filter object
      filterConditions = {
        role: 'APPLICANT',
        userCohort: userCohortFilter,
      };

      // Add profile conditions if there are any profile-related filters
      const profileConditions: any = {};

      // Handle gender filter
      if (parsedFilter.gender && parsedFilter.gender.length > 0) {
        profileConditions.gender = {in: parsedFilter.gender};
      }

      // Handle age range filter
      if (parsedFilter.ageRange && parsedFilter.ageRange.length > 0) {
        profileConditions.ageRange = {in: parsedFilter.ageRange};
      }

      // Handle education level filter
      if (
        parsedFilter.educationLevel &&
        parsedFilter.educationLevel.length > 0
      ) {
        profileConditions.educationLevel = {in: parsedFilter.educationLevel};
      }

      // Handle employment status filter
      if (
        parsedFilter.employmentStatus &&
        parsedFilter.employmentStatus.length > 0
      ) {
        profileConditions.employmentStatus = {
          in: parsedFilter.employmentStatus,
        };
      }

      // Handle residency status filter
      if (
        parsedFilter.residencyStatus &&
        parsedFilter.residencyStatus.length > 0
      ) {
        profileConditions.residencyStatus = {in: parsedFilter.residencyStatus};
      }

      // Handle community area filter
      if (parsedFilter.communityArea && parsedFilter.communityArea.length > 0) {
        profileConditions.communityArea = {in: parsedFilter.communityArea};
      }

      // Handle TALP participation filter
      if (
        parsedFilter.talpParticipation !== null &&
        parsedFilter.talpParticipation !== undefined
      ) {
        profileConditions.talpParticipation = parsedFilter.talpParticipation;
      }

      // Handle type of applicant filter
      if (parsedFilter.type && parsedFilter.type.length > 0) {
        profileConditions.type = {in: parsedFilter.type};
      }

      // Handle location filter
      if (parsedFilter.location && parsedFilter.location.length > 0) {
        profileConditions.stateOfResidence = {in: parsedFilter.location};
      }

      // Handle LGA filter
      if (parsedFilter.lga && parsedFilter.lga.length > 0) {
        profileConditions.LGADetails = {in: parsedFilter.lga};
      }

      // Add profile conditions if any were set
      if (Object.keys(profileConditions).length > 0) {
        filterConditions.profile = profileConditions;
      }

      // Handle application status filters
      if (parsedFilter.status && parsedFilter.status.length > 0) {
        // Handle the different status types
        const statusFilters = [];

        if (parsedFilter.status.includes('approved')) {
          statusFilters.push({thinkific_user_id: {not: null}});
        }

        if (parsedFilter.status.includes('pending')) {
          statusFilters.push({
            thinkific_user_id: null,
            profile: {is: null},
          });
        }

        if (parsedFilter.status.includes('completed')) {
          statusFilters.push({
            thinkific_user_id: null,
            profile: {isNot: null},
          });
        }

        if (statusFilters.length > 0) {
          filterConditions.OR = statusFilters;
        }
      }

      // Apply the constructed filter conditions
      count = await prisma.user.count({
        where: filterConditions,
      });

      applicants = await prisma.user.findMany({
        where: filterConditions,
        include: {
          profile: {
            include: {
              referrer: true
            }
          },
          userCohort: {
            include: {
              enrollments: true,
              cohort: true,
              location: true
            },
          },
          assessment: true,
        },
        take,
        skip,
      });
    }
    // Handle case when no filters are applied (parsedFilter is undefined)
    else if (parsedFilter === undefined) {
      count = await prisma.user.count({
        where: {
          role: 'APPLICANT',
          userCohort: userCohortFilter,
        },
      });
      applicants = await prisma.user.findMany({
        where: {
          role: 'APPLICANT',
          userCohort: userCohortFilter,
        },
        include: {
          profile: {
            include: {
              referrer: true
            }
          },
          userCohort: {
            include: {
              enrollments: true,
              cohort: true,
              location: true
            },
          },
          assessment: true,
        },
        take,
        skip,
      });
    }
    // Handle the existing string filter types
    else if (filter === 'MALE' || filter === 'FEMALE') {
      count = await prisma.user.count({
        where: {
          role: 'APPLICANT',
          profile: {
            gender: filter,
          },
          userCohort: userCohortFilter,
        },
      });
      applicants = await prisma.user.findMany({
        where: {
          role: 'APPLICANT',
          profile: {
            gender: filter,
          },
          userCohort: userCohortFilter,
        },
        include: {
          profile: {
            include: {
              referrer: true
            }
          },
          userCohort: {
            include: {
              enrollments: true,
              cohort: true,
              location: true
            },
          },
          assessment: true,
        },
        take,
        skip,
      });
    } else if (filter === 'Active') {
      count = await prisma.user.count({
        where: {
          role: 'APPLICANT',
          userCohort: {
            some: {
              enrollments: {
                some: {
                  expired: false,
                  completed: false,
                },
              },
              cohortId,
            },
          },
        },
      });
      applicants = await prisma.user.findMany({
        where: {
          role: 'APPLICANT',
          userCohort: {
            some: {
              enrollments: {
                some: {
                  expired: false,
                  completed: false,
                },
              },
              cohortId,
            },
          },
        },
        include: {
          profile: {
            include: {
              referrer: true
            }
          },
          userCohort: {
            include: {
              enrollments: true,
              cohort: true,
              location: true
            },
          },
          assessment: true,
        },
        take,
        skip,
      });
    } else if (filter === 'awaiting_approval') {
      count = await prisma.user.count({
        where: {
          role: 'APPLICANT',
          thinkific_user_id: null,
          userCohort: userCohortFilter,
        },
      });
      applicants = await prisma.user.findMany({
        where: {
          role: 'APPLICANT',
          thinkific_user_id: null,
          userCohort: userCohortFilter,
        },
        include: {
          profile: {
            include: {
              referrer: true
            }
          },
          userCohort: {
            include: {
              enrollments: true,
              cohort: true,
              location: true
            },
          },
          assessment: true,
        },
        take,
        skip,
      });
    } else {
      count = await prisma.user.count({
        where: {
          role: 'APPLICANT',
          userCohort: userCohortFilter,
        },
      });
      applicants = await prisma.user.findMany({
        where: {
          role: 'APPLICANT',
          userCohort: userCohortFilter,
        },
        include: {
          profile: {
            include: {
              referrer: true
            }
          },
          userCohort: {
            include: {
              enrollments: true,
              cohort: true,
              location: true
            },
          },
          assessment: true,
        },
        take,
        skip,
      });
    }

    // After getting the matching applicants, get a sample of those who don't match
    if (
      typeof parsedFilter === 'object' &&
      parsedFilter !== null &&
      parsedFilter !== undefined &&
      Object.keys(parsedFilter).some(key => {
        const value = parsedFilter[key];
        return Array.isArray(value)
          ? value.length > 0
          : value !== null && value !== undefined;
      }) &&
      filterConditions !== null
    ) {
      // Build inverse filter conditions to get filtered out applicants
      const inverseFilterConditions: any = {
        role: 'APPLICANT',
        userCohort: userCohortFilter,
        NOT: {},
      };

      // Copy the original filter conditions for the NOT clause
      if (filterConditions && filterConditions.profile) {
        inverseFilterConditions.NOT.profile = {...filterConditions.profile};
      }

      if (filterConditions && filterConditions.OR) {
        inverseFilterConditions.NOT.OR = [...filterConditions.OR];
      }

      // Get count of filtered out applicants
      filteredOutCount = await prisma.user.count({
        where: inverseFilterConditions,
      });

      // Get a sample of filtered out applicants (first 10)
      if (filteredOutCount > 0) {
        filteredOutSample = await prisma.user.findMany({
          where: inverseFilterConditions,
          include: {
            profile: {
              include: {
                referrer: true
              }
            },
            userCohort: {
              include: {
                enrollments: true,
                cohort: true,
                location: true
              },
            },
            assessment: true,
          },
          take: 10, // Just get 10 samples
        });
      }
    }

    return res.status(200).json(
      bigint_filter({
        applicants,
        count,
        filteredOutCount,
        filteredOutSample,
      })
    );
  } catch (err: any) {
    console.error(err.message);
    return res.status(400).send(err.message);
  }
}
