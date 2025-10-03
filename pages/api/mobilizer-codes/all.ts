import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // Get ALL referrer names for filtering purposes (these are the mobilizer codes)
    const allReferrerNames = await prisma.referrer.findMany({
      select: {
        fullName: true,
      },
      orderBy: {
        fullName: 'asc',
      },
      distinct: ['fullName'],
    });

    res.status(200).json({
      message: 'success',
      codes: allReferrerNames.map(referrer => referrer.fullName),
      total: allReferrerNames.length,
    });
  } catch (error) {
    console.error('Error fetching all referrer names:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined
    });
  } finally {
    // Ensure proper cleanup
    await prisma.$disconnect();
  }
}
