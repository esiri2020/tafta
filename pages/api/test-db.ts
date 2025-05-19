import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prismadb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Try a simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    return res.status(200).json({ 
      message: 'Database connection successful',
      result 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ 
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 