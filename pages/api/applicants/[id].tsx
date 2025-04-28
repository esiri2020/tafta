import type {NextApiRequest, NextApiResponse} from 'next';
import {getToken} from 'next-auth/jwt';
import prisma from '../../../lib/prismadb';
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

  const {id}: {id?: string} = req.query;
  if (!id) return res.status(400).json({message: 'Email or ID not supplied'});

  if (token?.userData?.role === 'APPLICANT' && token?.userData?.userId !== id) {
    return res.status(403).json({message: 'Unauthorized'});
  }

  if (req.method === 'PATCH') {
    const keys = ['firstName', 'lastName'];
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    let data = {};
    for (const key of keys) {
      if (body.hasOwnProperty(key)) {
        data = {[key]: body[key], ...data};
      }
    }
    const {profile} = body;
    const {referrer} = profile ? profile : {referrer: {}};
    const refObject = referrer
      ? Object.keys(referrer).length
        ? {
            referrer: {
              upsert: {
                update: {
                  ...referrer,
                },
                create: {
                  ...referrer,
                },
              },
            },
          }
        : {}
      : {};

    try {
      const user = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          ...data,
          profile: profile
            ? {
                upsert: {
                  update: {
                    ...profile,
                    ...refObject,
                  },
                  create: {
                    ...profile,
                    referrer: referrer
                      ? {
                          create: {
                            ...referrer,
                          },
                        }
                      : undefined,
                  },
                },
              }
            : undefined,
        },
      });
      // if(Object.keys(_referrer).length) {
      //   const referrer = await prisma.referrer.upsert({
      //     where: {
      //       profileId: user.profile?.id ? user.profile.id : undefined
      //     }
      //   })
      // }

      return res
        .status(202)
        .send({message: 'Applicant Updated', applicant: user});
    } catch (err) {
      console.error(err);
      return res.status(400).send(err.message);
    }
  }
  if (req.method === 'DELETE') {
    try {
      const result = await prisma.user.deleteMany({
        where: {
          id: id,
          role: 'APPLICANT',
        },
      });
      return res.status(200).send({message: 'User Deleted', result});
    } catch (err) {
      console.error(err);
      return res.status(400).send(err.message);
    }
  }
  try {
    const _user = await prisma.user.findFirst({
      where: {
        role: 'APPLICANT',
        OR: [{email: id}, {id: id}],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        type: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        thinkific_user_id: true,
        userCohort: {
          include: {
            enrollments: true,
            cohort: true,
          },
        },
        profile: {
          include: {
            referrer: true,
          },
        },
        seatBooking: {
          where: {
            Date: {
              gte: new Date(),
            },
          },
        },
      },
    });

    if (!_user) {
      return res.status(404).json({message: 'Invalid Credientials'});
    }
    if (
      token?.userData?.role === 'APPLICANT' &&
      token?.userData?.userId !== _user.id
    ) {
      return res.status(403).json({message: 'Unauthorized'});
    }
    const user = bigint_filter(_user);
    res.status(200).send({message: 'success', user});
  } catch (error) {
    console.error(error);
    res.status(400).json({message: 'Something went wrong'});
  }
}
