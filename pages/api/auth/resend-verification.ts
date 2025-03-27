import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prismadb';
import { createTransport } from 'nodemailer';

// HTML Email template
const html = ({ url, host, email }: { url: string; host: string; email: string }) => {
  return `
    <body>
      <h2>Email Verification</h2>
      <p>Hello,</p>
      <p>Thank you for registering with ${host}. Please verify your email address by clicking the button below:</p>
      <div style="margin: 20px 0;">
        <a href="${url}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
          Verify Email
        </a>
      </div>
      <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
      <p>${url}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this email, please ignore it.</p>
      <p>Best regards,<br>Terra Academy Team</p>
    </body>
  `;
};

// Plain text email
const text = ({ url, host }: { url: string; host: string }) => {
  return `
    Email Verification
    
    Hello,
    
    Thank you for registering with ${host}. Please verify your email address by visiting the link below:
    
    ${url}
    
    This link will expire in 1 hour.
    
    If you did not request this email, please ignore it.
    
    Best regards,
    Terra Academy Team
  `;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate verification URL
    const baseUrl = process.env.NEXTAUTH_URL || `https://${req.headers.host}`;
    const verificationUrl = `${baseUrl}/api/auth/verify-email?email=${encodeURIComponent(email)}`;

    // Configure Nodemailer with Mailtrap
    const transport = createTransport({
      host: "sandbox.smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
      }
    });

    // Send email
    await transport.sendMail({
      to: email,
      from: process.env.EMAIL_FROM || 'Terra Academy <noreply@terraacademy.com>',
      subject: 'Verify your email address',
      text: text({ url: verificationUrl, host: req.headers.host as string }),
      html: html({ url: verificationUrl, host: req.headers.host as string, email }),
    });

    return res.status(200).json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 