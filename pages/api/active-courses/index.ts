import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { cohortId } = req.query;

  if (!cohortId) {
    return res.status(400).json({ message: 'Cohort ID is required' });
  }

  try {
    const cohortCourses = await prisma.cohortCourse.findMany({
      where: {
        cohortId: String(cohortId),
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            description: true,
          }
        }
      },
      orderBy: {
        course: {
          name: 'asc'
        }
      }
    });

    // Transform the data to match the expected format
    const transformedCourses = cohortCourses.map(item => ({
      id: item.courseId,
      name: item.course.name,
      description: item.course.description,
      course_limit: item.course_limit,
    }));

    return res.status(200).json(transformedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 