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
    let where: any = {};
    if (cohortId) {
      where = { userCohort: { cohortId: String(cohortId) } };
    }
    

    // Use groupBy for fast aggregation
    const grouped = await prisma.enrollment.groupBy({
      by: [
        'course_name',
        'userCohortId',
      ],
      _count: true,
      where,
    });

    // Fetch user profiles for the userCohortIds in the grouped result
    const userCohortIds = Array.from(new Set(grouped.map(g => g.userCohortId)));
    const userCohorts = await prisma.userCohort.findMany({
      where: { id: { in: userCohortIds } },
      include: {
        user: {
          select: {
            profile: {
              select: {
                stateOfResidence: true,
                gender: true,
              },
            },
          },
        },
        cohort: true,
      },
    });
    const userCohortMap = Object.fromEntries(
      userCohorts.map(uc => [uc.id, uc])
    );

    // Aggregate by state and course
    const locationBreakdown = new Map();
    grouped.forEach(g => {
      const userCohort = userCohortMap[g.userCohortId];
      const userProfile = userCohort?.user?.profile;
      if (!userProfile) return;
      const state = userProfile.stateOfResidence || 'Unknown';
      const course = g.course_name;
      const gender = userProfile.gender || 'Unknown';
      if (!locationBreakdown.has(state)) {
        locationBreakdown.set(state, {
          courses: new Map(),
          total: 0,
        });
      }
      const stateData = locationBreakdown.get(state);
      if (!stateData.courses.has(course)) {
        stateData.courses.set(course, { female: 0, male: 0, total: 0 });
      }
      const courseData = stateData.courses.get(course);
      courseData.total += g._count;
      stateData.total += g._count;
      if (gender === 'FEMALE') {
        courseData.female += g._count;
      } else if (gender === 'MALE') {
        courseData.male += g._count;
      }
    });

    // Convert to the required format
    const formattedData = Array.from(locationBreakdown.entries()).map(([state, data]: [string, any]) => ({
      state,
      courses: (Array.from(data.courses.entries()) as [string, any][]).map(([course, stats]) => ({
        course,
        female: stats.female,
        male: stats.male,
        total: stats.total,
      })),
      total: data.total,
    }));

    // Sort states by total count (descending)
    formattedData.sort((a: any, b: any) => b.total - a.total);
    // Sort courses within each state by total count (descending)
    formattedData.forEach(state => {
      state.courses.sort((a: any, b: any) => b.total - a.total);
    });

    // For all cohorts, cohortName is 'All Cohorts', otherwise use the cohort name
    let cohortName = 'All Cohorts';
    if (cohortId && userCohorts[0]?.cohort?.name) {
      cohortName = userCohorts[0].cohort.name;
    }
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