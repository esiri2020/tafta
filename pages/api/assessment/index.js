import {getServerSession} from 'next-auth/next';
import {authOptions} from '../auth/[...nextauth]';
import prisma from '../../../lib/prismadb';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({message: 'Unauthorized'});
    }

    // POST method for creating a new assessment
    if (req.method === 'POST') {
      const {userId, ...assessmentData} = req.body;

      // Check if user is allowed to create this assessment
      // Only allow users to create their own assessments, or admins to create for anyone
      if (
        session.userData.role !== 'ADMIN' &&
        session.userData.role !== 'SUPERADMIN' &&
        session.userData.userId !== userId
      ) {
        return res.status(403).json({message: 'Forbidden'});
      }

      // Check if an assessment already exists for this user
      const existingAssessment = await prisma.assessment.findUnique({
        where: {userId},
      });

      if (existingAssessment) {
        // If exists, update it instead
        const updatedAssessment = await prisma.assessment.update({
          where: {userId},
          data: assessmentData,
        });
        return res.status(200).json(updatedAssessment);
      } else {
        // If not exists, create a new one
        const newAssessment = await prisma.assessment.create({
          data: {
            userId,
            ...assessmentData,
          },
        });
        return res.status(201).json(newAssessment);
      }
    }

    // Handle unsupported methods
    return res.status(405).json({message: 'Method not allowed'});
  } catch (error) {
    console.error('Assessment API error:', error);
    return res
      .status(500)
      .json({message: 'Internal server error', error: error.message});
  }
}
