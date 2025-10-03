import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { prisma } from '../../../../lib/prisma';

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

    const { id: cohortId } = req.query;
    
    console.log('Cohort courses API - cohortId:', cohortId);

    if (!cohortId || Array.isArray(cohortId)) {
      return res.status(400).json({ error: 'Invalid cohort ID' });
    }

    // Get courses that belong to this cohort
    const cohortCourses = await prisma.cohortCourse.findMany({
      where: {
        cohortId: cohortId as string,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            active: true,
          },
        },
      },
    });

    // Transform the data to match the expected format
    const courses = cohortCourses
      .filter(cc => cc.course?.active) // Only include active courses
      .map(cc => ({
        id: cc.course!.id.toString(),
        name: cc.course!.name,
        slug: cc.course!.slug,
        description: cc.course!.description,
      }));

    console.log('Cohort courses API - cohortCourses found:', cohortCourses.length);
    console.log('Cohort courses API - courses after filtering:', courses.length);
    console.log('Cohort courses API - returning:', { courses });

    return res.status(200).json({ courses });
  } catch (error) {
    console.error('Error fetching cohort courses:', error);
    // Return empty courses array instead of error to prevent frontend crashes
    return res.status(200).json({ courses: [] });
  }
}
