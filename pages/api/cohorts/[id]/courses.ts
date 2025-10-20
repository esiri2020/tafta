import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import prisma from '../../../../lib/prismadb';

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

    const { id: cohortId, includeAll } = req.query;
    
    console.log('Cohort courses API - cohortId:', cohortId);

    if (!cohortId || Array.isArray(cohortId)) {
      return res.status(400).json({ error: 'Invalid cohort ID' });
    }

    // If includeAll is truthy, return the full catalog of courses as well
    const shouldIncludeAll = includeAll === '1' || includeAll === 'true';

    // Get courses that belong to this cohort
    const cohortCourses = await prisma.cohortCourse.findMany({
      where: { cohortId: cohortId as string },
      include: {
        course: {
          select: { id: true, name: true, slug: true, description: true, active: true },
        },
      },
    });

    const cohortCoursesList = cohortCourses
      .filter(cc => cc.course)
      .map(cc => ({
        id: cc.course!.id.toString(),
        name: cc.course!.name,
        slug: cc.course!.slug,
        description: cc.course!.description,
        active: cc.course!.active ?? true,
      }));

    if (!shouldIncludeAll) {
      console.log('Cohort courses API - returning cohort-only courses:', cohortCoursesList.length);
      return res.status(200).json({ courses: cohortCoursesList });
    }

    // Include full catalog (useful for UI to add courses to cohort)
    const allCourses = await prisma.course.findMany({
      select: { id: true, name: true, slug: true, description: true, active: true },
      orderBy: { name: 'asc' },
    });

    const allCoursesList = allCourses.map(c => ({
      id: c.id.toString(),
      name: c.name,
      slug: c.slug,
      description: c.description,
      active: c.active ?? true,
    }));

    console.log('Cohort courses API - returning cohort + all courses:', {
      cohortCourses: cohortCoursesList.length,
      allCourses: allCoursesList.length,
    });

    return res.status(200).json({ courses: cohortCoursesList, allCourses: allCoursesList });
  } catch (error) {
    console.error('Error fetching cohort courses:', error);
    // Return empty courses array instead of error to prevent frontend crashes
    return res.status(200).json({ courses: [] });
  }
}
