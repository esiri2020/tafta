import type {NextApiRequest, NextApiResponse} from 'next';
import {getToken} from 'next-auth/jwt';
import {prisma} from '@/lib/prisma'; // Standardize Prisma import

// Add helper function to handle BigInt serialization
function bigintToNumber(value: any): any {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map(bigintToNumber);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, bigintToNumber(v)])
    );
  }
  return value;
}

interface MonthData {
  month: string;
  [key: string]: string | number; // Allow string indexing with string or number values
}

// Add interfaces for the data types
interface Enrollment {
  course_id: bigint;
  _count: {
    course_id: number;
  };
}

interface CompletionData {
  _avg: {
    percentage_completed: number | null;
  };
}

interface EnrollmentData {
  percentage_completed: number | null;
}

// Add interface for business type data
interface BusinessTypeData {
  type: string;
  count: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Get the token from the request
    const token = await getToken({req});
    if (!token || !token.userData) {
      return res.status(401).json({
        error:
          'You must be signed in to view the protected content on this page.',
      });
    }

    const userRole = token.userData.role || '';
    if (
      !['SUPERADMIN', 'ADMIN', 'SUPPORT', 'GUEST'].includes(userRole)
    ) {
      return res.status(403).json({error: 'Unauthorized.'});
    }

    // Get the cohortId from the URL and ensure it's a string
    const cohortIdParam = req.query.cohortId;
    // If cohortId is an array, take the first value
    const cohortId = Array.isArray(cohortIdParam)
      ? cohortIdParam[0]
      : cohortIdParam;

    // Define a base condition for filtering by cohort
    const cohortFilter = cohortId
      ? {
          cohortId,
        }
      : {}; // Empty object means no filter, so include all cohorts

    const total_enrolled_by_courses = await prisma.enrollment.count({
      where: {
        userCohort: cohortId ? {cohortId} : undefined,
      },
    });

    const total_enrolled_applicants = await prisma.user.count({
      where: {
        userCohort: {
          some: {
            ...cohortFilter,
            enrollments: {
              some: {},
            },
          },
        },
      },
    });

    const female_enrollments = await prisma.user.count({
      where: {
        profile: {
          gender: {
            equals: 'FEMALE',
          },
        },
        userCohort: {
          some: {
            ...cohortFilter,
            enrollments: {
              some: {},
            },
          },
        },
      },
    });

    const male_enrollments = await prisma.user.count({
      where: {
        profile: {
          gender: {
            equals: 'MALE',
          },
        },
        userCohort: {
          some: {
            ...cohortFilter,
            enrollments: {
              some: {},
            },
          },
        },
      },
    });

    const active_enrollees = await prisma.user.count({
      where: {
        userCohort: {
          some: {
            ...cohortFilter,
            enrollments: {
              some: {
                AND: [
                  {
                    started_at: {
                      not: null,
                    },
                  },
                  {
                    completed: {
                      equals: false,
                    },
                  },
                ],
              },
            },
          },
        },
      },
    });

    const certified_enrollees = await prisma.user.count({
      where: {
        userCohort: {
          some: {
            ...cohortFilter,
            enrollments: {
              some: {
                completed: {
                  equals: true,
                },
              },
            },
          },
        },
      },
    });

    const total_applicants = await prisma.user.count({
      where: {
        userCohort: {
          some: {
            ...cohortFilter,
          },
        },
      },
    });

    const enrollment_completion_graph =
      await prisma.enrollmentCompletionGraph.findMany({
        where: {
          date: {
            not: null,
          },
          count: {
            not: 0,
          },
        },
      });

    const inactive_enrollments = await prisma.enrollment.count({
      where: {
        started_at: {
          equals: null,
        },
        userCohort: {
          cohortId: cohortId || undefined,
        },
      },
    });

