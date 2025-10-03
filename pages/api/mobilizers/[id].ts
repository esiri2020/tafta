import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  console.log('🔍 Mobilizer API Debug:', {
    method: req.method,
    id: id,
    timestamp: new Date().toISOString()
  });

  if (req.method === 'DELETE') {
    try {
      // First, check if the mobilizer exists
      const mobilizer = await prisma.mobilizer.findUnique({
        where: { id: id as string },
        include: {
          user: true,
        },
      });

      if (!mobilizer) {
        return res.status(404).json({ message: 'Mobilizer not found' });
      }

      // Delete the mobilizer record
      // Note: Referrer records are preserved for historical tracking
      await prisma.mobilizer.delete({
        where: { id: id as string },
      });

      res.status(200).json({ message: 'Mobilizer deleted successfully' });
    } catch (error) {
      console.error('Error deleting mobilizer:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined
      });
    }
  } else if (req.method === 'GET') {
    try {
      console.log('🔍 Fetching mobilizer with ID:', id);
      
      const mobilizer = await prisma.mobilizer.findUnique({
        where: { id: id as string },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      console.log('🔍 Mobilizer found:', mobilizer ? 'Yes' : 'No');

      if (!mobilizer) {
        console.log('❌ Mobilizer not found for ID:', id);
        return res.status(404).json({ message: 'Mobilizer not found' });
      }

      console.log('✅ Returning mobilizer data');
      res.status(200).json({ mobilizer });
    } catch (error) {
      console.error('Error fetching mobilizer:', error);
      res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
