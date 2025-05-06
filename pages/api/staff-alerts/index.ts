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
  if (req.method === 'GET') {
    try {
      const session = await getServerSession(req, res, authOptions) as CustomSession;
      if (!session?.userData) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { userId, role } = session.userData;
      if (!['SUPERADMIN', 'ADMIN', 'SUPPORT'].includes(role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const { page = '0', limit = '10' } = req.query;
      const skip = parseInt(page as string) * parseInt(limit as string);
      const take = parseInt(limit as string);

      // Fetch alerts where the user is a recipient or sender
      const [alerts, total] = await Promise.all([
        prisma.staffAlert.findMany({
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          where: {
            OR: [
              { recipients: { some: { id: userId } } },
              { senderId: userId },
            ],
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                image: true,
              },
            },
            recipients: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            staffAlertReads: {
              where: { userId },
              select: { id: true },
            },
          },
        }),
        prisma.staffAlert.count({
          where: {
            OR: [
              { recipients: { some: { id: userId } } },
              { senderId: userId },
            ],
          },
        }),
      ]);

      // Add read flag
      const alertsWithRead = alerts.map(alert => ({
        ...alert,
        isRead: alert.staffAlertReads.length > 0,
      }));

      return res.status(200).json({
        alerts: alertsWithRead,
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
    } catch (error) {
      console.error('Error fetching staff alerts:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions) as CustomSession;
      if (!session?.userData) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const { role, userId } = session.userData;
      if (!['SUPERADMIN', 'ADMIN', 'SUPPORT'].includes(role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const { title, message, type, recipientIds } = req.body;
      if (!title || !message || !type) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      // If recipientIds is not provided or is empty, send to all staff
      let recipients = [];
      if (!recipientIds || recipientIds.length === 0) {
        recipients = await prisma.user.findMany({
          where: { role: { in: ['SUPERADMIN', 'ADMIN', 'SUPPORT'] } },
          select: { id: true },
        });
      } else {
        recipients = await prisma.user.findMany({
          where: {
            id: { in: recipientIds },
            role: { in: ['SUPERADMIN', 'ADMIN', 'SUPPORT'] },
          },
          select: { id: true },
        });
      }
      if (recipients.length === 0) {
        return res.status(400).json({ message: 'No valid staff recipients found' });
      }
      const alert = await prisma.staffAlert.create({
        data: {
          title,
          message,
          type,
          senderId: userId,
          recipients: {
            connect: recipients.map(r => ({ id: r.id })),
          },
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              image: true,
            },
          },
          recipients: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });
      return res.status(201).json(alert);
    } catch (error) {
      console.error('Error creating staff alert:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 