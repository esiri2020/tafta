import { getToken } from 'next-auth/jwt';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prismadb';
import { NotificationStatus } from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).send({
      error: 'You must be signed in to view the protected content on this page.',
    });
  }

  // Check if user is staff (super admin, admin, or support)
  const userRole = token?.userData?.role as string;
  if (!userRole || !['SUPERADMIN', 'ADMIN', 'SUPPORT', 'GUEST'].includes(userRole)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).send({
      error: 'Invalid notification ID.',
    });
  }

  if (req.method === 'PATCH') {
    try {
      // For non-super admins, only allow archiving notifications they created or received
      const whereClause: any = { id };
      if (userRole !== 'SUPERADMIN') {
        whereClause.OR = [
          { senderId: token?.userData?.userId },
          { recipientId: token?.userData?.userId }
        ];
      }

      const notification = await prisma.notification.update({
        where: whereClause,
        data: {
          status: NotificationStatus.ARCHIVED,
        },
      });

      return res.status(200).json(notification);
    } catch (err: any) {
      console.error('Error archiving notification:', err);
      return res.status(400).send(err.message);
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
} 