    // Define the age ranges
    const ageRanges = [
      {min: 15, max: 19, label: '15-19'},
      {min: 20, max: 24, label: '20-24'},
      {min: 25, max: 29, label: '25-29'},
      {min: 30, max: 34, label: '30-34'},
      {min: 35, max: 39, label: '35-39'},
      {min: 40, max: 44, label: '40-44'},
      {min: 45, max: 49, label: '45-49'},
      {min: 50, max: 54, label: '50-54'},
      {min: 55, max: 59, label: '55-59'},
      {min: 60, max: 64, label: '60-64'},
    ];

    // Fetch age range counts from the database using groupBy
    const ageRangeCountsRaw = await prisma.profile.groupBy({
      by: ['ageRange'],
      _count: {
        ageRange: true,
      },
      where: {
        user: {
          userCohort: {
            some: {
              ...cohortFilter,
            },
          },
        },
      },
    });

    // Initialize an object to store the counts for each age group, ensuring all age ranges are present
    const ageGroupCounts: Record<string, number> = ageRanges.reduce(
      (acc: Record<string, number>, range) => {
        acc[range.label] = 0;
        return acc;
      },
      {},
    );

    // Map the raw grouped data to the predefined age ranges
    ageRangeCountsRaw.forEach(item => {
      const ageRangeLabel = item.ageRange;
      if (ageRangeLabel && ageRangeLabel.match(/^\d+\s*-\s*\d+$/)) {
        const [minAgeStr, maxAgeStr] = ageRangeLabel.split('-');
        const minAge = Number.parseInt(minAgeStr.trim());
        const maxAge = Number.parseInt(maxAgeStr.trim());

        const matchedRange = ageRanges.find(
          range => minAge >= range.min && maxAge <= range.max,
        );

        if (matchedRange) {
          ageGroupCounts[matchedRange.label] += item._count.ageRange;
        }
      }
    });

    // Convert the ageGroupCounts object into an array of objects with keys 'ageRange' and 'count'
    const age_range = Object.entries(ageGroupCounts)
      .map(([ageRange, count]) => ({
        ageRange,
        count,
      }))
      .sort((a, b) => {
        // Extract the minimum ages from the ageRange labels
        const aMinAge = Number.parseInt(a.ageRange.split('-')[0]);
        const bMinAge = Number.parseInt(b.ageRange.split('-')[0]);

        // Sort in ascending order based on the minimum ages
        return aMinAge - bMinAge;
      })
      .reverse();

    const locations = ['Kano', 'Lagos', 'Ogun'];

    const locationCounts = await Promise.all(
      locations.map(async location => {
        const count = await prisma.user.count({
          where: {
            profile: {
              stateOfResidence: {
                equals: location,
              },
            },
            userCohort: {
              some: {
                ...cohortFilter,
              },
            },
          },
        });
        return {location, count};
      }),
    );

    // Filter locations with count greater than 0
    const location = locationCounts.filter(item => item.count > 0);

    // Fetching status of residency data
    const statusOfResidency = {
      refugee: await prisma.user.count({
        where: {
          profile: {
            residencyStatus: {
              equals: 'refugee',
            },
          },
          userCohort: {
            some: {
              ...cohortFilter,
            },
          },
        },
      }),
      migrant_workers: await prisma.user.count({
        where: {
          profile: {
            residencyStatus: {
              equals: 'migrant-worker',
            },
          },
          userCohort: {
            some: {
              ...cohortFilter,
            },
          },
        },
      }),
      idp: await prisma.user.count({
        where: {
          profile: {
            residencyStatus: {
              equals: 'idp',
            },
          },
          userCohort: {
            some: {
              ...cohortFilter,
            },
          },
        },
      }),
      non_resident: await prisma.user.count({
        where: {
          profile: {
            residencyStatus: {
              equals: 'non-resident',
            },
          },
          userCohort: {
            some: {
              ...cohortFilter,
            },
          },
        },
      }),
      resident: await prisma.user.count({
        where: {
          profile: {
            residencyStatus: {
              equals: 'resident',
            },
          },
          userCohort: {
            some: {
              ...cohortFilter,
            },
          },
        },
      }),
    };

