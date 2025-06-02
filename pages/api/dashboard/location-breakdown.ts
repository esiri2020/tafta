import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Get the token from the request
    const token = await getToken({ req });
    if (!token) {
      return res.status(401).json({
        error: 'You must be signed in to view the protected content on this page.',
      });
    }

    // Get the cohortId from the URL and ensure it's a string
    const { cohortId } = req.query;

    // Build the where clause
    const where: any = {};
    if (cohortId) {
      where.userCohort = { cohortId: String(cohortId) };
    }

    // Get all certified enrollments with their user data
    const certifiedEnrollments = await prisma.enrollment.findMany({
      where,
      include: {
        userCohort: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            cohort: true,
          },
        },
      },
    });

    // Group enrollments by state and course
    const locationBreakdown = new Map<string, {
      courses: Map<string, { female: number; male: number; total: number }>;
      total: number;
    }>();

    certifiedEnrollments.forEach((enrollment) => {
      // Get the user's profile data
      const userProfile = enrollment.userCohort.user.profile;
      if (!userProfile) return;

      const state = userProfile.stateOfResidence || 'Unknown';
      const course = enrollment.course_name;
      const gender = userProfile.gender || 'Unknown';

      if (!locationBreakdown.has(state)) {
        locationBreakdown.set(state, {
          courses: new Map(),
          total: 0,
        });
      }

      const stateData = locationBreakdown.get(state)!;
      if (!stateData.courses.has(course)) {
        stateData.courses.set(course, { female: 0, male: 0, total: 0 });
      }

      const courseData = stateData.courses.get(course)!;
      courseData.total++;
      stateData.total++;

      if (gender === 'FEMALE') {
        courseData.female++;
      } else if (gender === 'MALE') {
        courseData.male++;
      }
    });

    // Convert to the required format
    const formattedData = Array.from(locationBreakdown.entries()).map(([state, data]) => ({
      state,
      courses: Array.from(data.courses.entries()).map(([course, stats]) => ({
        course,
        female: stats.female,
        male: stats.male,
        total: stats.total,
      })),
      total: data.total,
    }));

    // Sort states by total count (descending)
    formattedData.sort((a, b) => b.total - a.total);

    // Sort courses within each state by total count (descending)
    formattedData.forEach(state => {
      state.courses.sort((a, b) => b.total - a.total);
    });

    const cohortName = certifiedEnrollments[0]?.userCohort.cohort?.name || 'Unknown Cohort';
    const totalCompletion = formattedData.reduce((sum, state) => sum + state.total, 0);

    return res.json({
      states: formattedData,
      totalCompletion,
      cohortName,
      date: new Date().toLocaleDateString(),
    });
  } catch (error) {
    console.error('Error fetching location breakdown:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 