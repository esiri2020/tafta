import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prismadb";
import nodemailer from "nodemailer";
import { bigint_filter } from "./enrollments";
import type { User as PrismaUser } from '@prisma/client';

// Define our own types based on the schema
interface Location {
  id: string;
  location: string;
  seats: number | null;
  name: string;
  seatBooking: SeatBooking[];
}

interface UserWithRelations extends Omit<PrismaUser, 'userCohort'> {
  userCohort: {
    id: string;
    cohort: {
      id: string;
      CohortToLocation: {
        Location: Location;
      }[];
    };
  }[];
}

interface SeatBooking {
  id: string;
  Date: Date;
  user: UserWithRelations;
  location: Location;
}

// Create a Nodemailer transporter with your email service configuration
const transporter = nodemailer.createTransport({
  host: process.env.HOST,
  port: parseInt(process.env.PORT ? process.env.PORT : "2525"),
  auth: {
    user: process.env.USER,
    pass: process.env.PASS,
  },
});

async function asyncForEach(
  array: any[],
  callback: (arg0: any, arg1: number, arg2: any) => any
) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token || token.userData == undefined) {
    return res.status(401).send({
      error:
        "You must be signed in to view the protected content on this page.",
    });
  }
  let userId = token.userData.userId;
  if (req.method === "POST") {
    let body = typeof req.body === "object" ? req.body : JSON.parse(req.body);
    try {
      // Limit scope

      if (token.userData.role !== "APPLICANT") {
        const { email } = body;
        if (!email) {
          return res.status(400).send({ error: "Invalid request" });
        }
        delete body.email;
        const user = await prisma.user.findUnique({
          where: {
            email: email,
          },
        });
        if (!user) {
          return res.status(400).send({ error: "Invalid request" });
        }
        userId = user.id;
      }
      const userBookings = await prisma.seatBooking.findMany({
        where: {
          userId: userId,
          Date: {
            gte: new Date(),
          },
        },
      });
      // TODO: Confirm max number of bookings
      if (userBookings.length >= 5) {
        return res
          .status(400)
          .send({ error: "Maximum number of bookings reached" });
      }
      const seatBooking = await prisma.seatBooking.create({
        data: {
          ...body,
          userId: userId,
        },
      });

      if (typeof token.userData.email !== "string") {
        return res.status(400).send({ error: "Invalid email" });
      } else if (typeof token.userData.firstName !== "string") {
        return res.status(400).send({ error: "Invalid email" });
      }

      await sendSeatBookingConfirmationEmail(
        token.userData.email,
        token.userData.firstName,
        body.Date,
        body.seatNumber
      );
      return res.status(201).send({ message: "success", seatBooking });
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(400).send({ error: error.message });
      }
      return res.status(400).send({ error: 'An error occurred' });
    }
  }
  if (req.method === "DELETE") {
    let { id } = typeof req.body === "object" ? req.body : JSON.parse(req.body);
    if (!id) return res.status(400).send({ error: "Invalid request" });
    try {
      const deleted = await prisma.seatBooking.delete({
        where: { id: id },
      });
      return res.status(200).send({ message: "success", deleted });
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(400).send({ error: error.message });
      }
      return res.status(400).send({ error: 'An error occurred' });
    }
  }
  if (req.method === "PUT") {
    try {
      // ... existing code ...
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        return res.status(400).send({ error: error.message });
      }
      return res.status(400).send({ error: 'An error occurred' });
    }
  }
  if (req.method === 'GET') {
    try {
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' })
      }

      // Debug token structure
      console.log('🔍 Token structure:', {
        id: token.id,
        sub: token.sub,
        email: token.email,
        userData: token.userData
      });

      const userId = token.userData?.userId || token.sub;
      if (!userId) {
        return res.status(400).json({ error: 'User ID not found in token' });
      }

      const user = await prisma.user.findUnique({
        where: {
          id: userId
        },
        include: {
          userCohort: {
            include: {
              cohort: {
                include: {
                  CohortToLocation: {
                    include: {
                      Location: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      const userCohort = user.userCohort[0]
      if (!userCohort) {
        return res.status(404).json({ error: 'User cohort not found' })
      }

      const location = userCohort.cohort.CohortToLocation[0]?.Location
      if (!location) {
        return res.status(404).json({ error: 'Location not found' })
      }

      return res.status(200).json(location)
    } catch (error: unknown) {
      console.error('Error in seat-booking:', error)
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message })
      }
      return res.status(500).json({ error: 'An unknown error occurred' })
    }
  }
  return res.status(405).json({ error: 'Method not allowed' })
}

// Define the function to send the Seat Booking Confirmation email
async function sendSeatBookingConfirmationEmail(
  recipientEmail: string,
  applicantName: string,
  dateAndTime: string,
  seatNumber: string
) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: recipientEmail,
      subject: "Seat Booking Confirmation",
      html: `
          <!DOCTYPE html>
          <html>
          <head>
            <!-- Include the head section of the Seat Booking Confirmation HTML template here -->
          </head>
          <body>
            <div class="container">
              <!-- Include the rest of the Seat Booking Confirmation HTML template here -->
              <p>Dear ${applicantName},</p>
              <p>We are pleased to inform you that your seat for the event on <span class="highlight">${dateAndTime}</span> has been successfully booked. Your seat number is <span class="highlight">${seatNumber}</span>.</p>
              <p>Please bring this confirmation email with you to the event as proof of your booking. We look forward to seeing you there!</p>
              <p>Thank you for choosing TAFTA</p>
            </div>
          </body>
          </html>
        `,
    });

    console.log(`Email sent successfully to ${recipientEmail}`);
  } catch (error: unknown) {
    console.error(`Error sending email to ${recipientEmail}:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to send email');
  }
}
