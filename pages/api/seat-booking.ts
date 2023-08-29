import { getToken } from "next-auth/jwt";
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prismadb";
import nodemailer from "nodemailer";
import { bigint_filter } from "./enrollments";

interface SeatBooking {
  id: number; // Add appropriate types for properties
  userId: number;
  Date: Date;
  seatNumber: string;
  // ... Other properties specific to SeatBooking
}

interface Location {
  id: number; // Add appropriate types for properties
  name: string;
  // ... Other properties specific to Location
  seatBooking: SeatBooking[]; // Define a relationship to SeatBooking
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
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error.message });
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
    } catch (error) {
      return res.status(400).send({ error: error.message });
    }
  }
  try {
    if (token.userData.role === "APPLICANT") {
      const userCohort = await prisma.userCohort.findFirst({
        where: {
          userId: userId,
        },
        orderBy: {
          created_at: "desc",
        },
      });
      if (userCohort == null) {
        return res.status(400).send({ error: "No cohort data" });
      }

      const locations = await prisma.location.findMany({
        where: {
          cohorts: {
            some: {
              id: userCohort.cohortId,
            },
          },
        },
        include: {
          seatBooking: {
            where: {
              Date: {
                gte: new Date(),
              },
            },
          },
        },
      });
//rest 
      const seatBookings: SeatBooking[] = locations
        .map((location: Location) => location.seatBooking)
        .flat();

      return res.status(200).send({ locations, seatBookings });
    } else {
      // Pagination
      const { page, limit }: { page?: string; limit?: string } = req.query;
      const take = parseInt(typeof limit == "string" && limit ? limit : "20");
      const skip = take * parseInt(typeof page == "string" ? page : "0");
      const count = await prisma.seatBooking.count({
        where: {
          Date: {
            gte: new Date(),
          },
        },
      });
      const seatBookings = await prisma.seatBooking.findMany({
        where: {
          Date: {
            gte: new Date(),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              userCohort: {
                include: {
                  cohort: true,
                },
              },
            },
          },
          location: true,
        },
        orderBy: {
          id: "desc",
        },
        take,
        skip,
      });
      const locations = await prisma.location.findMany({
        include: {
          seatBooking: {
            where: {
              Date: {
                gte: new Date(),
              },
            },
          },
        },
      });
      return res.status(200).send({ locations, seatBookings, count });
    }
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: error.message });
  }
}

// Define the function to send the Seat Booking Confirmation email
async function sendSeatBookingConfirmationEmail(
  recipientEmail: string, // Add the type for recipientEmail
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
              <p>Thank you for choosing [Company Name].</p>
            </div>
          </body>
          </html>
        `,
    });

    console.log(`Email sent successfully to ${recipientEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${recipientEmail}: ${error.message}`);
    throw error;
  }
}
