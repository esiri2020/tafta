import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prismadb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { cohortId } = req.query;

    // Get all unique referrer names from the Referrer table (these are our "mobilizer codes")
    const allReferrerNames = await prisma.referrer.findMany({
      select: { fullName: true },
      distinct: ['fullName'],
      orderBy: { fullName: 'asc' },
    });

    // Get registered mobilizers from database
    const registeredMobilizers = await prisma.mobilizer.findMany({
      select: {
        id: true,
        code: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        organization: true,
        status: true,
        totalReferrals: true,
        activeReferrals: true,
        completedReferrals: true,
      }
    }).catch((error) => {
      console.error('Error fetching mobilizers:', error);
      return [];
    });

    // Create a map of registered mobilizers by code
    const registeredMobilizerMap = new Map();
    registeredMobilizers.forEach(mobilizer => {
      registeredMobilizerMap.set(mobilizer.code, mobilizer);
    });

    // Process each referrer name to get participant data
    const mobilizerData = await Promise.all(
      allReferrerNames.map(async (referrerRecord) => {
        const code = referrerRecord.fullName;
        const registeredMobilizer = registeredMobilizerMap.get(code);
        
        // Get participant data for this mobilizer code
        let participants = [];
        
        // For both registered and unregistered mobilizers, query by Referrer table
        // This is the correct way to get all referrals for a given referrer name
        participants = await prisma.profile.findMany({
          where: {
            referrer: {
              fullName: code, // Query by referrer name
            },
            ...(cohortId ? {
              user: {
                userCohort: {
                  some: {
                    cohortId: cohortId as string,
                  },
                },
              },
            } : {}),
          },
          include: {
            user: {
              include: {
                userCohort: {
                  include: {
                    cohort: true,
                    enrollments: true,
                  },
                },
              },
            },
            referrer: true,
          },
        }).catch((error) => {
          console.error(`Error fetching participants for referrer ${code}:`, error);
          return [];
        });

        // Calculate statistics
        const totalReferrals = participants.length;
        const activeReferrals = participants.filter(p => 
          p.user.userCohort.some(uc => 
            uc.enrollments.some(e => !e.completed && !e.expired)
          )
        ).length;
        const completedReferrals = participants.filter(p => 
          p.user.userCohort.some(uc => 
            uc.enrollments.some(e => e.completed)
          )
        ).length;

        console.log(`Mobilizer ${code}: ${totalReferrals} total referrals, ${activeReferrals} active, ${completedReferrals} completed`);

        return {
          code,
          status: registeredMobilizer ? 'ACTIVE' : 'PENDING',
          fullName: registeredMobilizer?.fullName || '',
          email: registeredMobilizer?.email || '',
          phoneNumber: registeredMobilizer?.phoneNumber || '',
          organization: registeredMobilizer?.organization || '',
          totalReferrals,
          activeReferrals,
          completedReferrals,
          completionRate: totalReferrals > 0 ? Math.round((completedReferrals / totalReferrals) * 100) : 0,
          createdAt: registeredMobilizer?.createdAt || null,
          updatedAt: registeredMobilizer?.updatedAt || null,
          userId: registeredMobilizer?.userId || null,
          id: registeredMobilizer?.id || null,
        };
      })
    );

    // Sort by total referrals descending, then by code
    mobilizerData.sort((a, b) => {
      if (b.totalReferrals !== a.totalReferrals) {
        return b.totalReferrals - a.totalReferrals;
      }
      return a.code.localeCompare(b.code);
    });

    // Extract just the codes for the dropdown
    const codes = mobilizerData.map(m => m.code);

    res.status(200).json({
      message: 'success',
      codes: codes,
      mobilizers: mobilizerData,
      total: mobilizerData.length,
    });
  } catch (error) {
    console.error('Error fetching mobilizer data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}