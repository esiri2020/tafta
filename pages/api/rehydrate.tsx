import { getToken } from "next-auth/jwt"
import api from "../../lib/axios.setup"
import type { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../lib/prismadb"
import { Enrollment, User } from "@prisma/client";

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

/**
 * Unified Rehydration Endpoint
 * 
 * Supports multiple strategies:
 * - full: Complete rehydration (all pages)
 * - smart: Recent changes only (last X minutes)
 * - status: Check progress and system health
 * 
 * Memory-optimized with controlled concurrency to prevent SIGSEGV crashes
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { strategy = 'full', minutes = '5' } = req.query;
    
    console.log(`🔄 Starting ${strategy} rehydration strategy`);
    
    switch (strategy) {
      case 'smart':
        return await handleSmartRehydration(req, res, parseInt(minutes as string));
      
      case 'full':
        return await handleFullRehydration(req, res);
      
      case 'status':
        return await handleStatusCheck(req, res);
      
      default:
        return res.status(400).json({ 
          error: 'Invalid strategy',
          availableStrategies: ['full', 'smart', 'status']
        });
    }
    
  } catch (error: any) {
    console.error('❌ Rehydration error:', error);
    return res.status(500).json({
      error: 'Rehydration failed',
      message: error.message,
    });
  }
}

/**
 * Smart Rehydration - Only recent changes (FAST)
 */
async function handleSmartRehydration(req: NextApiRequest, res: NextApiResponse, minutes: number) {
  try {
    const sinceDate = new Date(Date.now() - minutes * 60 * 1000);
    
    console.log(`🔄 Smart rehydration: Processing enrollments updated since ${sinceDate.toISOString()}`);
    
    // Get recent enrollments from Thinkific
    const response = await api.get('/enrollments', {
      params: {
        page: 1,
        limit: 1000,
        updated_since: sinceDate.toISOString(),
      }
    });
    
    const enrollments = response.data.data || [];
    
    if (enrollments.length === 0) {
      console.log('✅ No recent enrollments to process');
      return res.status(200).json({
        message: 'No recent enrollments to process',
        processedCount: 0,
        timeRange: `${minutes} minutes`,
      });
    }
    
    console.log(`📊 Found ${enrollments.length} recent enrollments to process`);
    
    // Get all user emails from recent enrollments
    const userEmails = enrollments.map((item: any) => item.user_email.toLowerCase());
    
    // Get users in batch
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
    
    // Filter enrollments for registered users only
    const validUserEmails = new Set(users.map(user => user.email.toLowerCase()));
    const filteredEnrollments = enrollments.filter((item: any) => 
      validUserEmails.has(item.user_email.toLowerCase())
    );
    
    console.log(`📊 Processing ${filteredEnrollments.length} enrollments for registered users`);
    
    // Process enrollments in small batches to prevent memory issues
    const batchSize = 10;
    let processedCount = 0;
    
    for (let i = 0; i < filteredEnrollments.length; i += batchSize) {
      const batch = filteredEnrollments.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (item: any) => {
        try {
          return await processEnrollment(item, users);
        } catch (error) {
          console.error(`❌ Error processing enrollment ${item.id}:`, error);
          return null;
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      const successfulEnrollments = batchResults
        .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value);
      
      processedCount += successfulEnrollments.length;
      
      // Small delay between batches
      if (i + batchSize < filteredEnrollments.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`✅ Smart rehydration completed: ${processedCount} enrollments processed`);
    
    return res.status(200).json({
      message: 'Smart rehydration completed',
      processedCount,
      timeRange: `${minutes} minutes`,
      totalFound: enrollments.length,
      processedForRegisteredUsers: processedCount
    });
    
  } catch (error: any) {
    console.error('❌ Smart rehydration error:', error);
    return res.status(500).json({
      error: 'Smart rehydration failed',
      message: error.message,
    });
  }
}

/**
 * Full Rehydration - All pages (COMPLETE but MEMORY-OPTIMIZED)
 */
async function handleFullRehydration(req: NextApiRequest, res: NextApiResponse) {
    try {
      const isLocal = process.env.NODE_ENV !== 'production';
    const BATCH_PAGE_LIMIT = isLocal ? 100 : 20; // Reduced batch size
    const ENTRIES_PER_PAGE = 50; // Reduced entries per page
    const CONCURRENT_ENROLLMENTS = 10; // Limit concurrent operations
      const STOP_DATE = new Date('2025-03-30T00:00:00Z');
    
    console.log('🚀 Starting full rehydration process...');
    
    // Get total pages
      const firstPageResp = await api.get(`/enrollments?page=1&limit=${ENTRIES_PER_PAGE}`);
      const totalPages = firstPageResp.data.meta.pagination.total_pages;
    
    // Get last progress
      let lastProgress = await prisma.rehydrationProgress.findFirst({
        orderBy: { updatedAt: 'desc' }
      });
    
      let startPage = lastProgress?.lastPageProcessed ? lastProgress.lastPageProcessed - 1 : totalPages;
      let currentPage = startPage;
      let processedEnrollments = 0;
      let processedPages = 0;
      let stopEarly = false;
      const progressId = 'rehydration-main';

    // Process pages in smaller batches
      for (let i = 0; i < BATCH_PAGE_LIMIT && currentPage > 0; i++) {
      try {
        console.log(`📄 Processing page ${currentPage} of ${totalPages}...`);
        
        const { data } = await api.get(`/enrollments?page=${currentPage}&limit=${ENTRIES_PER_PAGE}`);
        const userEmails = data.items.map((item: Data) => item.user_email.toLowerCase());
        
        // Get users in batch
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
        
        // Filter valid enrollments
        const validUserEmails = new Set(users.map(user => user.email.toLowerCase()));
        const filteredEnrollments = data.items.filter((item: Data) => 
          validUserEmails.has(item.user_email.toLowerCase())
        );
        
        console.log(`📊 Page ${currentPage}: Found ${data.items.length} enrollments, ${filteredEnrollments.length} for registered users`);
        
        // Process enrollments in smaller concurrent batches
        const enrollmentBatches = chunkArray(filteredEnrollments, CONCURRENT_ENROLLMENTS);
        
        for (const batch of enrollmentBatches) {
          const batchPromises = batch.map(async (item) => {
            try {
              return await processEnrollment(item as Data, users, STOP_DATE);
            } catch (error) {
              console.error(`❌ Error processing enrollment ${(item as Data).id}:`, error);
              return null;
            }
          });
          
          const batchResults = await Promise.allSettled(batchPromises);
          const successfulEnrollments = batchResults
            .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled' && result.value !== null)
            .map(result => result.value);
          
          processedEnrollments += successfulEnrollments.length;
          
          // Check for stop condition
          if (successfulEnrollments.some(e => e?.stopEarly)) {
            stopEarly = true;
            break;
          }
        }
        
        processedPages++;
        
        // Update progress after each page (not accumulating in memory)
        await prisma.rehydrationProgress.upsert({
          where: { id: progressId },
          update: { 
            lastPageProcessed: currentPage, 
            updatedAt: new Date(), 
            totalPages 
          },
          create: { 
            id: progressId, 
            lastPageProcessed: currentPage, 
            updatedAt: new Date(), 
            totalPages 
          }
        });
        
        console.log(`✅ Processed page ${currentPage}: ${processedEnrollments} enrollments total`);
        
        if (stopEarly || currentPage === 1) {
          break;
        }
        
        currentPage--;
        
        // Add small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error processing page ${currentPage}:`, error);
        // Continue with next page instead of crashing
        currentPage--;
        continue;
      }
    }
    
    // Create completion record
    await prisma.rehydrationDate.create({
      data: { enrollment_count: processedEnrollments }
    });
    
    if (stopEarly || currentPage <= 0) {
      await prisma.rehydrationProgress.deleteMany({});
      console.log('✅ All pages processed. Progress reset.');
    }
    
    console.log(`🎉 Full rehydration completed: ${processedPages} pages, ${processedEnrollments} enrollments`);
    
    return res.status(200).json({
      message: 'Full rehydration completed',
      processedPages,
      processedEnrollments,
      lastPageProcessed: currentPage,
      totalPages,
      done: stopEarly || currentPage <= 0,
      memoryOptimized: true
    });
    
  } catch (error: any) {
    console.error('❌ Full rehydration error:', error);
    return res.status(500).json({
      error: 'Full rehydration failed',
      message: error.message,
    });
  }
}

/**
 * Status Check - Progress and system health
 */
async function handleStatusCheck(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Get current progress
    const progress = await prisma.rehydrationProgress.findFirst({
      orderBy: { updatedAt: 'desc' }
    });
    
    // Get recent rehydration stats
    const recentRehydrations = await prisma.rehydrationDate.findMany({
      orderBy: { created_at: 'desc' },
      take: 5
    });
    
    // Get system health
    const userCount = await prisma.user.count();
    const enrollmentCount = await prisma.enrollment.count();
    
    return res.status(200).json({
      message: 'Rehydration status',
      progress: progress ? {
        lastPageProcessed: progress.lastPageProcessed,
        totalPages: progress.totalPages,
        updatedAt: progress.updatedAt,
        percentage: progress.totalPages && progress.lastPageProcessed ? Math.round((progress.lastPageProcessed / progress.totalPages) * 100) : 0
      } : null,
      recentRehydrations: recentRehydrations.map(r => ({
        enrollmentCount: r.enrollment_count,
        createdAt: r.created_at
      })),
      systemStats: {
        totalUsers: userCount,
        totalEnrollments: enrollmentCount
      },
      availableStrategies: ['full', 'smart', 'status']
    });
    
  } catch (error: any) {
    console.error('❌ Status check error:', error);
    return res.status(500).json({
      error: 'Status check failed',
      message: error.message,
    });
  }
}

/**
 * Process a single enrollment with proper error handling
 */
async function processEnrollment(item: Data, users: any[], STOP_DATE?: Date) {
  const { user_email, user_name, ...enrollmentData } = item;
  const userEmail = user_email.toLowerCase();
  
  // Check stop date
  if (STOP_DATE && enrollmentData.completed_at && new Date(enrollmentData.completed_at) <= STOP_DATE) {
    console.log(`🛑 Reached stop date ${STOP_DATE.toISOString().split('T')[0]}, stopping at enrollment ${enrollmentData.id}`);
    return { stopEarly: true };
  }
  
  const user = users.find((user) => user.email.toLowerCase() === userEmail);
  if (!user || user.role !== "APPLICANT") {
    return null;
  }
  
          const userCohortId = user.userCohort.at(-1)?.id;
          if (!userCohortId) {
    console.error(`❌ User ${user.email} has no cohort`);
    return null;
          }
  
  // Update user's Thinkific ID if needed
          if (user.thinkific_user_id === null) {
    await prisma.user.update({
              where: { id: user.id },
              data: { thinkific_user_id: `${item.user_id}` }
            });
          }
  
  // Process percentage completed
          if (enrollmentData.percentage_completed) {
            enrollmentData.percentage_completed = parseFloat(enrollmentData.percentage_completed);
          }
  
  // Upsert enrollment
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
  
  console.log(`✅ Upserted enrollment for user: ${userEmail}, enrollment id: ${enrollmentData.id}`);
          return enrollment;
}

/**
 * Split array into chunks for controlled concurrency
 */
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}