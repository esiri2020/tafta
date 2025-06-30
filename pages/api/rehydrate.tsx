import { NextApiRequest, NextApiResponse } from "next";
import api from "../../lib/axios.setup";
import prisma from "../../lib/prismadb";
import { User, Prisma } from "@prisma/client";

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

  const THINKIFIC_GET_LIMIT = 250;
  const BATCH_SIZE = 5;
  const startTime = Date.now();
  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  let getCount = 0;
  let batchNumber = 0;
  let cycleCompleted = false;

  try {
    // 1. Get all active cohorts, ordered by start_date DESC
    const activeCohorts = await prisma.cohort.findMany({
      where: { active: true },
      orderBy: { start_date: 'desc' },
      select: { id: true, name: true }
    });
    if (!activeCohorts.length) {
      return res.status(200).json({ message: 'No active cohorts to process.' });
    }

    // 2. Load or initialize progress
    let progress = await prisma.rehydrationProgress.findFirst({
      orderBy: { updatedAt: 'desc' }
    });
    let currentCohortIdx = 0;
    let lastUpdatedAt: Date | null = null;
    let lastEnrollmentUid: string | null = null;
    let cycle = 1;
    let lastCycleDate: Date | null = null;

    if (progress) {
      currentCohortIdx = activeCohorts.findIndex(c => c.id === progress.cohortId);
      if (currentCohortIdx === -1) currentCohortIdx = 0; // fallback if cohort was deactivated
      lastUpdatedAt = progress.lastUpdatedAt;
      lastEnrollmentUid = progress.lastEnrollmentUid;
      cycle = progress.cycle;
      lastCycleDate = progress.lastCycleDate;
    }

    let hasMoreCohorts = true;
    let cohortLooped = false;
    let cohortProcessed = false;

    // Process cohorts one by one, completing each cohort before moving to the next
    while (currentCohortIdx < activeCohorts.length && getCount < THINKIFIC_GET_LIMIT) {
      const cohort = activeCohorts[currentCohortIdx];
      if (!cohort) break;
      
      console.log(`🔄 Processing cohort: ${cohort.name} (${currentCohortIdx + 1}/${activeCohorts.length})`);
      
      // Process ALL enrollments in this cohort until none left or GET limit reached
      let cohortHasMoreEnrollments = true;
      
      while (cohortHasMoreEnrollments && getCount < THINKIFIC_GET_LIMIT) {
        // Query next batch of enrollments for this cohort
        const where: Prisma.EnrollmentWhereInput = {
          userCohort: { cohortId: cohort.id },
          OR: [
            { completed: false },
            { completed: null },
            { AND: [ { completed: false }, { started_at: { not: null } } ] }
          ],
          ...(lastUpdatedAt && lastEnrollmentUid ? {
            OR: [
              { updated_at: { gt: lastUpdatedAt } },
              { updated_at: lastUpdatedAt, uid: { gt: lastEnrollmentUid } }
            ]
          } : {})
        };
        
        const enrollments = await prisma.enrollment.findMany({
          where,
          orderBy: [
            { updated_at: 'desc' },
            { uid: 'desc' }
          ],
          take: BATCH_SIZE,
          include: {
            userCohort: { include: { user: true } }
          }
        });
        
        if (!enrollments.length) {
          // No more enrollments in this cohort, move to next
          cohortHasMoreEnrollments = false;
          console.log(`✅ Completed cohort: ${cohort.name}`);
          break;
        }
        
        batchNumber++;
        console.log(`⚙️ Processing batch ${batchNumber} (${enrollments.length} enrollments) for cohort: ${cohort.name}`);
        
        for (const enrollment of enrollments) {
          if (getCount >= THINKIFIC_GET_LIMIT) {
            console.log(`🛑 Reached GET limit (${THINKIFIC_GET_LIMIT}) while processing cohort: ${cohort.name}`);
            break;
          }
          
          let thinkificStatus = null;
          
          // 1. Try by enrollment ID
          if (enrollment.id) {
            try {
              thinkificStatus = await fetchWithRetry(`/enrollments/${enrollment.id}`);
              getCount++;
            } catch (apiError) {
              getCount++;
              const err = apiError as any;
              if (err?.response?.status !== 404) {
                console.error(`Error fetching Thinkific status for enrollment ${enrollment.id}:`, err?.response?.data || err);
              }
            }
          }
          
          // 2. If not found by ID, try by user email
          if (!thinkificStatus && enrollment.userCohort?.user?.email) {
            try {
              const userResp = await fetchWithRetry(`/users?query[email]=${encodeURIComponent(enrollment.userCohort.user.email)}`);
              getCount++;
              const thinkificUser = userResp.items && userResp.items.length > 0 ? userResp.items[0] : null;
              if (thinkificUser) {
                const enrollmentsResp = await fetchWithRetry(`/users/${thinkificUser.id}/enrollments`);
                getCount++;
                thinkificStatus = enrollmentsResp.items.find((e: any) => String(e.course_id) === String(enrollment.course_id));
                if (thinkificStatus && !enrollment.id && thinkificStatus.id) {
                  await prisma.enrollment.update({
                    where: { uid: enrollment.uid },
                    data: { id: BigInt(thinkificStatus.id) }
                  });
                }
              }
            } catch (err) {
              getCount++;
              console.error(`Error fetching Thinkific user/enrollments for email ${enrollment.userCohort.user.email}:`, err);
            }
          }
          
          // 3. If still not found, skip and log
          if (!thinkificStatus) {
            console.log(`Enrollment not found in LMS for local enrollment uid: ${enrollment.uid}, email: ${enrollment.userCohort?.user?.email}`);
            skippedCount++;
            lastUpdatedAt = enrollment.updated_at;
            lastEnrollmentUid = enrollment.uid;
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
          
          console.log(`✅ Updated enrollment uid: ${enrollment.uid} (id: ${thinkificStatus.id}) with current LMS status.`);
          processedCount++;
          lastUpdatedAt = enrollment.updated_at;
          lastEnrollmentUid = enrollment.uid;
        }
        
        // Small delay between batches
        await sleep(500);
      }
      
      // Move to next cohort
      currentCohortIdx++;
      lastUpdatedAt = null;
      lastEnrollmentUid = null;
      
      // If we finished all cohorts, mark cycle complete
      if (currentCohortIdx >= activeCohorts.length) {
        cycle++;
        lastCycleDate = new Date();
        currentCohortIdx = 0;
        lastUpdatedAt = null;
        lastEnrollmentUid = null;
        cycleCompleted = true;
        console.log(`🎉 Completed full cycle ${cycle - 1}. Starting cycle ${cycle}.`);
        break;
      }
    }
    // Save progress
    await prisma.rehydrationProgress.upsert({
      where: { id: progress?.id || '' },
      update: {
        cohortId: activeCohorts[currentCohortIdx]?.id || activeCohorts[0].id,
        lastUpdatedAt: lastUpdatedAt || new Date(0),
        lastEnrollmentUid: lastEnrollmentUid || '',
        cycle,
        lastCycleDate: lastCycleDate || progress?.lastCycleDate || new Date(0)
      },
      create: {
        cohortId: activeCohorts[currentCohortIdx]?.id || activeCohorts[0].id,
        lastUpdatedAt: lastUpdatedAt || new Date(0),
        lastEnrollmentUid: lastEnrollmentUid || '',
        cycle,
        lastCycleDate: lastCycleDate || new Date(0)
      }
    });
    const duration = Date.now() - startTime;
    return res.status(200).json({
      message: cycleCompleted ? 'Rehydration cycle completed. Starting new cycle.' : 'Batch rehydration completed',
      processed: processedCount,
      skipped: skippedCount,
      errors: errorCount,
      duration,
      cycle,
      lastCycleDate,
      currentCohort: activeCohorts[currentCohortIdx]?.name || null,
      lastUpdatedAt,
      lastEnrollmentUid,
      getCount
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    return res.status(500).json({ error: error.message, duration });
  }
}