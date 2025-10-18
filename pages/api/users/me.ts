import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prismadb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({
      error: "You must be signed in to view the protected content on this page.",
    });
  }

  try {
    // Get user ID from token
    const userId = token.userData?.userId || token.sub;
    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      include: {
        profile: true,
        userCohort: {
          include: {
            cohort: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
