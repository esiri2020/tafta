import {getToken} from 'next-auth/jwt';
import api from '../../../lib/axios.setup';
import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from '../../../lib/prismadb';
import {Enrollment, User} from '@prisma/client';

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
          }
        }
      }
      const results = await Promise.allSettled(promises);
      const enrollments_results = await Promise.allSettled(enrollment_promises);
      return res.status(201).send({message: 'success'});
    } catch (error) {
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
    } catch (err) {
      console.error(err);
      return res.status(400).send(err.message);
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
  const c = prisma.user.findMany({
    where: {
      userCohort: userCohortFilter,
    },
  });

  try {
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
                  },
                },
                cohort: true,
              },
            },
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
                  },
                },
                cohort: true,
              },
            },
          },
          take,
          skip,
        });
      }
    } else if (filter === 'MALE' || filter === 'FEMALE') {
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
                },
              },
              cohort: true,
            },
          },
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
                },
              },
              cohort: true,
            },
          },
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
                },
              },
              cohort: true,
            },
          },
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
                },
              },
              cohort: true,
            },
          },
        },
        take,
        skip,
      });
    }

    return res.status(200).json({applicants, count});
  } catch (err) {
    console.error(err.message);
    return res.status(400).send(err.message);
  }
}
