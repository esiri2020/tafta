import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prismadb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.query;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Find the user and include their profile information
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true }
    });

    if (!user) {
      return res.redirect('/verify-failed?error=user-not-found');
    }

    // Mark email as verified
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { emailVerified: new Date() },
    });

    // Check if we need to redirect to personal information form or login
    if (!user.profile) {
      // User needs to complete their profile
      return res.redirect(`/register/new?userId=${user.id}&email=${encodeURIComponent(email)}&verified=true`);
    } else {
      // User has already completed their profile, go to success page
      return res.redirect('/verify-success');
    }
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.redirect('/verify-failed?error=server-error');
  }
} 