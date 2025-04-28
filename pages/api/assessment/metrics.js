import {getServerSession} from 'next-auth/next';
import {authOptions} from '../auth/[...nextauth]';
import prisma from '../../../lib/prismadb';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({message: 'Unauthorized'});
    }

    // Only allow admin and super admin to access this endpoint
    if (
      session.userData.role !== 'ADMIN' &&
      session.userData.role !== 'SUPERADMIN'
    ) {
      return res.status(403).json({message: 'Forbidden'});
    }

    // Get optional cohort filter from query params
    const {cohortId} = req.query;

    // Basic assessment counts
    const totalAssessments = await prisma.assessment.count();

    // Filter for assessment counts if cohortId is provided
    const whereClause = cohortId
      ? {
          user: {
            userCohort: {
              some: {
                cohortId,
              },
            },
          },
        }
      : {};

    // Get counts by enrollment status
    const enrollmentStatusCounts = await prisma.assessment.groupBy({
      by: ['enrollmentStatus'],
      _count: {
        id: true,
      },
      where: whereClause,
    });

    // Get counts by course of study
    const courseOfStudyCounts = await prisma.assessment.groupBy({
      by: ['courseOfStudy'],
      _count: {
        id: true,
      },
      where: whereClause,
    });

    // Get counts by employment status
    const employmentStatusCounts = await prisma.assessment.groupBy({
      by: ['employmentStatus'],
      _count: {
        id: true,
      },
      where: whereClause,
    });

    // Get counts by employment type
    const employmentTypeCounts = await prisma.assessment.groupBy({
      by: ['employmentType'],
      _count: {
        id: true,
      },
      where: {
        ...whereClause,
        employmentStatus: 'employed',
      },
    });

    // Get counts by creative sector employment
    const creativeSectorCounts = await prisma.assessment.groupBy({
      by: ['employedInCreativeSector'],
      _count: {
        id: true,
      },
      where: whereClause,
    });

    // Get counts by satisfaction level
    const satisfactionLevelCounts = await prisma.assessment.groupBy({
      by: ['satisfactionLevel'],
      _count: {
        id: true,
      },
      where: whereClause,
    });

    // Get counts by skill rating
    const skillRatingCounts = await prisma.assessment.groupBy({
      by: ['skillRating'],
      _count: {
        id: true,
      },
      where: whereClause,
    });

    // Get recommendation counts
    const recommendationCounts = await prisma.assessment.groupBy({
      by: ['wouldRecommendTafta'],
      _count: {
        id: true,
      },
      where: whereClause,
    });

    // Get counts for platform ratings
    const platformRatingCounts = await prisma.assessment.groupBy({
      by: ['lmsPlatformRating'],
      _count: {
        id: true,
      },
      where: whereClause,
    });

    // Calculate percentages for recommendation
    const recommendations = recommendationCounts.map(item => ({
      value: item.wouldRecommendTafta,
      count: item._count.id,
      percentage: Math.round((item._count.id / totalAssessments) * 100),
    }));

    // Format data for charts
    const enrollmentStatus = enrollmentStatusCounts.map(item => ({
      status: item.enrollmentStatus || 'Unknown',
      count: item._count.id,
    }));

    const courseDistribution = courseOfStudyCounts.map(item => ({
      course: item.courseOfStudy || 'Unknown',
      count: item._count.id,
    }));

    const employmentStatus = employmentStatusCounts.map(item => ({
      status: item.employmentStatus || 'Unknown',
      count: item._count.id,
    }));

    const employmentTypes = employmentTypeCounts.map(item => ({
      type: item.employmentType || 'Unknown',
      count: item._count.id,
    }));

    const creativeSector = creativeSectorCounts.map(item => ({
      employed:
        item.employedInCreativeSector === true
          ? 'Yes'
          : item.employedInCreativeSector === false
          ? 'No'
          : 'Unknown',
      count: item._count.id,
    }));

    const satisfactionLevels = satisfactionLevelCounts.map(item => ({
      level: item.satisfactionLevel || 'Unknown',
      count: item._count.id,
    }));

    const skillRatings = skillRatingCounts.map(item => ({
      rating: item.skillRating || 'Unknown',
      count: item._count.id,
    }));

    const platformRatings = platformRatingCounts.map(item => ({
      rating: item.lmsPlatformRating || 'Unknown',
      count: item._count.id,
    }));

    // Get recent assessments
    const recentAssessments = await prisma.assessment.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      where: whereClause,
    });

    // Return all metrics
    return res.status(200).json({
      totalAssessments,
      enrollmentStatus,
      courseDistribution,
      employmentStatus,
      employmentTypes,
      creativeSector,
      satisfactionLevels,
      skillRatings,
      recommendations,
      platformRatings,
      recentAssessments,
    });
  } catch (error) {
    console.error('Assessment metrics API error:', error);
    return res
      .status(500)
      .json({message: 'Internal server error', error: error.message});
  }
}
