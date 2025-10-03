import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check authentication
    const token = await getToken({ req });
    if (!token || !token.userData) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRole = token.userData.role || '';
    if (!['SUPERADMIN', 'ADMIN', 'SUPPORT', 'GUEST'].includes(userRole)) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { cohortId } = req.query;

    console.log('Enrollments courses API - cohortId:', cohortId);

    // Get courses from actual enrollments in the database for the specified cohort
    let enrollmentsQuery: any = {
      include: {
        userCohort: {
          include: {
            cohort: true,
          },
        },
      },
    };

    // If cohortId is provided, filter by cohort
    if (cohortId && cohortId !== 'all') {
      enrollmentsQuery.where = {
        userCohort: {
          cohortId: cohortId as string,
        },
      };
    }

    const enrollments = await prisma.enrollment.findMany(enrollmentsQuery);

    // Get unique course IDs from enrollments
    const courseIds = Array.from(new Set(enrollments.map(e => e.course_id)));

    // Get course information from the Course table
    const courses = await prisma.course.findMany({
      where: {
        id: { in: courseIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    });

    // Transform the data to match the expected format
    const coursesData = courses.map(course => ({
      id: course.id.toString(),
      name: course.name,
      slug: course.slug,
      description: course.description,
    }));

    console.log('Enrollments courses API - found courses:', coursesData.length);
    console.log('Enrollments courses API - returning:', { courses: coursesData });

    return res.status(200).json({ courses: coursesData });
  } catch (error) {
    console.error('Error fetching enrollment courses:', error);
    // Return empty courses array instead of error to prevent frontend crashes
    return res.status(200).json({ courses: [] });
  }
}

