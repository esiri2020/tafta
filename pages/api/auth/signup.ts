import { hash } from 'bcryptjs';
import { formatISO } from 'date-fns';
import prisma from "../../../lib/prismadb"
import api from "../../../lib/axios.setup"
import { getToken } from "next-auth/jwt"
import { NextApiRequest, NextApiResponse } from 'next';
import type { Cohort, Role } from '@prisma/client'
import { createTransport } from 'nodemailer';

// TODO: create user on thinkific
// TODO: add user to cohort group on thinkific

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
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const {
            email,
            password,
            firstName,
            lastName,
            middleName,
            profile,
            cohortId,
            type
        } = req.body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return res.status(422).json({ message: "User already exists" });
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Determine registration type
        const registrationType = type || (profile?.type === 'enterprise' ? 'enterprise' : 'individual');
        const isEnterprise = registrationType === 'enterprise';

        // Create user with profile if profile data was provided
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                firstName,
                lastName,
                middleName,
                password: hashedPassword,
                role: "APPLICANT",
                ...(profile && {
                    profile: {
                        create: {
                            // Set registration path based on type
                            registrationPath: isEnterprise ? "ENTERPRISE" : "INDIVIDUAL",
                            type: isEnterprise ? "ENTERPRISE" : "INDIVIDUAL",
                            
                            // Add enterprise specific fields if provided
                            ...(isEnterprise && profile.businessName && {
                                businessName: profile.businessName,
                            }),
                            
                            // Only add these fields if they were explicitly provided
                            ...(isEnterprise && profile.businessType && {
                                businessType: profile.businessType,
                            }),
                            ...(isEnterprise && profile.revenueRange && {
                                revenueRange: profile.revenueRange,
                            }),
                            ...(isEnterprise && profile.businessRegType && {
                                businessRegType: profile.businessRegType,
                            }),
                            ...(isEnterprise && profile.businessSupportNeeds && {
                                businessSupportNeeds: profile.businessSupportNeeds,
                            }),
                            
                            // Individual specific fields if provided
                            ...(!isEnterprise && profile.employmentStatus && {
                                employmentStatus: profile.employmentStatus,
                            }),
                            ...(!isEnterprise && profile.salaryExpectation && {
                                salaryExpectation: typeof profile.salaryExpectation === 'number' 
                                    ? profile.salaryExpectation 
                                    : parseFloat(profile.salaryExpectation) || 0,
                            }),
                        },
                    },
                }),
                // Create user cohort if cohortId is provided
                ...(cohortId && {
                    userCohort: {
                        create: {
                            cohortId,
                        },
                    },
                }),
            },
            include: {
                profile: true,
                userCohort: true,
            },
        });

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

        return res.status(201).json({
            message: "User created",
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
}