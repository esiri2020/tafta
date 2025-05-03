import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { Enrollment, UserCohort, User, Profile } from '@prisma/client';

type EnrollmentWithRelations = Enrollment & {
  userCohort: UserCohort & {
    user: User & {
      profile: Profile | null;
    };
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { cohortId } = req.query;

    // Get all completed enrollments for the cohort
    const completedEnrollments = await prisma.enrollment.findMany({
      where: {
        userCohort: {
          cohortId: cohortId as string,
        },
        completed: true,
      },
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

    // Group enrollments by state and course
    const stateData = new Map<string, Map<string, { female: number; male: number; total: number }>>();

    completedEnrollments.forEach((enrollment: EnrollmentWithRelations) => {
      const state = enrollment.userCohort.user.profile?.stateOfResidence || 'Unknown';
      const course = enrollment.course_name;
      const gender = enrollment.userCohort.user.profile?.gender || 'Unknown';

      if (!stateData.has(state)) {
        stateData.set(state, new Map());
      }

      const courseData = stateData.get(state)!;
      if (!courseData.has(course)) {
        courseData.set(course, { female: 0, male: 0, total: 0 });
      }

      const data = courseData.get(course)!;
      data.total++;
      if (gender === 'FEMALE') {
        data.female++;
      } else if (gender === 'MALE') {
        data.male++;
      }
    });

    // Convert to the required format
    const states: Array<{
      state: string;
      courses: Array<{
        course: string;
        female: number;
        male: number;
        total: number;
      }>;
      total: number;
    }> = [];

    stateData.forEach((courseData, state) => {
      const courses: Array<{
        course: string;
        female: number;
        male: number;
        total: number;
      }> = [];

      let stateTotal = 0;
      courseData.forEach((data, course) => {
        courses.push({
          course,
          ...data,
        });
        stateTotal += data.total;
      });

      states.push({
        state,
        courses,
        total: stateTotal,
      });
    });

    // Get cohort details
    const cohort = await prisma.cohort.findUnique({
      where: {
        id: cohortId as string,
      },
    });

    const totalCompletion = states.reduce((sum, state) => sum + state.total, 0);

    return res.status(200).json({
      states,
      totalCompletion,
      cohortName: cohort?.name || 'Unknown Cohort',
      date: new Date().toLocaleDateString(),
    });
  } catch (error) {
    console.error('Error fetching completion rates:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 