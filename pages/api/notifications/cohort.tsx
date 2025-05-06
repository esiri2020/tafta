import {getToken} from 'next-auth/jwt';
import type {NextApiRequest, NextApiResponse} from 'next';
import prisma from '../../../lib/prismadb';
import {NotificationStatus} from '@prisma/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await getToken({req});
  if (!token) {
    return res.status(401).send({
      error:
        'You must be signed in to view the protected content on this page.',
    });
  }

  // Only admins and superadmins can send notifications
  if (
    token?.userData?.role !== 'SUPERADMIN' &&
    token?.userData?.role !== 'ADMIN'
  ) {
    return res.status(403).send({
      error: 'Unauthorized. Only admins can send notifications.',
    });
  }

  // Send notification to all applicants in a cohort
  if (req.method === 'POST') {
    const body = typeof req.body === 'object' ? req.body : JSON.parse(req.body);
    const {title, message, cohortId, type, relatedEntityId} = body;

    if (!title || !message || !cohortId) {
      return res.status(400).send({
        error:
          'Invalid request. Missing required fields (title, message, cohortId).',
      });
    }

    try {
      // Get all applicants in the cohort
      const applicants = await prisma.user.findMany({
        where: {
          role: 'APPLICANT',
          userCohort: {
            some: {
              cohortId: cohortId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (!applicants || applicants.length === 0) {
        return res.status(400).send({
          error: 'No applicants found in the specified cohort.',
        });
      }

      // Create notifications for each applicant
      const notificationData = applicants.map(applicant => ({
        title,
        message,
        senderId: token.sub as string,
        recipientId: applicant.id,
        type: type || 'GENERAL',
        cohortId: cohortId,
        relatedEntityId: relatedEntityId || null,
        status: NotificationStatus.DELIVERED, // Set status to DELIVERED when creating
      }));

      // Create notifications
      const notifications = await prisma.notification.createMany({
        data: notificationData,
      });

      return res.status(201).json({
        success: true,
        count: notifications.count,
        message: `Successfully sent notifications to ${notifications.count} applicants in the cohort.`,
      });
    } catch (err: any) {
      console.error('Error creating cohort notifications:', err);
      return res.status(400).send(err.message);
    }
  }

  // Method not allowed
  return res.status(405).json({error: 'Method not allowed'});
}
