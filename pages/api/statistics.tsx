import {NextApiRequest, NextApiResponse} from 'next';
import prisma from '../../lib/prismadb';

type CourseStats = {
  Female: number;
  Male: number;
  Total: number;
};

type StateStats = {
  [key: string]: CourseStats;
};

type Stats = {
  [key: string]: StateStats;
};

// Normalize course names to match the expected format
function normalizeCourseName(name: string): string {
  // Remove special characters, numbers, and extra spaces
  const cleanName = name
    .replace(/[0-9()*\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Map variations to standard names
  if (cleanName.includes('Animation')) return 'Animation';
  if (cleanName.includes('Script Writing')) return 'Script Writing';
  if (cleanName.includes('Sound Design')) return 'Sound Design';
  if (cleanName.includes('Stage Lighting')) return 'Stage Lighting';
  if (cleanName.includes('Art Business'))
    return 'Art Business & Entrepreneurship';

  return cleanName;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).json({message: 'Method not allowed'});
  }

  try {
    // Get all courses from the database
    const courses = await prisma.course.findMany({
      select: {
        name: true,
      },
    });
    console.log('Raw courses from DB:', courses);

    // Get all locations (states) from the database
    const locations = await prisma.location.findMany({
      where: {
        name: {
          in: ['Lagos', 'Ogun', 'Kano'],
        },
      },
      select: {
        name: true,
      },
    });
    console.log('Locations from DB:', locations);

    // Initialize the stats structure with all states and courses from the database
    const stats: Stats = {
      LAGOS: {},
      OGUN: {},
      KANO: {},
    };

    // Initialize each state with all courses
    Object.keys(stats).forEach(state => {
      // Use the standard course names
      const standardCourses = [
        'Animation',
        'Script Writing',
        'Sound Design',
        'Stage Lighting',
        'Art Business & Entrepreneurship',
      ];

      standardCourses.forEach(course => {
        stats[state][course] = {
          Female: 0,
          Male: 0,
          Total: 0,
        };
      });
    });
    console.log('Initialized stats structure:', stats);

    // Get all enrollments with their related data
    const enrollments = await prisma.enrollment.findMany({
      where: {
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
            location: true,
          },
        },
      },
    });
    console.log('Number of enrollments found:', enrollments.length);
    if (enrollments.length > 0) {
      console.log('Sample enrollment:', enrollments[0]);
    }

    // Process each enrollment
    enrollments.forEach(enrollment => {
      const state = enrollment.userCohort?.location?.name?.toUpperCase();
      const course = normalizeCourseName(enrollment.course_name);
      const gender =
        enrollment.userCohort?.user?.profile?.gender?.toUpperCase();

      console.log('Processing enrollment:', {
        state,
        originalCourse: enrollment.course_name,
        normalizedCourse: course,
        gender,
        hasState: !!state,
        hasCourse: !!course,
        hasGender: !!gender,
        stateExists: state ? !!stats[state] : false,
        courseExists: state && course ? !!stats[state]?.[course] : false,
      });

      if (state && course && gender && stats[state]?.[course]) {
        const genderKey = gender === 'FEMALE' ? 'Female' : 'Male';
        stats[state][course][genderKey]++;
        stats[state][course].Total++;
      }
    });
    console.log('Stats after processing enrollments:', stats);

    // Calculate state totals
    const stateTotals = Object.entries(stats).reduce(
      (acc, [state, courses]) => {
        acc[state] = Object.values(courses).reduce(
          (sum, course) => sum + course.Total,
          0,
        );
        return acc;
      },
      {} as Record<string, number>,
    );
    console.log('State totals:', stateTotals);

    // Calculate grand total
    const grandTotal = Object.values(stateTotals).reduce(
      (sum, total) => sum + total,
      0,
    );
    console.log('Grand total:', grandTotal);

    return res.status(200).json({
      stats,
      stateTotals,
      grandTotal,
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({message: 'Internal server error'});
  }
}
