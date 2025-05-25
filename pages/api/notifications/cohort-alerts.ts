import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '@/lib/prisma';
import { NotificationType, NotificationStatus, User } from '@prisma/client';
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
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    // Create notifications and send emails for each staff member
    const notifications = await Promise.all(
      staffMembers.map(async (staff) => {
        const notification = await prisma.notification.create({
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
        });
        // Send email
        await sendStaffAlertEmail(
          staff.email,
          `${staff.firstName || ''} ${staff.lastName || ''}`.trim() || 'Staff',
          `Cohort Alert: ${cohort.name}`,
          message,
          notification.id
        );
        return notification;
      })
    );

    return res.status(201).json(notifications);
  } catch (error) {
    console.error('Error creating cohort alert:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 