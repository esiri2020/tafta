import { getToken } from "next-auth/jwt"
import api from "../../lib/axios.setup"
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../lib/prismadb"
import { Enrollment, User } from "@prisma/client";
import { bigint_filter } from "./enrollments";

async function asyncForEach(array: any[], callback: (arg0: any, arg1: number, arg2: any) => any) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'GET') {
    try {
      const isLocal = process.env.NODE_ENV !== 'production';
      const BATCH_PAGE_LIMIT = isLocal ? 5000 : 10;
      const ENTRIES_PER_PAGE = 25;
      const STOP_DATE = new Date('2025-03-30T00:00:00Z');
      // First, get totalPages from the API
      const firstPageResp = await api.get(`/enrollments?page=1&limit=${ENTRIES_PER_PAGE}`);
      const totalPages = firstPageResp.data.meta.pagination.total_pages;
      // Determine where to start (from last page backwards)
      let lastProgress = await prisma.rehydrationProgress.findFirst({
        orderBy: { updatedAt: 'desc' }
      });
      let startPage = lastProgress?.lastPageProcessed ? lastProgress.lastPageProcessed - 1 : totalPages;
      let currentPage = startPage;
      let processedEnrollments = 0;
      let processedPages = 0;
      let allEnrollments: any[] = [];
      let stopEarly = false;
      const progressId = 'rehydration-main';

      for (let i = 0; i < BATCH_PAGE_LIMIT && currentPage > 0; i++) {
        const { data } = await api.get(`/enrollments?page=${currentPage}&limit=${ENTRIES_PER_PAGE}`);
        const userEmails = data.items.map((item: Data) => item.user_email.toLowerCase());
        const users = await prisma.user.findMany({
          where: { email: { in: userEmails } },
          select: {
            id: true,
            email: true,
            role: true,
            thinkific_user_id: true,
            userCohort: { select: { id: true } }
          }
        });
        const user_list: Promise<User>[] = [];
        const enrollments: Enrollment[] = await Promise.all(data.items.map(async (item: Data) => {
          let { user_email, user_name, ...enrollmentData } = item;
          user_email = user_email.toLowerCase();
          // Check if enrollment is from or before the stop date
          if (enrollmentData.completed_at && new Date(enrollmentData.completed_at) <= STOP_DATE) {
            console.log(`Reached stop date ${STOP_DATE.toISOString().split('T')[0]}, stopping at enrollment ${enrollmentData.id}`);
            stopEarly = true;
            return;
          }
          const user = users.find((user) => user.email.toLowerCase() === user_email);
          if (!user) {
            console.warn('No User: ' + user_email);
            return;
          }
          if (user.role !== "APPLICANT") return;
          const userCohortId = user.userCohort.at(-1)?.id;
          if (!userCohortId) {
            console.error(`User ${user.email} has no cohort`);
            return;
          }
          if (user.thinkific_user_id === null) {
            const updated_user = prisma.user.update({
              where: { id: user.id },
              data: { thinkific_user_id: `${item.user_id}` }
            });
            user_list.push(updated_user);
          }
          if (enrollmentData.percentage_completed) {
            enrollmentData.percentage_completed = parseFloat(enrollmentData.percentage_completed);
          }
          const enrollment = await prisma.enrollment.upsert({
            where: { id: enrollmentData.id },
            update: {
              enrolled: true,
              ...enrollmentData,
              userCohort: { connect: { id: userCohortId } }
            },
            create: {
              enrolled: true,
              ...enrollmentData,
              userCohort: { connect: { id: userCohortId } }
            }
          });
          // Debug log for each enrollment
          console.log(`Upserted enrollment for user: ${user_email}, enrollment id: ${enrollmentData.id}, completed: ${enrollmentData.completed}, completed_at: ${enrollmentData.completed_at}`);
          return enrollment;
        }));
        if (user_list.length > 0) {
          await Promise.allSettled(user_list);
        }
        allEnrollments = allEnrollments.concat(enrollments.filter(Boolean));
        processedEnrollments += enrollments.filter(Boolean).length;
        processedPages++;
        console.log(`Processed page ${currentPage} of ${totalPages}`);
        await prisma.rehydrationProgress.upsert({
          where: { id: progressId },
          update: { lastPageProcessed: currentPage, updatedAt: new Date(), totalPages },
          create: { id: progressId, lastPageProcessed: currentPage, updatedAt: new Date(), totalPages }
        });
        if (currentPage === 1) {
          stopEarly = true;
          break;
        }
        currentPage--;
      }
      await prisma.rehydrationDate.create({
        data: { enrollment_count: processedEnrollments }
      });
      if (stopEarly || currentPage <= 0) {
        await prisma.rehydrationProgress.deleteMany({});
        console.log('All pages processed. Progress reset.');
      }
      return res.status(200).json({
        message: 'Batch synchronizing',
        processedPages,
        processedEnrollments,
        lastPageProcessed: currentPage,
        totalPages,
        done: stopEarly || currentPage <= 0
      });
    } catch (err) {
      console.error('Rehydration error:', err);
      return res.status(500).json({
        message: err instanceof Error ? err.message : 'An error occurred',
        error: true
      });
    }
  }
}