import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { cohortId } = req.query;

    // Build where clause for enrollments
    const enrollmentWhere =
      cohortId === 'all'
        ? {}
        : { userCohort: { cohortId: cohortId as string } };

    // Total enrollments
    const totalEnrollments = await prisma.enrollment.count({ where: enrollmentWhere });

    // Active enrollments
    const activeEnrollments = await prisma.enrollment.count({
      where: {
        ...enrollmentWhere,
        enrolled: true,
        completed: false,
        expired: false,
      },
    });

    // Completed enrollments
    const completedEnrollments = await prisma.enrollment.count({
      where: {
        ...enrollmentWhere,
        completed: true,
      },
    });

    // Certified enrollments (completed and percentage_completed === 100)
    const certifiedEnrollments = await prisma.enrollment.count({
      where: {
        ...enrollmentWhere,
        completed: true,
        percentage_completed: 100,
      },
    });

    // Male enrollments
    const maleEnrollments = await prisma.enrollment.count({
      where: {
        ...enrollmentWhere,
        userCohort: {
          ...(enrollmentWhere.userCohort || {}),
          user: {
            profile: {
              gender: 'MALE',
            },
          },
        },
      },
    });

    // Female enrollments
    const femaleEnrollments = await prisma.enrollment.count({
      where: {
        ...enrollmentWhere,
        userCohort: {
          ...(enrollmentWhere.userCohort || {}),
          user: {
            profile: {
              gender: 'FEMALE',
            },
          },
        },
      },
    });

    // Total applicants (userCohort count)
    const userCohortWhere =
      cohortId === 'all'
        ? {}
        : { cohortId: cohortId as string };
    const totalApplicants = await prisma.userCohort.count({ where: userCohortWhere });

    // Course distribution and gender breakdown per course using a single raw SQL query
    const courseGenderCounts = await prisma.$queryRaw(Prisma.sql`
      SELECT e.course_name, p.gender, COUNT(*) as count
      FROM "Enrollment" e
      JOIN "UserCohort" uc ON e."userCohortId" = uc.id
      JOIN "User" u ON uc."userId" = u.id
      JOIN "Profile" p ON u.id = p."userId"
      ${cohortId === 'all' ? Prisma.empty : Prisma.sql`WHERE uc."cohortId" = ${cohortId}`}
      GROUP BY e.course_name, p.gender
    `);

    // Aggregate course distribution and gender counts
    const courseMap = new Map();
    for (const row of courseGenderCounts as any[]) {
      const course = row.course_name || 'Unknown';
      if (!courseMap.has(course)) {
        courseMap.set(course, { name: course, count: 0, male_count: 0, female_count: 0 });
      }
      const courseData = courseMap.get(course);
      courseData.count += Number(row.count);
      if (row.gender === 'MALE') courseData.male_count += Number(row.count);
      if (row.gender === 'FEMALE') courseData.female_count += Number(row.count);
    }
    const courseEnrollmentData = Array.from(courseMap.values());

    // Enrollment over time (by created_at date)
    const enrollmentOverTime = await prisma.enrollment.groupBy({
      by: ['created_at'],
      where: enrollmentWhere,
      _count: { _all: true },
      orderBy: { created_at: 'asc' },
    });
    const enrollment_completion_graph = enrollmentOverTime.map(eot => ({
      date: eot.created_at.toISOString().split('T')[0],
      count: eot._count._all,
    }));

    // Response
    const response = {
      total_enrolled_applicants: totalEnrollments,
      total_applicants: totalApplicants,
      female_enrollments: femaleEnrollments,
      male_enrollments: maleEnrollments,
      active_enrollees: activeEnrollments,
      certified_enrollees: certifiedEnrollments,
      completed_enrollments: completedEnrollments,
      courseEnrollmentData,
      enrollment_completion_graph,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 