import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const activeCohorts = await prisma.cohort.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        name: true,
        start_date: true,
        end_date: true,
      },
      orderBy: {
        start_date: 'desc',
      },
    });

    return res.status(200).json(activeCohorts);
  } catch (error) {
    console.error('Error fetching active cohorts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 