    // NEW METRICS BASED ON SCHEMA

    // 1. Education Level Distribution
    const educationLevels = [
      'ELEMENTRY_SCHOOL',
      'SECONDARY_SCHOOL',
      'COLLEGE_OF_EDUCATION',
      'ND_HND',
      'BSC',
      'MSC',
      'PHD',
    ];
    const educationLevelData = await Promise.all(
      educationLevels.map(async level => {
        const count = await prisma.user.count({
          where: {
            profile: {
              educationLevel: level as any,
            },
            userCohort: {
              some: {
                ...cohortFilter,
              },
            },
          },
        });
        return {level, count};
      }),
    );

    // 2. Community Area Distribution (Urban vs Rural)
    const communityAreaData = {
      urban: await prisma.user.count({
        where: {
          profile: {
            communityArea: 'URBAN',
          },
          userCohort: {
            some: {
              ...cohortFilter,
            },
          },
        },
      }),
      rural: await prisma.user.count({
        where: {
          profile: {
            communityArea: 'RURAL',
          },
          userCohort: {
            some: {
              ...cohortFilter,
            },
          },
        },
      }),
      periUrban: await prisma.user.count({
        where: {
          profile: {
            communityArea: 'PERI_URBANS',
          },
          userCohort: {
            some: {
              ...cohortFilter,
            },
          },
        },
      }),
    };

    // 3. Registration Type Distribution
    const registrationTypeData = {
      individual: await prisma.user.count({
        where: {
          profile: {
            registrationPath: 'INDIVIDUAL',
          },
          userCohort: {
            some: {
              ...cohortFilter,
            },
          },
        },
      }),
      enterprise: await prisma.user.count({
        where: {
          profile: {
            registrationPath: 'ENTERPRISE',
          },
          userCohort: {
            some: {
              ...cohortFilter,
            },
          },
        },
      }),
    };

    // 4. Business Type Distribution
    const businessTypes = ['INFORMAL', 'STARTUP', 'FORMAL_EXISTING'];
    const businessTypeData = await Promise.all(
      businessTypes.map(async type => {
        const count = await prisma.user.count({
          where: {
            profile: {
              businessType: type as any,
            },
            userCohort: {
              some: {
                ...cohortFilter,
              },
            },
          },
        });
        return {type, count} as BusinessTypeData;
      }),
    );

    // 5. Business Size Distribution
    const businessSizes = ['MICRO', 'SMALL', 'MEDIUM', 'LARGE'];
    const businessSizeData = await Promise.all(
      businessSizes.map(async size => {
        const count = await prisma.user.count({
          where: {
            profile: {
              businessSize: size as any,
            },
            userCohort: {
              some: {
                ...cohortFilter,
              },
            },
          },
        });
        return {size, count};
      }),
    );

    // 6. Employment Status Distribution
    const employmentStatusData = await prisma.profile.groupBy({
      by: ['employmentStatus'],
      _count: {
        employmentStatus: true,
      },
      where: {
        employmentStatus: {
          not: null,
        },
        user: {
          userCohort: {
            some: {
              ...cohortFilter,
            },
          },
        },
      },
    });

    const formattedEmploymentStatusData = employmentStatusData.map(item => ({
      status: item.employmentStatus,
      count: item._count.employmentStatus,
    }));

    // 7. Course Enrollment Distribution
    const courseEnrollmentData = await prisma.enrollment.groupBy({
      by: ['course_id'],
      where: {
        userCohort: cohortId ? {cohortId} : undefined,
      },
      _count: {
        course_id: true,
      },
    });

