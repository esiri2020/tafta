import { NextApiRequest, NextApiResponse } from "next";
import api from "../../lib/axios.setup";
import prisma from "../../lib/prismadb";
import { User } from "@prisma/client";

// === Helpers ===
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function executeWithRetry<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      const retriable = error.message?.includes('Closed') || error.message?.includes('connection');
      if (retriable && i < retries - 1) {
        console.log(`Retry ${i + 1}/${retries} after DB error...`);
        await sleep(1000 * (i + 1));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries reached');
}

async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await api.get(url);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429 && i < retries - 1) {
        console.warn(`Rate limited. Retrying after ${(i + 1) * 2000}ms...`);
        await sleep((i + 1) * 2000);
        continue;
      }
      throw error;
    }
  }
  throw new Error('API fetch failed after retries');
}

// === Types ===
interface Data {
  user_email: string;
  user_name: string;
  id: number;
  user_id: number;
  course_name: string;
  course_id: number;
  percentage_completed: any;
  expired: boolean;
  is_free_trial: boolean;
  completed: boolean;
  started_at: Date;
  activated_at: Date;
  completed_at: Date;
  updated_at: Date;
  expiry_date: Date;
}

// === Main Handler ===
// NOTE: This endpoint is intended to be triggered by Vercel's cron job every 10 minutes.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  // No cron_secret check; endpoint is public for Vercel cron

  const startTime = Date.now();
  try {
    console.log("🔄 Starting batch rehydration of incomplete enrollments...");

    const BATCH_SIZE = 5;
    let processedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let batchNumber = 0;
    let hasMore = true;

    while (hasMore) {
      // Fetch a batch of incomplete or active enrollments
      const incompleteEnrollments = await prisma.enrollment.findMany({
        where: {
          OR: [
            { completed: false },
            { completed: null },
            { AND: [ { completed: false }, { started_at: { not: null } } ] }, // active: started but not completed
          ]
        },
        take: BATCH_SIZE,
        orderBy: { updated_at: 'asc' },
        include: {
          userCohort: {
            include: {
              user: true
            }
          }
        }
      });
      if (incompleteEnrollments.length === 0) {
        hasMore = false;
        break;
      }
      batchNumber++;
      console.log(`\n⚙️ Processing batch ${batchNumber} (${incompleteEnrollments.length} enrollments)...`);

      for (const enrollment of incompleteEnrollments) {
        try {
          let thinkificStatus = null;
          let foundById = false;
          // 1. Try by enrollment ID
          if (enrollment.id) {
            try {
              const response = await fetchWithRetry(`/enrollments/${enrollment.id}`);
              thinkificStatus = response;
              foundById = true;
            } catch (apiError) {
              const err = apiError as any;
              if (err?.response?.status !== 404) {
                console.error(`Error fetching Thinkific status for enrollment ${enrollment.id}:`, err?.response?.data || err);
              }
            }
          }
          // 2. If not found by ID, try by user email
          if (!thinkificStatus && enrollment.userCohort?.user?.email) {
            try {
              // Find Thinkific user by email
              const userResp = await fetchWithRetry(`/users?query[email]=${encodeURIComponent(enrollment.userCohort.user.email)}`);
              const thinkificUser = userResp.items && userResp.items.length > 0 ? userResp.items[0] : null;
              if (thinkificUser) {
                // Get all enrollments for this user
                const enrollmentsResp = await fetchWithRetry(`/users/${thinkificUser.id}/enrollments`);
                // Try to match by course_id
                thinkificStatus = enrollmentsResp.items.find((e: any) => String(e.course_id) === String(enrollment.course_id));
                // If found, update the local enrollment id
                if (thinkificStatus && !enrollment.id && thinkificStatus.id) {
                  await prisma.enrollment.update({
                    where: { uid: enrollment.uid },
                    data: { id: BigInt(thinkificStatus.id) }
                  });
                }
              }
            } catch (err) {
              console.error(`Error fetching Thinkific user/enrollments for email ${enrollment.userCohort.user.email}:`, err);
            }
          }
          // 3. If still not found, skip and log
          if (!thinkificStatus) {
            console.log(`Enrollment not found in LMS for local enrollment uid: ${enrollment.uid}, email: ${enrollment.userCohort?.user?.email}`);
            skippedCount++;
            continue;
          }
          // 4. Update all status fields
          await prisma.enrollment.update({
            where: { uid: enrollment.uid },
            data: {
              completed: thinkificStatus.completed,
              enrolled: thinkificStatus.enrolled,
              expired: thinkificStatus.expired,
              percentage_completed: thinkificStatus.percentage_completed != null && thinkificStatus.percentage_completed !== ''
                ? parseFloat(thinkificStatus.percentage_completed)
                : null,
              completed_at: thinkificStatus.completed_at ? new Date(thinkificStatus.completed_at) : null,
              started_at: thinkificStatus.started_at ? new Date(thinkificStatus.started_at) : null,
              activated_at: thinkificStatus.activated_at ? new Date(thinkificStatus.activated_at) : null,
              updated_at: new Date(),
              id: thinkificStatus.id ? BigInt(thinkificStatus.id) : enrollment.id,
            },
          });
          processedCount++;
          console.log(`✅ Updated enrollment uid: ${enrollment.uid} (id: ${enrollment.id}) with current LMS status.`);
        } catch (error) {
          console.error(`❌ Error processing enrollment uid: ${enrollment.uid}:`, error);
          errorCount++;
        }
      }
      // Wait a bit between batches to avoid hammering DB/API
      await sleep(500);
    }

    const duration = Date.now() - startTime;
    console.log(`\n✅ Batch rehydration completed:`);
    console.log(`   Total Processed: ${processedCount} enrollments`);
    console.log(`   Total Skipped: ${skippedCount} enrollments`);
    console.log(`   Total Errors: ${errorCount}`);
    console.log(`   Duration: ${(duration / 1000).toFixed(1)} seconds`);

    await prisma.rehydrationDate.create({
      data: {
        enrollment_count: processedCount,
        duration,
        status: "completed",
        error: errorCount > 0 ? `Completed with ${errorCount} errors` : null
      }
    });

    return res.status(200).json({
      message: "Batch rehydration completed",
      processed: processedCount,
      skipped: skippedCount,
      errors: errorCount,
      duration
    });

  } catch (error: any) {
    console.error("❌ Rehydration failed:", error);
    const duration = Date.now() - startTime;

    await prisma.rehydrationDate.create({
      data: {
        enrollment_count: 0,
        duration,
        status: "failed",
        error: error.message
      }
    });

    return res.status(500).json({ error: error.message });
  }
}