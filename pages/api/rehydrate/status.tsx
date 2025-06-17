import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    // Get the last sync record
    const lastSync = await prisma.rehydrationDate.findFirst({
      orderBy: { created_at: "desc" }
    });

    if (!lastSync) {
      return res.status(200).json({
        status: "no_sync",
        message: "No sync has been performed yet"
      });
    }

    // Get sync statistics
    const totalEnrollments = await prisma.enrollment.count();
    const activeEnrollments = await prisma.enrollment.count({
      where: {
        completed: false,
        expired: false,
        enrolled: true
      }
    });
    const completedEnrollments = await prisma.enrollment.count({
      where: {
        completed: true
      }
    });

    return res.status(200).json({
      last_sync: {
        date: lastSync.created_at,
        status: lastSync.status,
        duration: lastSync.duration,
        error: lastSync.error,
        enrollment_count: lastSync.enrollment_count
      },
      current_stats: {
        total_enrollments: totalEnrollments,
        active_enrollments: activeEnrollments,
        completed_enrollments: completedEnrollments
      }
    });
  } catch (error: any) {
    console.error("Error fetching sync status:", error);
    return res.status(500).json({ error: error.message || "Internal error" });
  }
} 