    // Get course names and gender breakdown for the enrollment data
    const courseEnrollmentDataWithNames = await Promise.all(
      courseEnrollmentData.map(async (enrollment: { course_id: bigint; _count?: { course_id?: number } }) => {
        const course = await prisma.course.findUnique({
          where: {
            id: enrollment.course_id,
          },
          select: {
            name: true,
          },
        });
        // Count male and female enrollments for this course
        const male_enrollments = await prisma.enrollment.count({
          where: {
            course_id: enrollment.course_id,
            userCohort: {
              cohortId: cohortId || undefined,
              user: {
                profile: {
                  gender: 'MALE',
                },
              },
            },
          },
        });
        const female_enrollments = await prisma.enrollment.count({
          where: {
            course_id: enrollment.course_id,
            userCohort: {
              cohortId: cohortId || undefined,
              user: {
                profile: {
                  gender: 'FEMALE',
                },
              },
            },
          },
        });
        return {
          name: course?.name || 'Unknown Course',
          count: enrollment._count?.course_id?.toString() || '0',
          male_enrollments: male_enrollments.toString(),
          female_enrollments: female_enrollments.toString(),
        };
      })
    );

    // 8. Internship Program Distribution
    const internshipPrograms = [
      'TheatreGroup',
      'ShortFilm',
      'MarketingCommunication',
      'CreativeManagementConsultant',
      'SponsorshipMarketers',
      'ContentCreationSkits',
    ];

    const internshipProgramData = await Promise.all(
      internshipPrograms.map(async program => {
        const count = await prisma.user.count({
          where: {
            profile: {
              internshipProgram: program as any,
            },
            userCohort: {
              some: {
                ...cohortFilter,
              },
            },
          },
        });
        return {program, count};
      }),
    );

    // 9. Project Type Distribution
    const projectTypes = [
      'GroupInternship',
      'IndividualInternship',
      'CorporateInternship',
    ];

    const projectTypeData = await Promise.all(
      projectTypes.map(async type => {
        const count = await prisma.user.count({
          where: {
            profile: {
              projectType: type as any,
            },
            userCohort: {
              some: {
                ...cohortFilter,
              },
            },
          },
        });
        return {type, count};
      }),
    );

    // 10. Enrollment Progress Distribution
    const enrollmentProgressData = await prisma.enrollment.groupBy({
      by: ['userCohortId'],
      _avg: {
        percentage_completed: true,
      },
      where: {
        userCohort: {
          cohortId: cohortId || undefined,
        },
      },
    });

    // Calculate average completion percentage across all enrollments
    const totalEnrollments = enrollmentProgressData.length;
    const avgCompletionPercentage =
      totalEnrollments > 0
        ? enrollmentProgressData.reduce(
            (sum: number, item: { _avg: { percentage_completed: number | null } }) => 
              sum + (item._avg.percentage_completed || 0),
            0,
          ) / totalEnrollments
        : 0;

    // Group enrollments by completion percentage ranges
    const completionRanges = [
      {min: 0, max: 25, label: '0-25%'},
      {min: 26, max: 50, label: '26-50%'},
      {min: 51, max: 75, label: '51-75%'},
      {min: 76, max: 100, label: '76-100%'},
    ];

    const enrollments = await prisma.enrollment.findMany({
      select: {
        percentage_completed: true,
      },
      where: {
        userCohort: {
          cohortId: cohortId || undefined,
        },
      },
    });

    const completionRangeData = completionRanges.map(range => {
      const count = enrollments.filter(
        (e: { percentage_completed: number | null }) =>
          e.percentage_completed !== null &&
          e.percentage_completed >= range.min &&
          e.percentage_completed <= range.max,
      ).length;

      return {
        range: range.label,
        count: count.toString(),
      };
    });

