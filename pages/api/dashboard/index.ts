import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

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

    // Get all enrollments for the cohort(s)
    const enrollments = await prisma.enrollment.findMany({
      where: enrollmentWhere,
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

    // Get all userCohorts for the cohort(s) to count applicants
    const userCohortWhere =
      cohortId === 'all'
        ? {}
        : { cohortId: cohortId as string };
    const userCohorts = await prisma.userCohort.findMany({
      where: userCohortWhere,
      include: { user: true },
    });

    // Calculate metrics
    const totalEnrollments = enrollments.length;
    const activeEnrollments = enrollments.filter(e => e.enrolled && !e.completed && !e.expired).length;
    const completedEnrollments = enrollments.filter(e => e.completed).length;
    const certifiedEnrollments = enrollments.filter(e => e.completed && e.percentage_completed === 100).length;
    const maleEnrollments = enrollments.filter(e => e.userCohort?.user?.profile?.gender === 'MALE').length;
    const femaleEnrollments = enrollments.filter(e => e.userCohort?.user?.profile?.gender === 'FEMALE').length;
    const totalApplicants = userCohorts.length;

    // Course distribution
    const courseMap = new Map();
    enrollments.forEach(e => {
      const courseName = e.course_name || 'Unknown';
      if (!courseMap.has(courseName)) {
        courseMap.set(courseName, { name: courseName, count: 0, male_count: 0, female_count: 0 });
      }
      const courseData = courseMap.get(courseName);
      courseData.count++;
      const gender = e.userCohort?.user?.profile?.gender;
      if (gender === 'MALE') courseData.male_count++;
      if (gender === 'FEMALE') courseData.female_count++;
    });
    const courseEnrollmentData = Array.from(courseMap.values());

    // Enrollment over time (by created_at date)
    const enrollmentGraphMap = new Map();
    enrollments.forEach(e => {
      const date = e.created_at.toISOString().split('T')[0];
      if (!enrollmentGraphMap.has(date)) {
        enrollmentGraphMap.set(date, { date, count: 0 });
      }
      enrollmentGraphMap.get(date).count++;
    });
    const enrollment_completion_graph = Array.from(enrollmentGraphMap.values()).sort((a, b) => a.date.localeCompare(b.date));

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