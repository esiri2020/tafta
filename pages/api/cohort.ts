import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prismadb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { page = 0, limit = 100, filter, query } = req.query;
    
    console.log('🔍 Cohorts API Debug:', {
      page,
      limit,
      filter,
      query,
      timestamp: new Date().toISOString()
    });

    // Build where clause
    const where: any = {};
    
    if (filter && filter !== 'undefined') {
      where.status = filter;
    }
    
    if (query) {
      where.OR = [
        { name: { contains: query as string, mode: 'insensitive' } },
        { description: { contains: query as string, mode: 'insensitive' } }
      ];
    }

    // Get cohorts with pagination
    const cohorts = await prisma.cohort.findMany({
      where,
      orderBy: { start_date: 'desc' },
      skip: Number(page) * Number(limit),
      take: Number(limit),
      select: {
        id: true,
        name: true,
        start_date: true,
        end_date: true,
        active: true,
      }
    });

    // Get total count
    const total = await prisma.cohort.count({ where });

    console.log('✅ Cohorts fetched:', {
      count: cohorts.length,
      total,
      page: Number(page),
      limit: Number(limit)
    });

    res.status(200).json({
      message: 'success',
      cohorts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching cohorts:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined
    });
  }
}
