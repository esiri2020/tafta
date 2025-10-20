import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import prisma from '../../../lib/prismadb';

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

    // When a cohort is specified, return all courses configured for that cohort (not just those with enrollments)
    if (cohortId && cohortId !== 'all') {
      const cohortCourses = await prisma.cohortCourse.findMany({
        where: { cohortId: cohortId as string },
        include: {
          course: {
            select: { id: true, name: true, slug: true, description: true },
          },
        },
      });

      // Deduplicate by course_id
      const seen = new Set<bigint>();
      const coursesData = cohortCourses
        .filter(cc => {
          if (!cc.course_id) return false;
          const has = seen.has(cc.course_id);
          if (!has) seen.add(cc.course_id);
          return !has;
        })
        .map(cc => ({
          id: cc.course.id.toString(),
          name: cc.course.name,
          slug: cc.course.slug,
          description: cc.course.description,
        }));

      console.log('Enrollments courses API - cohort courses:', coursesData.length);
      return res.status(200).json({ courses: coursesData });
    }

    // No cohort specified: return all courses
    const allCourses = await prisma.course.findMany({
      select: { id: true, name: true, slug: true, description: true },
      orderBy: { name: 'asc' },
    });

    const allCoursesData = allCourses.map(c => ({
      id: c.id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
    }));

    console.log('Enrollments courses API - all courses:', allCoursesData.length);
    return res.status(200).json({ courses: allCoursesData });
  } catch (error) {
    console.error('Error fetching enrollment courses:', error);
    // Return empty courses array instead of error to prevent frontend crashes
    return res.status(200).json({ courses: [] });
  }
}

