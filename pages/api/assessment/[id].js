import {getServerSession} from 'next-auth/next';
import {authOptions} from '../auth/[...nextauth]';
import prisma from '../../../lib/prismadb';

export default async function handler(req, res) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const {id} = req.query;

    if (!session) {
      return res.status(401).json({message: 'Unauthorized'});
    }

    // GET method for retrieving an assessment
    if (req.method === 'GET') {
      // If id is a user ID (e.g., when accessing through /assessment/userId)
      let assessment;

      // Check if the id appears to be a user ID
      if (id.length > 20) {
        // Assume it's a user ID - let's check by userId
        assessment = await prisma.assessment.findUnique({
          where: {userId: id},
        });
      } else {
        // Assume it's an assessment ID
        assessment = await prisma.assessment.findUnique({
          where: {id},
        });
      }

      if (!assessment) {
        return res.status(404).json({message: 'Assessment not found'});
      }

      // Check if user is allowed to access this assessment
      if (
        session.userData.role !== 'ADMIN' &&
        session.userData.role !== 'SUPERADMIN' &&
        session.userData.userId !== assessment.userId
      ) {
        return res.status(403).json({message: 'Forbidden'});
      }

      return res.status(200).json(assessment);
    }

    // PATCH method for updating an assessment
    if (req.method === 'PATCH') {
      const {...assessmentData} = req.body;

      // Get the assessment to check ownership
      const assessment = await prisma.assessment.findUnique({
        where: {id},
      });

      if (!assessment) {
        return res.status(404).json({message: 'Assessment not found'});
      }

      // Check if user is allowed to update this assessment
      if (
        session.userData.role !== 'ADMIN' &&
        session.userData.role !== 'SUPERADMIN' &&
        session.userData.userId !== assessment.userId
      ) {
        return res.status(403).json({message: 'Forbidden'});
      }

      // Update the assessment
      const updatedAssessment = await prisma.assessment.update({
        where: {id},
        data: assessmentData,
      });

      return res.status(200).json(updatedAssessment);
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
