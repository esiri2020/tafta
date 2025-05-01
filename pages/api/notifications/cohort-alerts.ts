import { getToken } from 'next-auth/jwt';
import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prismadb';
import { NotificationStatus, NotificationType } from '@prisma/client';

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
  const userId = token?.userData?.userId;
  if (!userRole || !userId || !['SUPERADMIN', 'ADMIN', 'SUPPORT'].includes(userRole)) {
    return res.status(403).send({
      error: 'Unauthorized. Only staff members can manage cohort alerts.',
    });
  }

  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '10', cohortId } = req.query;
      const pageNumber = parseInt(page as string, 10);
      const limitNumber = parseInt(limit as string, 10);
      const skip = (pageNumber - 1) * limitNumber;

      // Build where clause based on filters
      const whereClause: any = {
        type: NotificationType.REMINDER,
        tags: {
          has: 'COHORT_COMPLETION'
        }
      };

      if (cohortId) {
        whereClause.cohortId = cohortId;
      }

      // Get total count and alerts
      const [total, alerts] = await Promise.all([
        prisma.notification.count({ where: whereClause }),
        prisma.notification.findMany({
          where: whereClause,
          include: {
            cohort: {
              select: {
                name: true,
              }
            },
            sender: {
              select: {
                firstName: true,
                lastName: true,
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
        alerts,
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / limitNumber)
      });
    } catch (err: any) {
      console.error('Error fetching cohort alerts:', err);
      return res.status(400).send(err.message);
    }
  }

  if (req.method === 'POST') {
    try {
      const { cohortId, message, type } = req.body;

      // Validate required fields
      if (!cohortId || !message || !type) {
        return res.status(400).send({
          error: 'Missing required fields: cohortId, message, and type are required.',
        });
      }

      // Get cohort details
      const cohort = await prisma.cohort.findUnique({
        where: { id: cohortId },
        include: {
          userCohort: {
            include: {
              enrollments: {
                select: {
                  percentage_completed: true
                }
              }
            }
          }
        }
      });

      if (!cohort) {
        return res.status(404).send({
          error: 'Cohort not found.',
        });
      }

      // Calculate total completion
      const totalCompletion = cohort.userCohort.reduce((sum, uc) => {
        return sum + uc.enrollments.reduce((total, enrollment) => {
          return total + (enrollment.percentage_completed || 0);
        }, 0);
      }, 0);

      // Create alert notification
      const alert = await prisma.notification.create({
        data: {
          title: `Cohort Completion Alert: ${cohort.name}`,
          message,
          type: NotificationType.REMINDER,
          status: NotificationStatus.SENT,
          tags: ['COHORT_COMPLETION', type],
          cohortId,
          senderId: userId,
          recipientId: userId, // Send to self for now, can be modified to send to specific staff members
        },
        include: {
          cohort: {
            select: {
              name: true,
            }
          },
          sender: {
            select: {
              firstName: true,
              lastName: true,
              role: true
            }
          }
        }
      });

      return res.status(201).json(alert);
    } catch (err: any) {
      console.error('Error creating cohort alert:', err);
      return res.status(400).send(err.message);
    }
  }

  // Method not allowed
  return res.status(405).json({ error: 'Method not allowed' });
} 