    // Generate location trends data
    const generateLocationTrends = async () => {
      // Get the top locations with enrollments (based on the filtered location data)
      const topLocations = location.slice(0, 4).map(loc => loc.location);

      // Define the months we want to include (last 6 months)
      const months = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          name: monthDate.toLocaleString('default', {month: 'short'}),
          startDate: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1),
          endDate: new Date(
            monthDate.getFullYear(),
            monthDate.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          ),
        });
      }

      // For each month, get the enrollment count for each location
      const locationTrendsData = [];

      for (const month of months) {
        const monthData: MonthData = {
          month: month.name,
        };

        for (const locationName of topLocations) {
          // Count enrollments for this location in this month
          const enrollmentCount = await prisma.enrollment.count({
            where: {
              created_at: {
                gte: month.startDate,
                lte: month.endDate,
              },
              userCohort: {
                cohortId: cohortId || undefined,
                user: {
                  profile: {
                    stateOfResidence: locationName,
                  },
                },
              },
            },
          });

          // Add the count to the month data
          monthData[locationName] = enrollmentCount;
        }

        locationTrendsData.push(monthData);
      }

      return locationTrendsData;
    };

    // Execute the function and get the location trends data
    const location_trends = await generateLocationTrends();

    // END of your data fetching code

    // Return the data
    const responseData = {
      total_enrolled_by_courses: total_enrolled_by_courses.toString(),
      total_enrolled_applicants: total_enrolled_applicants.toString(),
      female_enrollments: female_enrollments.toString(),
      male_enrollments: male_enrollments.toString(),
      active_enrollees: active_enrollees.toString(),
      certified_enrollees: certified_enrollees.toString(),
      total_applicants: total_applicants.toString(),
      enrollment_completion_graph: enrollment_completion_graph
        .filter(item => {
          if (!item.date) return false;
          if (typeof item.date === 'string') return !isNaN(new Date(item.date).getTime());
          if (item.date instanceof Date) return !isNaN(item.date.getTime());
          return false;
        })
        .map(item => ({
          date: (item.date instanceof Date)
            ? item.date.toISOString().split('T')[0]
            : (typeof item.date === 'string' && !isNaN(new Date(item.date).getTime()))
              ? new Date(item.date).toISOString().split('T')[0]
              : null,
          count: item.count.toString(),
        })),
      inactive_enrollments: inactive_enrollments.toString(),
      courseEnrollmentData: courseEnrollmentDataWithNames,
      age_range: age_range.map(item => ({
        ageRange: item.ageRange,
        count: item.count.toString(),
      })),
      location: location.map(item => ({
        location: item.location,
        count: item.count.toString(),
      })),
      statusOfResidency: {
        refugee: statusOfResidency.refugee.toString(),
        migrant_workers: statusOfResidency.migrant_workers.toString(),
        idp: statusOfResidency.idp.toString(),
        resident: statusOfResidency.resident.toString(),
      },
      educationLevelData: educationLevelData.map(item => ({
        level: item.level
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, l => l.toUpperCase()),
        count: item.count.toString(),
      })),
      communityAreaData: {
        urban: communityAreaData.urban.toString(),
        rural: communityAreaData.rural.toString(),
        periUrban: communityAreaData.periUrban.toString(),
      },
      registrationTypeData: {
        individual: registrationTypeData.individual.toString(),
        enterprise: registrationTypeData.enterprise.toString(),
      },
      businessTypeData: businessTypeData.map(item => ({
        type: item.type
          .replace(/_/g, ' ')
          .toLowerCase()
          .replace(/\b\w/g, l => l.toUpperCase()),
        count: item.count.toString(),
      })),
      businessSizeData: businessSizeData.map(item => ({
        size: item.size.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        count: item.count.toString(),
      })),
      employmentStatusData: formattedEmploymentStatusData.map(item => ({
        status: item.status,
        count: item.count.toString(),
      })),
      internshipProgramData: internshipProgramData.map(item => ({
        program: item.program.replace(/([A-Z])/g, ' $1').trim(),
        count: item.count.toString(),
      })),
      projectTypeData: projectTypeData.map(item => ({
        type: item.type.replace(/([A-Z])/g, ' $1').trim(),
        count: item.count.toString(),
      })),
      enrollmentProgressData: {
        averageCompletion: avgCompletionPercentage.toFixed(2),
        completionRanges: completionRangeData.map(item => ({
          range: item.range,
          count: item.count,
        })),
      },
      location_trends,
    };

    // Convert any remaining BigInt values to strings
    const serializedData = bigintToNumber(responseData);
    return res.json(serializedData);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({error: err.message});
  }
}
