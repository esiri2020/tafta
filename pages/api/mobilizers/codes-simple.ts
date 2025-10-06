import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prismadb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers for production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Get all unique referrer names from the Referrer table (these are our "mobilizer codes")
    const allReferrerNames = await prisma.referrer.findMany({
      select: { fullName: true },
      distinct: ['fullName'],
      orderBy: { fullName: 'asc' },
    });

    // Get registered mobilizers from database for status information
    const registeredMobilizers = await prisma.mobilizer.findMany({
      select: {
        code: true,
        fullName: true,
        status: true,
      }
    });

    // Create a map of registered mobilizers by code
    const registeredMobilizerMap = new Map();
    registeredMobilizers.forEach(mobilizer => {
      registeredMobilizerMap.set(mobilizer.code, mobilizer);
    });

    // Create a simple list of all codes with their status
    const allCodes = allReferrerNames.map(referrer => {
      const code = referrer.fullName;
      const registeredMobilizer = registeredMobilizerMap.get(code);
      
      return {
        code,
        status: registeredMobilizer ? registeredMobilizer.status : 'PENDING',
        fullName: registeredMobilizer?.fullName || code,
      };
    });

    // Sort by status (ACTIVE first) then by code name
    allCodes.sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (b.status === 'ACTIVE' && a.status !== 'ACTIVE') return 1;
      return a.code.localeCompare(b.code);
    });

    // Extract just the codes for the dropdown
    const codes = allCodes.map(m => m.code);

    res.status(200).json({
      message: 'success',
      codes: codes,
      mobilizers: allCodes,
      total: allCodes.length,
    });
  } catch (error) {
    console.error('Error fetching mobilizer codes:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined
    });
  }
}
