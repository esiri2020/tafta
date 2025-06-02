import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';

interface CustomSession extends Session {
  userData?: {
    userId: string;
    role: string;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  try {
    const session = await getServerSession(req, res, authOptions) as CustomSession;
    if (!session?.userData) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const { userId, role } = session.userData;
    if (!['SUPERADMIN', 'ADMIN', 'SUPPORT'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { alertIds } = req.body;
    if (!Array.isArray(alertIds) || alertIds.length === 0) {
      return res.status(400).json({ message: 'No alert IDs provided' });
    }
    // Update StaffAlertRecipients records for each alertId
    await prisma.staffAlertRecipients.updateMany({
      where: {
        AND: [
          { staffAlertId: { in: alertIds } },
          { userId }
        ]
      },
      data: {
        createdAt: new Date() // This will update the timestamp to now
      }
    });
    return res.status(200).json({ message: 'Alerts marked as read' });
  } catch (error) {
    console.error('Error marking staff alerts as read:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 