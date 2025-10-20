import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { cachedPrisma } from 'lib/cached-prisma';
import { rateLimiter } from 'lib/rate-limiter';
import { revalidateAfterChange } from 'lib/cache-revalidator';
import { unstable_cache } from 'next/cache';

// Helper function to convert bigint to string for JSON serialization
export const bigint_filter = (data: any) => {
  return JSON.parse(
    JSON.stringify(data, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
  );
};

// Cached enrollment statistics calculation
const getCachedEnrollmentStats = unstable_cache(
  async (cohortId?: string) => {
    const whereCondition = cohortId ? { userCohort: { cohortId } } : {};
    
    // Count total enrollments
    const count = await cachedPrisma.enrollment.count({
      where: whereCondition
    });

    // Count male and female enrollments
    let maleCount = 0;
    let femaleCount = 0;
    
    if (count > 0) {
      maleCount = await cachedPrisma.user.count({
        where: {
          profile: {
            gender: 'MALE',
          },
          userCohort: {
            some: {
              ...(cohortId ? { cohortId } : {}),
              enrollments: {
                some: {
                  enrolled: true,
                },
              },
            },
          },
        },
      });

      femaleCount = await cachedPrisma.user.count({
        where: {
          profile: {
            gender: 'FEMALE',
          },
          userCohort: {
            some: {
              ...(cohortId ? { cohortId } : {}),
              enrollments: {
                some: {
                  enrolled: true,
                },
              },
            },
          },
        },
      });
    }

    // Count unique users by status
    const baseUserWhere = {
      userCohort: {
        some: {
          ...(cohortId ? { cohortId } : {}),
          enrollments: {
            some: {},
          },
        },
      },
    };

    const activeCount = await cachedPrisma.user.count({
      where: {
        ...baseUserWhere,
        userCohort: {
          some: {
            ...baseUserWhere.userCohort.some,
            enrollments: {
              some: {
                ...baseUserWhere.userCohort.some.enrollments.some,
                completed: false,
                expired: false,
                enrolled: true,
              },
            },
          },
        },
      },
    });

    const completedCount = await cachedPrisma.user.count({
      where: {
        ...baseUserWhere,
        userCohort: {
          some: {
            ...baseUserWhere.userCohort.some,
            enrollments: {
              some: {
                ...baseUserWhere.userCohort.some.enrollments.some,
                completed: true,
              },
            },
          },
        },
      },
    });

    const expiredCount = await cachedPrisma.user.count({
      where: {
        ...baseUserWhere,
        userCohort: {
          some: {
            ...baseUserWhere.userCohort.some,
            enrollments: {
              some: {
                ...baseUserWhere.userCohort.some.enrollments.some,
                expired: true,
              },
            },
          },
        },
      },
    });

    const pendingCount = await cachedPrisma.user.count({
      where: {
        ...baseUserWhere,
        userCohort: {
          some: {
            ...baseUserWhere.userCohort.some,
            enrollments: {
              some: {
                ...baseUserWhere.userCohort.some.enrollments.some,
                activated_at: null,
              },
            },
          },
        },
      },
    });

    return {
      count,
      maleCount,
      femaleCount,
      activeCount,
      completedCount,
      expiredCount,
      pendingCount,
    };
  },
  ['enrollment-stats'],
  {
    tags: ['enrollments', 'dashboard'],
    revalidate: 300, // 5 minutes
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Rate limiting
  const identifier = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'anonymous';
  const allowed = await rateLimiter.limitApiRequest('enrollments', identifier as string, 100, 60000);
  
  if (!allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests, please try again later',
    });
  }

  const token = await getToken({ req });
  if (!token) {
    return res.status(401).send({
      error: 'Invalid authentication',
    });
  }

  if (req.method === 'GET') {
    try {
      const { 
        user_email, 
        page, 
        limit, 
        cohort, 
        course, 
        status, 
        gender, 
        search, 
        dateFrom, 
        dateTo 
      } = req.query;
      
      // Handle pagination requests (admin dashboard)
      if (page !== undefined && limit !== undefined) {
        const pageNum = parseInt(page as string) || 0;
        const limitNum = parseInt(limit as string) || 10;
        const cohortId = cohort as string;
        
        // Parse course filter (can be comma-separated)
        const courseFilter = course ? (course as string).split(',') : [];
        
        // Get cached enrollment data with all filters
        const enrollmentData = await cachedPrisma.getCachedEnrollments({
          page: pageNum,
          limit: limitNum,
          cohort: cohortId,
          course: courseFilter,
          status: status as string,
          gender: gender as string,
          search: search as string,
          dateFrom: dateFrom as string,
          dateTo: dateTo as string,
        });
        
        // Get cached statistics
        const stats = await getCachedEnrollmentStats(cohortId);
        
        return res.status(200).json(bigint_filter({
          ...enrollmentData,
          ...stats,
          // Ensure filtered count takes precedence over unfiltered stats count
          count: enrollmentData.pagination?.total || stats.count,
        }));
      }
      
      // Handle user-specific enrollment requests
      if (!user_email) {
        return res.status(400).send({
          error: 'user_email parameter is required for user-specific requests',
        });
      }

      // Get cached user enrollment data
      const userData = await cachedPrisma.getCachedEnrollments({
        user_email: user_email as string,
      });
      
      return res.status(200).json(bigint_filter(userData));
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      return res.status(500).send({
        error: 'Internal server error',
      });
    }
  }

  if (req.method === 'POST') {
    try {
      let { user_email, userCohortId, ...data } =
        typeof req.body === 'object' ? req.body : JSON.parse(req.body);
      user_email = user_email.toLowerCase();

      // Find user
      const user = await cachedPrisma.user.findUniqueOrThrow({
        where: { email: user_email },
        include: {
          userCohort: {
            include: {
              cohort: true,
            },
          },
        },
      });

      const userProfile = await cachedPrisma.profile.findUnique({
        where: {
          userId: user.id,
        },
        select: {
          ageRange: true,
          stateOfResidence: true,
          educationLevel: true,
        },
      });

      if (!userProfile) {
        return res.status(404).send({ message: 'User profile not found' });
      }

      if (data.percentage_completed) {
        data.percentage_completed = parseFloat(data.percentage_completed);
      }

      const enrollment = await cachedPrisma.enrollment.create({
        data: {
          enrolled: false,
          ...data,
          userCohort: {
            connect: { id: user.userCohort[0]?.id },
          },
        },
      });

      // Revalidate caches after creating enrollment
      await revalidateAfterChange('enrollment', {
        cohortId: user.userCohort[0]?.cohortId,
      });

      return res
        .status(201)
        .send(bigint_filter({ message: 'Enrollment created', ...enrollment }));
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        return res.status(400).send(err.message);
      }
      return res.status(400).send('An error occurred');
    }
  }

  if (req.method === 'PUT') {
    try {
      let { user_email, ...data } = JSON.parse(req.body);
      user_email = user_email.toLowerCase();

      const user = await cachedPrisma.user.findUniqueOrThrow({
        where: { email: user_email },
      });

      const enrollment = await cachedPrisma.enrollment.upsert({
        where: {
          id: data.id,
        },
        update: {
          ...data,
          enrolled: data.id ? true : false,
        },
        create: {
          userId: user.id,
          ...data,
          enrolled: data.id ? true : false,
        },
      });

      // Revalidate caches after updating enrollment
      await revalidateAfterChange('enrollment');

      return res
        .status(201)
        .send(bigint_filter({ message: 'Enrollment created', ...enrollment }));
    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        return res.status(400).send(err.message);
      }
      return res.status(500).send({
        error: 'E no work.',
      });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
