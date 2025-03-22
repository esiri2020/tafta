import { hash } from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "../../../lib/prismadb";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        // Create a test user with known credentials
        const hashedPassword = await hash("password123", 12);
        
        // Check if user exists first
        const existingUser = await prisma.user.findUnique({
            where: { email: "test@example.com" }
        });
        
        if (existingUser) {
            return res.status(200).json({ 
                message: "Test user already exists",
                user: {
                    email: existingUser.email,
                    testPassword: "password123"
                }
            });
        }
        
        // Create the user if not exists
        const user = await prisma.user.create({
            data: {
                email: "test@example.com",
                firstName: "Test",
                lastName: "User",
                password: hashedPassword,
                role: "APPLICANT",
            }
        });
        
        return res.status(201).json({
            message: "Test user created",
            user: {
                email: user.email,
                testPassword: "password123"
            }
        });
    } catch (error) {
        console.error("Test user creation error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
} 