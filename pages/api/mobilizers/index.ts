import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prismadb';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const where = status ? { status: status as any } : {};
      
      const [mobilizers, total] = await Promise.all([
        prisma.mobilizer.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        }),
        prisma.mobilizer.count({ where }),
      ]);

      res.status(200).json({
        message: 'success',
        mobilizers,
        total,
        page: Number(page),
        limit: Number(limit),
      });
    } catch (error) {
      console.error('Error fetching mobilizers:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { code, fullName, email, phoneNumber, organization, password } = req.body;

      // Validate required fields
      if (!code || !fullName || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

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
          return res.status(400).json({ message: 'Mobilizer code already exists' });
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

        let mobilizer;
        
        if (existingMobilizer && existingMobilizer.email.includes('@placeholder.com')) {
          // Update existing unregistered mobilizer
          mobilizer = await tx.mobilizer.update({
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
          mobilizer = await tx.mobilizer.create({
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

        return { user, mobilizer };
      });

      res.status(201).json({
        message: 'Mobilizer created successfully',
        mobilizer: result.mobilizer,
      });
    } catch (error) {
      console.error('Error creating mobilizer:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}

