import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { NotificationType, NotificationStatus, User } from '@prisma/client';
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

    const { role, userId } = session.userData;
    if (!['SUPERADMIN', 'ADMIN', 'SUPPORT'].includes(role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { cohortId, message, type } = req.body;

    if (!cohortId || !message || !type) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate cohort exists
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
    });

    if (!cohort) {
      return res.status(404).json({ message: 'Cohort not found' });
    }

    // Get all staff members to send the alert to
    const staffMembers = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPERADMIN', 'ADMIN', 'SUPPORT'],
        },
      },
      select: {
        id: true,
      },
    });

    // Create notifications for each staff member
    const notifications = await Promise.all(
      staffMembers.map((staff: Pick<User, 'id'>) =>
        prisma.notification.create({
          data: {
            title: `Cohort Alert: ${cohort.name}`,
            message,
            type: type as NotificationType,
            status: NotificationStatus.DRAFT,
            tags: ['COHORT_COMPLETION'],
            senderId: userId,
            recipientId: staff.id,
            cohortId: cohort.id,
          },
        })
      )
    );

    return res.status(201).json(notifications);
  } catch (error) {
    console.error('Error creating cohort alert:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 