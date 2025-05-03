import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type State = 'Lagos' | 'Ogun' | 'Kano';
type Course = 'Digital Marketing' | 'Web Development' | 'Data Science' | 'UI/UX Design';

interface CourseStats {
  female: number;
  male: number;
}

type CourseData = {
  [key in State]: {
    [key in Course]: CourseStats;
  };
};

async function simulateCompletionData() {
  try {
    // Get the 10th cohort
    const cohort = await prisma.cohort.findFirst({
      where: {
        name: '10th Cohort',
      },
    });

    if (!cohort) {
      console.error('10th Cohort not found');
      return;
    }

    // Get all users in the cohort
    const userCohorts = await prisma.userCohort.findMany({
      where: {
        cohortId: cohort.id,
      },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    // Get course IDs
    const courses = await prisma.course.findMany({
      where: {
        name: {
          in: ['Digital Marketing', 'Web Development', 'Data Science', 'UI/UX Design'],
        },
      },
    });

    const courseIdMap = new Map(courses.map(course => [course.name, course.id]));

    // Define course completion data
    const courseData: CourseData = {
      'Lagos': {
        'Digital Marketing': { female: 15, male: 10 },
        'Web Development': { female: 12, male: 18 },
        'Data Science': { female: 8, male: 12 },
        'UI/UX Design': { female: 20, male: 5 },
      },
      'Ogun': {
        'Digital Marketing': { female: 10, male: 8 },
        'Web Development': { female: 8, male: 15 },
        'Data Science': { female: 5, male: 10 },
        'UI/UX Design': { female: 15, male: 3 },
      },
      'Kano': {
        'Digital Marketing': { female: 12, male: 7 },
        'Web Development': { female: 10, male: 12 },
        'Data Science': { female: 6, male: 8 },
        'UI/UX Design': { female: 18, male: 4 },
      },
    };

    // Create enrollments for each user
    for (const userCohort of userCohorts) {
      const state = userCohort.user.profile?.stateOfResidence as State;
      if (!state || !courseData[state]) continue;

      const gender = userCohort.user.profile?.gender;
      if (!gender) continue;

      // Randomly select a course for the user
      const courses = Object.keys(courseData[state]) as Course[];
      const course = courses[Math.floor(Math.random() * courses.length)];
      const courseStats = courseData[state][course];

      // Check if we've reached the limit for this course and gender
      const existingEnrollments = await prisma.enrollment.count({
        where: {
          userCohortId: userCohort.id,
          course_name: course,
        },
      });

      if (existingEnrollments > 0) continue;

      const genderCount = gender === 'FEMALE' ? courseStats.female : courseStats.male;
      if (genderCount <= 0) continue;

      const courseId = courseIdMap.get(course);
      if (!courseId) {
        console.error(`Course ID not found for ${course}`);
        continue;
      }

      // Create the enrollment
      await prisma.enrollment.create({
        data: {
          userCohortId: userCohort.id,
          course_name: course,
          course_id: courseId,
          completed: true,
          completed_at: new Date(),
        },
      });

      // Update the count
      if (gender === 'FEMALE') {
        courseStats.female--;
      } else {
        courseStats.male--;
      }
    }

    console.log('Completion data simulation completed successfully');
  } catch (error) {
    console.error('Error simulating completion data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

simulateCompletionData(); 