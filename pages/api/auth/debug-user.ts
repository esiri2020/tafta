import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "../../../lib/prismadb";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    // Only allow in development mode
    if (process.env.NODE_ENV !== 'development') {
        return res.status(404).json({ message: 'Not found' });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Get email from query parameter
        const { email } = req.query;
        
        if (!email || typeof email !== 'string') {
            return res.status(400).json({ message: 'Email parameter is required' });
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                middleName: true,
                role: true,
                createdAt: true,
                profile: true
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the user data
        return res.status(200).json({ user });
    } catch (error) {
        console.error('Debug user error:', error);
        return res.status(500).json({ message: 'Something went wrong' });
    }
} 