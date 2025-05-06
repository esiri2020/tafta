import {getToken} from 'next-auth/jwt';
import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from '../../../lib/prismadb';
import {NotificationStatus, NotificationType} from '@prisma/client';

// Debug the prisma client to see what's happening
console.log('Prisma client in notifications API:', {
  isPrismaAvailable: !!prisma,
  hasNotificationModel: !!prisma?.notification,
  availableModels: Object.keys(prisma || {}),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await getToken({req});
  if (!token) {
    return res.status(401).send({
      error: 'You must be signed in to view the protected content on this page.',
    });
  }

  // Check if user is staff (super admin, admin, or support)
  const userRole = token?.userData?.role as string;
  if (!userRole || !['SUPERADMIN', 'ADMIN', 'SUPPORT'].includes(userRole)) {
    return res.status(403).send({
      error: 'Unauthorized. Only staff members can access notifications.',
    });
  }

  if (req.method === 'GET') {
    try {
      const {page = '1', limit = '10', isRead, search, status, type, tag} = req.query;
      const pageNumber = Math.max(1, parseInt(page as string, 10));
      const limitNumber = Math.max(1, parseInt(limit as string, 10));
      const skip = (pageNumber - 1) * limitNumber;

      // Build where clause based on filters
      const whereClause: any = {};

      // For non-super admins, show all notifications but filter by status
      if (userRole !== 'SUPERADMIN') {
        whereClause.status = {
          not: 'ARCHIVED' // Only show non-archived notifications
        };
      }

      if (isRead !== undefined) {
        whereClause.isRead = isRead === 'true';
      }

      if (status) {
        whereClause.status = status;
      }

      if (type) {
        whereClause.type = type;
      }

      if (tag) {
        whereClause.tags = {
          has: tag
        };
      }

      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { message: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get total count and notifications
      const [total, notifications] = await Promise.all([
        prisma.notification.count({where: whereClause}),
        prisma.notification.findMany({
          where: whereClause,
          include: {
            recipient: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            },
            sender: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: limitNumber,
          skip
        })
      ]);

      return res.status(200).json({
        notifications,
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / limitNumber)
      });
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      return res.status(400).send(err.message);
    }
  }

  // Send notification
  if (req.method === 'POST') {
    // Only admins and superadmins can send notifications
    if (
      token?.userData?.role !== 'SUPERADMIN' &&
      token?.userData?.role !== 'ADMIN'
    ) {
      return res.status(403).send({
        error: 'Unauthorized. Only admins can send notifications.',
      });
    }

    // Safely parse the body
    let body;
    try {
      body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
      console.log('Received notification request body:', JSON.stringify(body));
    } catch (error) {
      console.error('Error parsing notification request body:', error);
      return res.status(400).send({
        error: 'Invalid request body. Could not parse JSON.',
      });
    }

    const {title, message, recipientIds, type, cohortId, relatedEntityId} =
      body;

    // Validate the required fields
    if (!title || !message) {
      console.error('Missing title or message in notification request');
      return res.status(400).send({
        error: 'Invalid request. Title and message are required.',
      });
    }

    if (
      !recipientIds ||
      !Array.isArray(recipientIds) ||
      recipientIds.length === 0
    ) {
      console.error(
        'Invalid or missing recipientIds in notification request:',
        recipientIds,
      );
      return res.status(400).send({
        error: 'Invalid request. recipientIds must be a non-empty array.',
      });
    }

    try {
      console.log(
        `Creating notifications for ${recipientIds.length} recipients...`,
      );

      // Verify that prisma.notification is available
      if (!prisma.notification) {
        console.error(
          'prisma.notification is undefined. Available models:',
          Object.keys(prisma),
        );
        return res.status(500).send({
          error: 'Database model not available',
        });
      }

      const notificationData = recipientIds.map(recipientId => ({
        title,
        message,
        senderId: token.sub as string,
        recipientId,
        type: type || 'GENERAL',
        cohortId: cohortId || null,
        relatedEntityId: relatedEntityId || null,
      }));

      // Log the data we're trying to create
      console.log('Notification data:', JSON.stringify(notificationData));

      // Use individual create operations instead of createMany if needed
      let createdCount = 0;
      for (const data of notificationData) {
        try {
          await prisma.notification.create({data});
          createdCount++;
        } catch (createError) {
          console.error('Error creating individual notification:', createError);
        }
      }

      console.log(`Successfully created ${createdCount} notifications`);
      return res.status(201).json({success: true, count: createdCount});
    } catch (err: any) {
      console.error('Error creating notifications:', err.message);
      console.error('Full error:', err);
      return res.status(400).send(err.message);
    }
  }

  // Mark notification(s) as read
  if (req.method === 'PATCH') {
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    const {notificationIds, markAllAsRead} = body;

    try {
      if (markAllAsRead) {
        // Mark all notifications as read
        const result = await prisma.notification.updateMany({
          where: {
            recipientId: token.sub as string,
            isRead: false,
          },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });

        return res.status(200).json({success: true, count: result.count});
      } else if (
        notificationIds &&
        Array.isArray(notificationIds) &&
        notificationIds.length > 0
      ) {
        // Mark specific notifications as read
        const result = await prisma.notification.updateMany({
          where: {
            id: {in: notificationIds},
            recipientId: token.sub as string,
          },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });

        return res.status(200).json({success: true, count: result.count});
      } else {
        return res.status(400).send({
          error:
            'Invalid request. Either markAllAsRead or notificationIds is required.',
        });
      }
    } catch (err: any) {
      console.error(err.message);
      return res.status(400).send(err.message);
    }
  }

  // Delete notification(s)
  if (req.method === 'DELETE') {
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    const {notificationIds} = body;

    if (
      !notificationIds ||
      !Array.isArray(notificationIds) ||
      notificationIds.length === 0
    ) {
      return res.status(400).send({
        error: 'Invalid request. notificationIds is required.',
      });
    }

    try {
      // Only allow users to delete their own notifications
      const result = await prisma.notification.deleteMany({
        where: {
          id: {in: notificationIds},
          recipientId: token.sub as string,
        },
      });

      return res.status(200).json({success: true, count: result.count});
    } catch (err: any) {
      console.error(err.message);
      return res.status(400).send(err.message);
    }
  }

  // Method not allowed
  return res.status(405).json({error: 'Method not allowed'});
}
