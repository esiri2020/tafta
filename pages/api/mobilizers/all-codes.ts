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
    const { cohortId } = req.query;

    // Get all mobilizer codes from the Mobilizer table (single source of truth)
    const mobilizers = await prisma.mobilizer.findMany({
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
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { code: 'asc' },
    });

    // Extract just the codes for the dropdown
    const codes = mobilizers.map(m => m.code);

    res.status(200).json({
      message: 'success',
      codes: codes,
      mobilizers: mobilizers,
      total: mobilizers.length,
    });
  } catch (error) {
    console.error('Error fetching mobilizer data:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined
    });
  }
}