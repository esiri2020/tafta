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
    const cohortIdString = Array.isArray(cohortId) ? cohortId[0] : cohortId;

    // Define a base where clause for enrollments
    const baseEnrollmentWhere: any = {
      completed: true,
    };

    if (cohortIdString) {
      baseEnrollmentWhere.userCohort = {
        cohortId: cohortIdString,
      };
    }

    // Get certified enrollments grouped by state and gender
    const groupedEnrollments = await prisma.enrollment.groupBy({
      by: ['course_name', 'userCohortId'],
      _count: {
        _all: true,
      },
      where: baseEnrollmentWhere,
    });

    // Fetch user profiles for gender and state of residence
    const userCohorts = await prisma.userCohort.findMany({
      where: cohortIdString
        ? { cohortId: cohortIdString }
        : { enrollments: { some: { completed: true } } }, // Only relevant userCohorts
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        cohort: true,
      },
    });

    const userProfileMap = new Map();
    userCohorts.forEach(uc => {
      if (uc.userId && uc.user?.profile) {
        userProfileMap.set(uc.id, { gender: uc.user.profile.gender, stateOfResidence: uc.user.profile.stateOfResidence });
      }
    });

    const locationBreakdown = new Map<string, {
      courses: Map<string, { female: number; male: number; total: number }>;
      total: number;
    }>();

    groupedEnrollments.forEach(enrollment => {
      const userProfile = userProfileMap.get(enrollment.userCohortId);
      if (!userProfile) return;

      const state = userProfile.stateOfResidence || 'Unknown';
      const course = enrollment.course_name;
      const gender = userProfile.gender || 'Unknown';
      const count = enrollment._count._all;

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
      courseData.total += count;
      stateData.total += count;

      if (gender === 'FEMALE') {
        courseData.female += count;
      } else if (gender === 'MALE') {
        courseData.male += count;
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

    const totalCompletion = formattedData.reduce((sum, state) => sum + state.total, 0);

    // Try to get cohort name if cohortId is provided and userCohorts has data
    let cohortName = 'Unknown Cohort';
    if (cohortIdString && userCohorts.length > 0) {
        cohortName = userCohorts[0].cohort?.name || 'Unknown Cohort';
    }

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