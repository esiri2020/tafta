import {getToken} from 'next-auth/jwt';
import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from '../../../lib/prismadb';
import {NotificationStatus, NotificationType} from '@prisma/client';
import { notificationEmailQueue } from '../../../lib/notification-queue';

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
  if (!userRole || !['SUPERADMIN', 'ADMIN', 'SUPPORT', 'APPLICANT'].includes(userRole)) {
    return res.status(403).send({
      error: 'Unauthorized. Only staff members can access notifications.',
    });
  }

  if (req.method === 'GET') {
    try {
      const {page = '1', limit = '10', isRead, search, status, type, tag, id} = req.query;
      
      // If ID is provided, fetch a specific notification and all its recipients (same broadcast)
      if (id && typeof id === 'string') {
        // Find the notification with this ID
        const notification = await prisma.notification.findUnique({
          where: { id },
          include: {
            recipient: {
              select: {
                id: true,
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
          }
        });

        if (!notification) {
          return res.status(404).json({ error: 'Notification not found' });
        }

        // Find all notifications with the same title, message, and sender
        // Group by title + message + sender to find all recipients of the same broadcast
        // Use a 24-hour window to handle notifications sent in batches or over time
        const broadcastStartTime = new Date(notification.createdAt);
        broadcastStartTime.setHours(broadcastStartTime.getHours() - 12);
        const broadcastEndTime = new Date(notification.createdAt);
        broadcastEndTime.setHours(broadcastEndTime.getHours() + 12);

        const allBroadcastNotifications = await prisma.notification.findMany({
          where: {
            title: notification.title,
            message: notification.message,
            senderId: notification.senderId,
            createdAt: {
              gte: broadcastStartTime,
              lte: broadcastEndTime
            }
          },
          include: {
            recipient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        // Group recipients with their read status
        const recipients = allBroadcastNotifications.map(n => ({
          id: n.recipient.id,
          firstName: n.recipient.firstName || '',
          lastName: n.recipient.lastName || '',
          status: n.isRead ? 'READ' : (n.status === 'DELIVERED' ? 'DELIVERED' : 'SENT')
        }));

        console.log(`📧 Found ${allBroadcastNotifications.length} notifications for broadcast "${notification.title}"`);
        console.log(`👥 Grouped into ${recipients.length} recipients`);

        // Return as a single broadcast object
        return res.status(200).json({
          notifications: [{
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            status: notification.status,
            sender: notification.sender,
            createdAt: notification.createdAt,
            recipientCount: recipients.length,
            recipients: recipients
          }],
          total: 1,
          page: 1,
          totalPages: 1
        });
      }

      const pageNumber = Math.max(1, parseInt(page as string, 10));
      const limitNumber = Math.max(1, parseInt(limit as string, 10));
      const skip = (pageNumber - 1) * limitNumber;

      // Build where clause based on filters
      const whereClause: any = {};

      // For applicants, only show their own notifications
      if (userRole === 'APPLICANT') {
        whereClause.recipientId = token.sub;
      } else if (userRole !== 'SUPERADMIN') {
        // For non-super admins, show all notifications but filter by status
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

      // Map notifications to include recipientCount (each notification = 1 recipient)
      const notificationsWithCount = notifications.map(n => ({
        ...n,
        recipientCount: 1, // Each notification record represents 1 recipient
      }));

      return res.status(200).json({
        notifications: notificationsWithCount,
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
        status: NotificationStatus.DELIVERED,
      }));

      // Log the data we're trying to create
      console.log('Notification data:', JSON.stringify(notificationData));

      // Get all recipients information in batch
      const recipients = await prisma.user.findMany({
        where: { 
          id: { in: recipientIds },
          role: 'APPLICANT'
        },
        select: { 
          id: true,
          email: true,
          firstName: true,
          lastName: true
        },
      });

      if (recipients.length === 0) {
        return res.status(400).send({
          error: 'No valid recipients found',
        });
      }

      console.log(`Found ${recipients.length} valid recipients out of ${recipientIds.length} requested`);

      // Create notifications for all recipients
      const notificationsToCreate = recipients.map(recipient => ({
        title,
        message,
        senderId: token.sub as string,
        recipientId: recipient.id,
        type: type || 'GENERAL',
        cohortId: cohortId || null,
        relatedEntityId: relatedEntityId || null,
        status: NotificationStatus.DELIVERED,
      }));

      // Use createMany for better performance
      const createResult = await prisma.notification.createMany({
        data: notificationsToCreate,
        skipDuplicates: true,
      });

      const createdCount = createResult.count;
      console.log(`Successfully created ${createdCount} notifications in database`);

      // Get the created notifications to get their IDs for email links
      const createdNotifications = await prisma.notification.findMany({
        where: {
          title,
          message,
          senderId: token.sub as string,
          recipientId: { in: recipients.map(r => r.id) },
          createdAt: {
            gte: new Date(Date.now() - 60000), // Created in the last minute
          }
        },
        select: {
          id: true,
          recipientId: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: recipients.length,
      });

      // Create a map of recipientId to notificationId
      const notificationMap = new Map(
        createdNotifications.map(n => [n.recipientId, n.id])
      );

      // Queue email jobs for all recipients (non-blocking)
      const emailJobs = recipients.map((recipient) => {
        const notificationId = notificationMap.get(recipient.id);
        const recipientName = `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || 'User';
        
        return notificationEmailQueue.add(
          `email-${recipient.id}-${Date.now()}`,
          {
            notificationId: notificationId || recipient.id,
            recipientId: recipient.id,
            emailData: {
              recipientEmail: recipient.email,
              recipientName,
              notificationType: type || 'GENERAL',
              notificationData: {
                title,
                message,
                relatedEntityId,
                actionUrl: notificationId 
                  ? `${process.env.NEXT_PUBLIC_APP_URL}/notifications/${notificationId}`
                  : '#',
              },
            },
          },
          {
            priority: 1, // Normal priority
            removeOnComplete: true,
            removeOnFail: false,
          }
        );
      });

      // Wait for all jobs to be queued (not sent, just queued)
      await Promise.all(emailJobs);
      
      console.log(`✅ Queued ${emailJobs.length} email jobs for background processing`);

      // Return immediately - emails will be sent by the worker
      return res.status(201).json({
        success: true, 
        count: createdCount,
        queued: emailJobs.length,
        message: `Notifications created and ${emailJobs.length} emails queued for sending`
      });
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
