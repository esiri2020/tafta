import { compare } from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from "../../../lib/prismadb";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: {
                id: true,
                email: true,
                password: true,
                firstName: true,
                lastName: true,
                role: true,
            }
        });
        
        if (!user) {
            return res.status(404).json({ 
                message: "User not found",
                debug: { emailSearched: email.toLowerCase() }
            });
        }
        
        // Check password
        const passwordValid = await compare(password, user.password);
        
        if (!passwordValid) {
            return res.status(401).json({ 
                message: "Invalid password",
                debug: { 
                    passwordHash: user.password.substring(0, 10) + '...',
                    passwordMatched: passwordValid,
                }
            });
        }
        
        // If we get here, credentials are valid
        return res.status(200).json({
            message: "Credentials valid",
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            }
        });
    } catch (error) {
        console.error("Auth debug error:", error);
        return res.status(500).json({ message: "Something went wrong", error: String(error) });
    }
} 