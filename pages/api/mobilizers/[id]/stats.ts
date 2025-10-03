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

    // Get the mobilizer's code and user info
    const mobilizer = await prisma.mobilizer.findUnique({
      where: { id: id as string },
      select: { code: true, user: { select: { id: true } } }
    });

    if (!mobilizer) {
      return res.status(404).json({ message: 'Mobilizer not found' });
    }

    const referrals = await prisma.profile.findMany({
      where: { 
        referrer: {
          fullName: mobilizer.code
        },
        user: {
          id: { not: mobilizer.user?.id } // Exclude the mobilizer's own profile
        }
      },
      include: {
        user: {
          include: {
            userCohort: {
              include: {
                enrollments: {
                  select: {
                    percentage_completed: true,
                    completed: true,
                    course_name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Calculate statistics
    const totalReferrals = referrals.length;
    let activeReferrals = 0;
    let completedReferrals = 0;
    let totalCompletionPercentage = 0;
    const courseCounts: Record<string, number> = {};
    const statusCounts: Record<string, number> = {};

    referrals.forEach((referral) => {
      const enrollments = referral.user.userCohort?.[0]?.enrollments || [];
      
      if (enrollments.length > 0) {
        const latestEnrollment = enrollments[0];
        const completionPercentage = latestEnrollment.percentage_completed || 0;
        
        if (latestEnrollment.completed) {
          completedReferrals++;
          statusCounts['completed'] = (statusCounts['completed'] || 0) + 1;
        } else {
          activeReferrals++;
          statusCounts['active'] = (statusCounts['active'] || 0) + 1;
        }

        totalCompletionPercentage += completionPercentage;

        // Count by course
        const courseName = latestEnrollment.course_name || 'Unknown';
        courseCounts[courseName] = (courseCounts[courseName] || 0) + 1;
      } else {
        activeReferrals++;
        statusCounts['pending'] = (statusCounts['pending'] || 0) + 1;
      }
    });

    const completionRate = totalReferrals > 0 ? (completedReferrals / totalReferrals) * 100 : 0;
    const averageCompletionPercentage = totalReferrals > 0 ? totalCompletionPercentage / totalReferrals : 0;

    // Transform course counts to array format
    const referralsByCourse = Object.entries(courseCounts).map(([courseName, count]) => ({
      courseName,
      count,
    }));

    // Transform status counts to array format
    const referralsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));

    const stats = {
      totalReferrals,
      activeReferrals,
      completedReferrals,
      completionRate: Math.round(completionRate * 100) / 100,
      averageCompletionPercentage: Math.round(averageCompletionPercentage * 100) / 100,
      referralsByCourse,
      referralsByStatus,
    };

    res.status(200).json({
      message: 'success',
      stats,
    });
  } catch (error) {
    console.error('Error fetching mobilizer stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

