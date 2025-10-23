import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prismadb';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const { code, fullName, email, phoneNumber, organization, password } = req.body;

    // Validate required fields
    if (!code || !fullName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate mobilizer code format
    if (!/^[A-Za-z0-9]{3,20}$/.test(code)) {
      return res.status(400).json({ 
        message: 'Invalid mobilizer code format. Code must be 3-20 characters, letters and numbers only.' 
      });
    }

    // Note: MobilizerCode table was removed as part of mobilizer system rework
    // All mobilizer codes are now handled via the existing Referrer table

    // Check if mobilizer code already exists
    const existingMobilizer = await prisma.mobilizer.findUnique({
      where: { code },
    });

    if (existingMobilizer) {
      // If the existing mobilizer has a placeholder email, allow claiming
      if (existingMobilizer.email.includes('@placeholder.com')) {
        // This is an unregistered mobilizer - allow claiming
        console.log(`Allowing claim of unregistered mobilizer code: ${code}`);
      } else {
        // This is a registered mobilizer - block registration
        return res.status(400).json({ message: 'Mobilizer code already registered' });
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and mobilizer
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName: fullName.split(' ')[0],
          lastName: fullName.split(' ').slice(1).join(' ') || '',
          role: 'MOBILIZER',
        },
      });

      let mobilizerRecord;
      
      if (existingMobilizer && existingMobilizer.email.includes('@placeholder.com')) {
        // Update existing unregistered mobilizer
        mobilizerRecord = await tx.mobilizer.update({
          where: { id: existingMobilizer.id },
          data: {
            fullName,
            email,
            phoneNumber,
            organization,
            userId: user.id,
            status: 'ACTIVE', // Activate the mobilizer
          },
        });
      } else {
        // Create new mobilizer
        mobilizerRecord = await tx.mobilizer.create({
          data: {
            code,
            fullName,
            email,
            phoneNumber,
            organization,
            userId: user.id,
            totalReferrals: 0,
            activeReferrals: 0,
            completedReferrals: 0,
          },
        });
      }

      // Create a profile for the mobilizer user
      await tx.profile.create({
        data: {
          userId: user.id,
        },
      });

      return { user, mobilizer: mobilizerRecord };
    });

    res.status(201).json({
      message: 'Mobilizer registered successfully',
      mobilizer: result.mobilizer,
    });
  } catch (error) {
    console.error('Error registering mobilizer:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? (error as any)?.message : undefined
    });
  } finally {
    // Ensure proper cleanup
    await prisma.$disconnect();
  }
}

