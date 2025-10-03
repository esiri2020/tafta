import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { id } = req.query;
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Verify mobilizer exists
    const mobilizer = await prisma.mobilizer.findUnique({
      where: { id: id as string },
    });

    if (!mobilizer) {
      return res.status(404).json({ message: 'Mobilizer not found' });
    }

    // Build where clause for referrals (exclude mobilizer's own profile)
    const where: any = {
      mobilizerId: id as string,
      user: {
        mobilizerId: { not: id as string }, // Exclude the mobilizer's own profile
      },
    };

    // Add status filter if provided
    if (status) {
      where.userCohort = {
        some: {
          enrollments: {
            some: {
              completed: status === 'completed',
            },
          },
        },
      };
    }

    const [referrals, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { user: { createdAt: 'desc' } },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              createdAt: true,
            },
            include: {
              userCohort: {
                include: {
                  cohort: {
                    select: {
                      id: true,
                      name: true,
                      start_date: true,
                      end_date: true,
                    },
                  },
                  enrollments: {
                    select: {
                      id: true,
                      course_name: true,
                      percentage_completed: true,
                      completed: true,
                      started_at: true,
                      completed_at: true,
                      updated_at: true,
                    },
                    orderBy: { updated_at: 'desc' },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.profile.count({ where }),
    ]);

    // Transform data to match MobilizerReferral interface
    const transformedReferrals = referrals.map((profile) => {
      const latestEnrollment = profile.user.userCohort?.[0]?.enrollments?.[0];
      const completionPercentage = latestEnrollment?.percentage_completed || 0;
      const lastActivity = latestEnrollment?.updated_at || profile.user.createdAt;

      return {
        id: profile.user.id,
        fullName: `${profile.user.firstName || ''} ${profile.user.lastName || ''}`.trim(),
        email: profile.user.email,
        courseName: latestEnrollment?.course_name,
        enrollmentStatus: latestEnrollment?.completed ? 'completed' : 'active',
        completionPercentage,
        lastActivity,
        profile: {
          id: profile.id,
          phoneNumber: profile.phoneNumber,
          stateOfResidence: profile.stateOfResidence,
          employmentStatus: profile.employmentStatus,
        },
        userCohort: profile.user.userCohort,
      };
    });

    res.status(200).json({
      message: 'success',
      referrals: transformedReferrals,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error('Error fetching mobilizer referrals:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

