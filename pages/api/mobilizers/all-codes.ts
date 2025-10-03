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
        code: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        status: true,
        createdAt: true,
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
        code: mobilizer.code,
        phoneNumber: mobilizer.phoneNumber,
        email: mobilizer.email,
        isRegisteredMobilizer: true,
        mobilizerStatus: mobilizer.status,
        mobilizerFullName: mobilizer.fullName,
        createdAt: mobilizer.createdAt,
      });
    });

    // Add referrers who aren't registered mobilizers
    referrers.forEach(referrer => {
      if (!allCodes.has(referrer.fullName)) {
        allCodes.set(referrer.fullName, {
          code: referrer.fullName,
          phoneNumber: null,
          email: null,
          isRegisteredMobilizer: false,
          mobilizerStatus: null,
          mobilizerFullName: null,
          createdAt: null,
        });
      }
    });

    // Convert to array and sort
    const finalData = Array.from(allCodes.values());

    // Sort: registered mobilizers first (by status), then unregistered referrers, then alphabetically
    finalData.sort((a, b) => {
      // If both are registered mobilizers, sort by status
      if (a.isRegisteredMobilizer && b.isRegisteredMobilizer) {
        const statusOrder: Record<string, number> = { 'ACTIVE': 0, 'INACTIVE': 1, 'SUSPENDED': 2 };
        const aOrder = statusOrder[a.mobilizerStatus] ?? 3;
        const bOrder = statusOrder[b.mobilizerStatus] ?? 3;
        if (aOrder !== bOrder) return aOrder - bOrder;
      }
      
      // If only one is registered, registered one comes first
      if (a.isRegisteredMobilizer && !b.isRegisteredMobilizer) return -1;
      if (!a.isRegisteredMobilizer && b.isRegisteredMobilizer) return 1;
      
      // Then sort alphabetically by code
      return a.code.localeCompare(b.code);
    });

    // Extract just the codes for the dropdown
    const codes = finalData.map(item => item.code);

    res.status(200).json({
      message: 'success',
      codes: codes,
      referrers: finalData,
      total: finalData.length,
    });
  } catch (error) {
    console.error('Error fetching referrer data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}