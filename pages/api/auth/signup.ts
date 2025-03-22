import { hash } from 'bcryptjs';
import { formatISO } from 'date-fns';
import prisma from "../../../lib/prismadb"
import api from "../../../lib/axios.setup"
import { getToken } from "next-auth/jwt"
import { NextApiRequest, NextApiResponse } from 'next';
import type { Cohort, Role } from '@prisma/client'

// TODO: create user on thinkific
// TODO: add user to cohort group on thinkific

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
            cohortId
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
                            // If it's enterprise registration, add enterprise-specific fields
                            ...(profile.type === 'enterprise' && {
                                registrationPath: "ENTERPRISE",
                                businessName: profile.businessName,
                                businessType: profile.businessType,
                                revenueRange: profile.revenueRange,
                                businessRegType: profile.registrationType,
                                businessSupportNeeds: profile.businessSupportNeeds || [],
                            }),
                            // If it's individual registration, add individual-specific fields
                            ...(profile.type === 'individual' && {
                                registrationPath: "INDIVIDUAL",
                                employmentStatus: profile.employmentStatus,
                                salaryExpectation: parseFloat(profile.salaryExpectation) || 0,
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

        return res.status(201).json({
            message: "User created",
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            },
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ message: "Something went wrong" });
    }
}