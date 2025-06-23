import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

interface CustomSession extends Session {
  userData?: {
    userId: string;
    role: string;
  };
}

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Function to read email template
function readEmailTemplate(templateName: string): string {
  const templatePath = path.join(process.cwd(), 'utils', templateName);
  return fs.readFileSync(templatePath, 'utf8');
}

// Function to send staff alert email
async function sendStaffAlertEmail(
  recipientEmail: string,
  recipientName: string,
  alertTitle: string,
  alertMessage: string,
  alertId: string
) {
  const template = readEmailTemplate('staff-alert.html');
  const subject = 'Staff Alert Notification';
  const emailContent = template
    .replace('[Company Logo]', process.env.COMPANY_LOGO_URL || '')
    .replace('[Company Name]', process.env.COMPANY_NAME || 'TAFTA')
    .replace('[Staff Name]', recipientName)
    .replace('[Alert Type]', alertTitle)
    .replace('[Priority Level]', 'High')
    .replace('[Date and Time]', new Date().toLocaleString())
    .replace('[Alert Description]', alertMessage)
    .replace('[Required Action]', 'Please review and take action')
    .replace('[View Details Button]', `${process.env.NEXT_PUBLIC_APP_URL}/admin-dashboard/notifications/alerts?id=${alertId}`);
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: recipientEmail,
    subject,
    html: emailContent,
  });
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
      if (!['SUPERADMIN', 'ADMIN', 'SUPPORT', 'GUEST'].includes(role)) {
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
              {
                StaffAlertRecipients: {
                  some: {
                    userId: userId
                  }
                }
              },
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
            StaffAlertRecipients: {
              include: {
                User: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
              },
            },
          },
        }),
        prisma.staffAlert.count({
          where: {
            OR: [
              {
                StaffAlertRecipients: {
                  some: {
                    userId: userId
                  }
                }
              },
              { senderId: userId },
            ],
          },
        }),
      ]);

      // Transform the alerts to match the frontend's expected structure
      const alertsWithRead = alerts.map(alert => ({
        id: alert.id,
        title: alert.title,
        message: alert.message,
        type: alert.type,
        sender: alert.sender,
        createdAt: alert.createdAt.toISOString(),
        updatedAt: alert.updatedAt.toISOString(),
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
      if (!['SUPERADMIN', 'ADMIN', 'SUPPORT', 'GUEST'].includes(role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
      const { title, message, type, recipientIds } = req.body;
      if (!title || !message || !type) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      // If recipientIds is not provided or is empty, send to all staff
      let recipientUsers = [];
      if (!recipientIds || recipientIds.length === 0) {
        recipientUsers = await prisma.user.findMany({
          where: { role: { in: ['SUPERADMIN', 'ADMIN', 'SUPPORT'] } },
          select: { id: true },
        });
      } else {
        recipientUsers = await prisma.user.findMany({
          where: {
            id: { in: recipientIds },
            role: { in: ['SUPERADMIN', 'ADMIN', 'SUPPORT'] },
          },
          select: { id: true },
        });
      }
      if (recipientUsers.length === 0) {
        return res.status(400).json({ message: 'No valid staff recipients found' });
      }
      const alert = await prisma.staffAlert.create({
        data: {
          title,
          message,
          type,
          senderId: userId,
          StaffAlertRecipients: {
            create: recipientUsers.map(r => ({
              id: `${Date.now()}-${r.id}`,
              userId: r.id,
            })),
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
          StaffAlertRecipients: {
            include: {
              User: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Transform the created alert to match the frontend's expected structure
      const transformedAlert = {
        id: alert.id,
        title: alert.title,
        message: alert.message,
        type: alert.type,
        sender: alert.sender,
        createdAt: alert.createdAt.toISOString(),
        updatedAt: alert.updatedAt.toISOString(),
      };

      // After creating the alert and connecting recipients
      for (const recipient of (alert as any).StaffAlertRecipients) {
        if (recipient.User) {
          await sendStaffAlertEmail(
            recipient.User.email,
            `${recipient.User.firstName || ''} ${recipient.User.lastName || ''}`.trim() || 'Staff',
            alert.title,
            alert.message,
            alert.id
          );
        }
      }

      return res.status(201).json(transformedAlert);
    } catch (error) {
      console.error('Error creating staff alert:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 