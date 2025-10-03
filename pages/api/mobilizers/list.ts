import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prismadb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Get ALL registered mobilizers (including those who haven't referred anyone yet)
    const allMobilizers = await prisma.mobilizer.findMany({
      select: {
        id: true,
        code: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        status: true,
        createdAt: true,
        organization: true,
      },
      orderBy: { status: 'asc' },
    });

    // Get unique referrer names from Referrer table (people who have referred others)
    const referrers = await prisma.referrer.findMany({
      select: { 
        fullName: true,
      },
      distinct: ['fullName'],
    });

    // Create a set of referrer names for quick lookup
    const referrerNames = new Set(referrers.map(r => r.fullName));

    // Create the final list: all mobilizers + referrers who aren't registered mobilizers
    const allCodes = new Map();

    // Add all mobilizers first
    allMobilizers.forEach(mobilizer => {
      allCodes.set(mobilizer.code, {
        id: mobilizer.id,
        code: mobilizer.code,
        phoneNumber: mobilizer.phoneNumber,
        email: mobilizer.email,
        organization: mobilizer.organization,
        status: mobilizer.status,
        fullName: mobilizer.fullName,
        createdAt: mobilizer.createdAt,
        isRegisteredMobilizer: true,
        mobilizerFullName: mobilizer.fullName,
      });
    });

    // Add referrers who aren't registered mobilizers
    referrers.forEach(referrer => {
      if (!allCodes.has(referrer.fullName)) {
        allCodes.set(referrer.fullName, {
          id: `referrer_${referrer.fullName}`,
          code: referrer.fullName,
          phoneNumber: null,
          email: null,
          organization: null,
          status: 'UNREGISTERED',
          fullName: referrer.fullName,
          createdAt: null,
          isRegisteredMobilizer: false,
          mobilizerFullName: null,
        });
      }
    });

    // Now let's get referral counts for all codes (both mobilizers and unregistered referrers)
    const referralCodes = Array.from(allCodes.keys());
    
    // Calculate referral counts for each code
    const referralCounts = await Promise.all(
      referralCodes.map(async (code) => {
        // Count total referrals for this code
        // Note: This counts applications referred BY this mobilizer, not the mobilizer themselves
        const totalReferrals = await prisma.referrer.count({
          where: { fullName: code }
        });

        // For active/completed referrals, we need to check enrollment status
        // For now, we'll set active as total - completed, and completed will be calculated separately
        // This would ideally be based on enrollment data
        let activeReferrals = totalReferrals;
        let completedReferrals = 0;

        // For simplicity, let's assume active referrals are those with recent enrollment activity
        // You might want to refine this based on your actual enrollment/completion logic
        try {
          // Get enrollments for users referred by this mobilizer
          const enrollments = await prisma.enrollment.findMany({
            where: {
              user: {
                referrer: {
                  fullName: code
                }
              }
            },
            select: {
              status: true
            }
          });

          completedReferrals = enrollments.filter(e => e.status === 'COMPLETED').length;
          activeReferrals = enrollments.filter(e => e.status !== 'COMPLETED' && e.status !== 'CANCELLED').length;
        } catch (error) {
          // If there's an issue with enrollment lookup, keep defaults
          console.warn(`Could not fetch enrollment data for ${code}:`, error);
        }

        const completionRate = totalReferrals > 0 ? Math.round((completedReferrals / totalReferrals) * 100) : 0;

        return {
          code,
          totalReferrals,
          activeReferrals,
          completedReferrals,
          completionRate
        };
      })
    );

    // Merge the counts with the mobilizer data
    const finalData = Array.from(allCodes.values()).map(mobilizerData => {
      const counts = referralCounts.find(c => c.code === mobilizerData.code) || {
        totalReferrals: 0,
        activeReferrals: 0,
        completedReferrals: 0,
        completionRate: 0
      };

      return {
        ...mobilizerData,
        totalReferrals: counts.totalReferrals,
        activeReferrals: counts.activeReferrals,
        completedReferrals: counts.completedReferrals,
        completionRate: counts.completionRate,
      };
    });

    // Sort: registered mobilizers first (by status), then unregistered referrers, then alphabetically
    finalData.sort((a, b) => {
      // If both are registered mobilizers, sort by status
      if (a.isRegisteredMobilizer && b.isRegisteredMobilizer) {
        const statusOrder: Record<string, number> = { 'ACTIVE': 0, 'INACTIVE': 1, 'SUSPENDED': 2 };
        const aOrder = statusOrder[a.status] ?? 3;
        const bOrder = statusOrder[b.status] ?? 3;
        if (aOrder !== bOrder) return aOrder - bOrder;
      }
      
      // If only one is registered, registered one comes first
      if (a.isRegisteredMobilizer && !b.isRegisteredMobilizer) return -1;
      if (!a.isRegisteredMobilizer && b.isRegisteredMobilizer) return 1;
      
      // Then sort alphabetically by code
      return a.code.localeCompare(b.code);
    });

    res.status(200).json({
      message: 'success',
      mobilizers: finalData,
      total: finalData.length,
    });
  } catch (error) {
    console.error('Error fetching mobilizer data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
