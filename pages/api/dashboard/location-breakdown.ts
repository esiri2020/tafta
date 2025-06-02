import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the token from the request
    const token = await getToken({ req });
    if (!token) {
      return res.status(401).json({
        error: 'You must be signed in to view the protected content on this page.',
      });
    }

    const { cohortId } = req.query;

    // If cohortId is 'all', we'll aggregate data from all cohorts
    const whereClause = cohortId === 'all'
      ? {}
      : { userCohort: { cohortId: cohortId as string } };

    // Get all enrollments with location data
    const enrollments = await prisma.enrollment.findMany({
      where: whereClause,
      include: {
        userCohort: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    });

    // Group data by state and course
    const stateData = new Map();

    enrollments.forEach(enrollment => {
      const userCohort = enrollment.userCohort;
      const state = userCohort?.user?.profile?.stateOfResidence || 'Unknown';
      const course = enrollment.course_name;
      const gender = userCohort?.user?.profile?.gender || 'Unknown';

      if (!stateData.has(state)) {
        stateData.set(state, new Map());
      }

      const courseData = stateData.get(state);
      if (!courseData.has(course)) {
        courseData.set(course, {
          male: 0,
          female: 0,
          total: 0,
        });
      }

      const data = courseData.get(course);
      if (gender === 'MALE') {
        data.male++;
      } else if (gender === 'FEMALE') {
        data.female++;
      }
      data.total++;
    });

    // Transform data for the frontend
    const states: any[] = [];
    stateData.forEach((courseData: Map<string, any>, state: string) => {
      const courses: any[] = [];
      courseData.forEach((data: any, course: string) => {
        courses.push({
          course,
          ...data,
        });
      });

      states.push({
        state,
        courses,
        total: courses.reduce((sum, course) => sum + course.total, 0),
      });
    });

    // Sort states by total count (descending)
    states.sort((a: any, b: any) => b.total - a.total);
    // Sort courses within each state by total count (descending)
    states.forEach(state => {
      state.courses.sort((a: any, b: any) => b.total - a.total);
    });

    // For all cohorts, cohortName is 'All Cohorts', otherwise use the cohort name
    let cohortName = 'All Cohorts';
    if (cohortId && states[0]?.courses[0]?.course) {
      cohortName = states[0].courses[0].course;
    }
    const totalCompletion = states.reduce((sum, state) => sum + state.total, 0);

    return res.status(200).json({
      states,
      totalCompletion,
      cohortName,
      date: new Date().toLocaleDateString(),
    });
  } catch (error) {
    console.error('Error fetching location breakdown:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 