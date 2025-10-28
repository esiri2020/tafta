import { PrismaClient } from '@prisma/client';
import { cacheManager, CacheKeys } from './redis';

// Extend Prisma client with caching capabilities
export class CachedPrismaClient extends PrismaClient {
  private cachePrefix = 'prisma'

  /**
   * Helper function to sanitize search queries for PostgreSQL tsquery
   * Prevents tsquery syntax errors from malformed queries
   */
  private sanitizeSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') return '';
    
    // Remove extra whitespace and split into terms
    const terms = query.trim().split(/\s+/).filter(term => term.length > 0);
    
    // If no valid terms, return empty string
    if (terms.length === 0) return '';
    
    // Join terms with ' | ' for OR search, ensuring no trailing pipe
    return terms.join(' | ');
  };
  
  /**
   * Cache Prisma query results with automatic invalidation
   */
  async cachedQuery<T>(
    operation: string,
    key: string,
    query: () => Promise<T>,
    ttlSeconds: number = 300,
    tags: string[] = []
  ): Promise<T> {
    const cacheKey = `${this.cachePrefix}:${operation}:${key}`;
    
    return cacheManager.getOrSetWithLock(
      cacheKey,
      query,
      ttlSeconds
    );
  }
  
  /**
   * Cached enrollment queries
   */
  async getCachedEnrollments(params: {
    page?: number;
    limit?: number;
    cohort?: string;
    course?: string[];
    status?: string;
    gender?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    user_email?: string;
  }) {
    const cacheKey = CacheKeys.enrollments(params);
    
    // Implement size-aware caching - split large datasets
    const { limit = 10 } = params;
    const maxCacheableLimit = 100; // Limit cache to 100 records max
    const actualLimit = Math.min(limit, maxCacheableLimit);
    
    // For large queries, bypass cache and query directly
    if (limit > maxCacheableLimit) {
      console.log(`Query too large for cache (limit: ${limit}), querying directly`);
      return this.getEnrollmentsDirectly({ ...params, limit: actualLimit });
    }
    
    return this.cachedQuery(
      'enrollments',
      cacheKey,
      async () => {
        const { 
          page = 0, 
          limit = 10, 
          cohort, 
          course, 
          status, 
          gender, 
          search, 
          dateFrom, 
          dateTo, 
          user_email 
        } = params;
        const offset = page * actualLimit;
        
        // Handle user-specific requests
        if (user_email) {
          const user = await this.user.findUnique({
            where: { email: user_email.toLowerCase() },
            include: {
              userCohort: {
                include: {
                  cohort: true,
                  enrollments: true,
                },
              },
            },
          });
          
          if (!user) {
            throw new Error('User not found');
          }
          
          return {
            ...user,
            enrollments: user.userCohort?.[0]?.enrollments || []
          };
        }
        
        // Build where clause for filtering
        let whereClause: any = {};
        
        // Cohort filter
        if (cohort) {
          whereClause.userCohort = {
            cohortId: cohort
          };
        }
        
        // Course filter
        if (course && course.length > 0) {
          const courseIds = course.map(c => BigInt(c));
          whereClause.course_id = {
            in: courseIds
          };
        }
        
        // Status filter
        if (status) {
          switch (status) {
            case 'expired':
              whereClause.expired = true;
              break;
            case 'completed':
              whereClause.completed = true;
              break;
            case 'active':
              whereClause.completed = false;
              whereClause.expired = false;
              whereClause.enrolled = true;
              break;
            case 'pending':
              whereClause.activated_at = null;
              break;
          }
        }
        
        // Date range filter
        if (dateFrom || dateTo) {
          console.log('🔍 Enrollment Date Filter Debug:', {
            dateFrom,
            dateTo,
            dateFromParsed: dateFrom ? new Date(dateFrom).toISOString() : null,
            dateToParsed: dateTo ? new Date(dateTo).toISOString() : null,
            whereClauseBefore: JSON.stringify(whereClause, null, 2)
          });
          
          whereClause.activated_at = {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo) } : {}),
          };
          
          console.log('🔍 Enrollment Date Filter - Final whereClause:', {
            activated_at: whereClause.activated_at,
            fullWhereClause: JSON.stringify(whereClause, null, 2)
          });
        }
        
        // Search filter
        if (search) {
          if (whereClause.userCohort) {
            whereClause.userCohort.user = {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            };
          } else {
            whereClause.userCohort = {
              user: {
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } },
                ],
              },
            };
          }
        }
        
        // Gender filter
        if (gender) {
          if (whereClause.userCohort) {
            if (whereClause.userCohort.user) {
              whereClause.userCohort.user.profile = {
                gender: gender.toUpperCase(),
              };
            } else {
              whereClause.userCohort.user = {
                profile: {
                  gender: gender.toUpperCase(),
                },
              };
            }
          } else {
            whereClause.userCohort = {
              user: {
                profile: {
                  gender: gender.toUpperCase(),
                },
              },
            };
          }
        }
        
        const [enrollments, totalCount] = await Promise.all([
          this.enrollment.findMany({
            where: whereClause,
            include: {
              userCohort: {
                include: {
                  cohort: true,
                  user: {
                    include: {
                      profile: true
                    }
                  }
                }
              }
            },
            skip: offset,
            take: actualLimit,
            orderBy: {
              created_at: 'desc'
            }
          }),
          this.enrollment.count({
            where: whereClause
          })
        ]);
        
        return {
          enrollments,
          pagination: {
            page,
            limit: actualLimit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / actualLimit)
          }
        };
      },
      300, // 5 minutes TTL
      [CacheKeys.tags.enrollments]
    );
  }

  /**
   * Direct enrollment queries for large datasets (bypasses cache)
   */
  private async getEnrollmentsDirectly(params: {
    page?: number;
    limit?: number;
    cohort?: string;
    course?: string[];
    status?: string;
    gender?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    user_email?: string;
  }) {
    const { 
      page = 0, 
      limit = 10, 
      cohort, 
      course, 
      status, 
      gender, 
      search, 
      dateFrom, 
      dateTo, 
      user_email 
    } = params;
    const offset = page * limit;
    
    // Use the same query logic but without caching for large datasets
    let whereClause: any = {};
    
    if (cohort) {
      whereClause.userCohort = { cohortId: cohort };
    }
    
    if (course && course.length > 0) {
      whereClause.course_id = { in: course };
    }
    
    if (status) {
      if (status === 'active') {
        whereClause.enrolled = true;
        whereClause.completed = false;
        whereClause.expired = false;
      } else if (status === 'completed') {
        whereClause.completed = true;
      } else if (status === 'expired') {
        whereClause.expired = true;
      }
    }
    
    if (search) {
      whereClause.OR = [
        { course_name: { search: search } },
        { userCohort: { user: { firstName: { search: search } } } },
        { userCohort: { user: { lastName: { search: search } } } },
        { userCohort: { user: { email: { search: search } } } }
      ];
    }
    
    if (dateFrom || dateTo) {
      whereClause.created_at = {};
      if (dateFrom) whereClause.created_at.gte = new Date(dateFrom);
      if (dateTo) whereClause.created_at.lte = new Date(dateTo);
    }
    
    if (gender) {
      if (whereClause.userCohort) {
        if (whereClause.userCohort.user) {
          whereClause.userCohort.user.profile = {
            gender: gender.toUpperCase(),
          };
        } else {
          whereClause.userCohort.user = {
            profile: {
              gender: gender.toUpperCase(),
            },
          };
        }
      } else {
        whereClause.userCohort = {
          user: {
            profile: {
              gender: gender.toUpperCase(),
            },
          },
        };
      }
    }
    
    const [enrollments, totalCount] = await Promise.all([
      this.enrollment.findMany({
        where: whereClause,
        include: {
          userCohort: {
            include: {
              cohort: { select: { id: true, name: true, color: true } }, // Reduce data size
              user: {
                select: { // Reduce user data size
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  profile: {
                    select: {
                      gender: true,
                      ageRange: true,
                      stateOfResidence: true
                    }
                  }
                }
              }
            }
          }
        },
        skip: offset,
        take: limit,
        orderBy: {
          created_at: 'desc'
        }
      }),
      this.enrollment.count({
        where: whereClause
      })
    ]);
    
    return {
      enrollments,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    };
  }
  
  /**
   * Cached applicant queries
   */
  async getCachedApplicants(params: {
    page?: number;
    limit?: number;
    filter?: string;
    query?: string;
    cohortId?: string;
    mobilizerId?: string;
    mobilizerCode?: string;
  }) {
    const cacheKey = CacheKeys.applicants(params);
    
    return this.cachedQuery(
      'applicants',
      cacheKey,
      async () => {
        const { 
          page = 0, 
          limit = 30, 
          filter, 
          query, 
          cohortId,
          mobilizerId,
          mobilizerCode 
        } = params;
        
        const take = limit;
        const skip = page * take;
        
        // Get cohort-specific course IDs for filtering enrollments
        const cohortCourseIds = cohortId ? await this.cohortCourse.findMany({
          where: { cohortId },
          select: { course_id: true },
        }).then(results => results.map(r => r.course_id)) : [];
        
        const userCohortFilter = cohortId ? {
          some: {
            cohortId: cohortId,
          },
        } : undefined;
        
        // Handle mobilizer filtering
        let mobilizerCodeToFilter: string | undefined = mobilizerCode;
        
        if (mobilizerId && !mobilizerCode) {
          const mobilizer = await this.mobilizer.findUnique({
            where: { id: mobilizerId },
            select: { code: true },
          });
          mobilizerCodeToFilter = mobilizer?.code;
        }
        
        const mobilizerFilter = mobilizerCodeToFilter ? {
          profile: {
            referrer: {
              fullName: mobilizerCodeToFilter,
            },
          },
        } : undefined;
        
        // Build where conditions based on filters
        let whereConditions: any = {
          role: 'APPLICANT',
          userCohort: userCohortFilter,
          ...(mobilizerFilter || {}),
        };
        
        // Handle different filter types
        if (query) {
          const isEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
          
          if (isEmail.test(query)) {
            whereConditions.email = { search: query };
          } else {
            const sanitizedQuery = this.sanitizeSearchQuery(query);
            if (sanitizedQuery) {
              whereConditions.OR = [
                {
                  firstName: { search: sanitizedQuery },
                  lastName: { search: sanitizedQuery },
                },
              ];
            }
          }
        } else if (filter === 'MALE' || filter === 'FEMALE') {
          whereConditions.profile = { gender: filter };
        } else if (filter === 'Active') {
          whereConditions.userCohort = {
            some: {
              enrollments: {
                some: {
                  expired: false,
                  completed: false,
                },
              },
              ...(cohortId ? { cohortId } : {}),
            },
          };
        } else if (filter === 'awaiting_approval') {
          whereConditions.thinkific_user_id = null;
        }
        
        const [applicants, count] = await Promise.all([
          this.user.findMany({
            where: whereConditions,
            include: {
              profile: {
                include: {
                  referrer: true
                }
              },
              userCohort: {
                include: {
                  enrollments: {
                    ...(cohortId ? {
                      where: {
                        course_id: {
                          in: cohortCourseIds,
                        },
                      },
                    } : {}),
                  },
                  cohort: true,
                  location: true
                },
              },
              assessment: true,
            },
            take,
            skip,
          }),
          this.user.count({
            where: whereConditions,
          })
        ]);
        
        return {
          applicants,
          count,
        };
      },
      300, // 5 minutes TTL
      [CacheKeys.tags.applicants]
    );
  }
  
  /**
   * Cached statistics queries
   */
  async getCachedStatistics(cohortId?: string) {
    const cacheKey = CacheKeys.statistics(cohortId);
    
    return this.cachedQuery(
      'statistics',
      cacheKey,
      async () => {
        // Get cohort-specific course IDs if cohortId is provided
        const cohortCourseIds = cohortId ? await this.cohortCourse.findMany({
          where: { cohortId },
          select: { course_id: true },
        }).then(results => results.map(r => r.course_id)) : [];
        
        // Get all courses from the database
        const courses = await this.course.findMany({
          select: { name: true },
        });
        
        // Initialize the stats structure
        const stats: Record<string, Record<string, { Female: number; Male: number; Total: number }>> = {
          LAGOS: {},
          OGUN: {},
          KANO: {},
        };
        
        // Initialize each state with all courses
        Object.keys(stats).forEach(state => {
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
        
        // Get enrollments with filtering
        const enrollmentsWhere: any = {
          completed: true,
        };
        
        if (cohortId) {
          enrollmentsWhere.userCohort = {
            cohortId: cohortId,
          };
          if (cohortCourseIds.length > 0) {
            enrollmentsWhere.course_id = {
              in: cohortCourseIds,
            };
          }
        }
        
        const enrollments = await this.enrollment.findMany({
          where: enrollmentsWhere,
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
        
        // Process enrollments
        enrollments.forEach(enrollment => {
          const state = enrollment.userCohort?.location?.name?.toUpperCase();
          const course = this.normalizeCourseName(enrollment.course_name);
          const gender = enrollment.userCohort?.user?.profile?.gender?.toUpperCase();
          
          if (state && course && gender && stats[state]?.[course]) {
            const genderKey = gender === 'FEMALE' ? 'Female' : 'Male';
            stats[state][course][genderKey]++;
            stats[state][course].Total++;
          }
        });
        
        // Calculate totals
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
        
        const grandTotal = Object.values(stateTotals).reduce(
          (sum, total) => sum + total,
          0,
        );
        
        return {
          stats,
          stateTotals,
          grandTotal,
        };
      },
      600, // 10 minutes TTL
      [CacheKeys.tags.statistics]
    );
  }
  
  /**
   * Normalize course names
   */
  private normalizeCourseName(name: string): string {
    const cleanName = name
      .replace(/[0-9()*\-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (cleanName.includes('Animation')) return 'Animation';
    if (cleanName.includes('Script Writing')) return 'Script Writing';
    if (cleanName.includes('Sound Design')) return 'Sound Design';
    if (cleanName.includes('Stage Lighting')) return 'Stage Lighting';
    if (cleanName.includes('Art Business')) return 'Art Business & Entrepreneurship';
    
    return cleanName;
  }
  
  /**
   * Invalidate cache for specific operations
   */
  async invalidateCache(operation: string, tags?: string[]) {
    try {
      if (tags) {
        for (const tag of tags) {
          await cacheManager.invalidateByTag(tag);
        }
      } else {
        await cacheManager.delPattern(`${this.cachePrefix}:${operation}:*`);
      }
    } catch (error) {
      console.error('❌ Cache invalidation error:', error);
    }
  }
}

// Export singleton instance
export const cachedPrisma = new CachedPrismaClient();
