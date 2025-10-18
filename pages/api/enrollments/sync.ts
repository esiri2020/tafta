import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import thinkificApi from '../../../lib/thinkific-api';
import { SyncCursor, EnrollmentJobData } from '../../../types/enrollment';

// Redis connection
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required for BullMQ
});

// BullMQ queue
const enrollmentQueue = new Queue('enrollment-processing', {
  connection: redis,
});

// Sync cursor storage key
const SYNC_CURSOR_KEY = 'enrollment_sync_cursor';

/**
 * Get current sync cursor from Redis
 */
async function getSyncCursor(): Promise<SyncCursor> {
  try {
    const cursorData = await redis.get(SYNC_CURSOR_KEY);
    if (cursorData) {
      return JSON.parse(cursorData);
    }
  } catch (error) {
    console.error('❌ Error getting sync cursor:', error);
  }

  // Default cursor - start from 24 hours ago
  const defaultCursor: SyncCursor = {
    lastProcessedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    totalProcessed: 0,
  };

  return defaultCursor;
}

/**
 * Update sync cursor in Redis
 */
async function updateSyncCursor(cursor: SyncCursor): Promise<void> {
  try {
    await redis.setex(SYNC_CURSOR_KEY, 86400, JSON.stringify(cursor)); // Expire in 24 hours
  } catch (error) {
    console.error('❌ Error updating sync cursor:', error);
  }
}

/**
 * Sync endpoint for fetching missed enrollment events
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Require authentication
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only allow admins to trigger sync
  if (token?.userData?.role !== 'SUPERADMIN' && token?.userData?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized - Admin access required' });
  }

  try {
    console.log('🔄 Starting enrollment sync process...');

    // Get current cursor
    const cursor = await getSyncCursor();
    console.log('📊 Current sync cursor:', cursor);

    // Fetch enrollments from Thinkific API
    const response = await thinkificApi.getEnrollmentsSince(cursor);
    const enrollments = response.items;

    console.log(`📥 Fetched ${enrollments.length} enrollments from Thinkific`);

    if (enrollments.length === 0) {
      return res.status(200).json({
        message: 'No new enrollments found',
        cursor,
        processed: 0,
        queued: 0,
      });
    }

    let queuedCount = 0;
    let skippedCount = 0;
    let lastProcessedAt = cursor.lastProcessedAt;
    let lastEnrollmentId = cursor.lastEnrollmentId;

    // Process each enrollment
    for (const enrollment of enrollments) {
      try {
        // Check if job already exists (deduplication)
        const existingJob = await enrollmentQueue.getJob(enrollment.id);
        if (existingJob) {
          console.log(`⏭️ Skipping duplicate enrollment: ${enrollment.id}`);
          skippedCount++;
          continue;
        }

        // Create job data
        const jobData: EnrollmentJobData = {
          eventId: `sync-${enrollment.id}`,
          eventType: 'enrollment.progress', // Default type for sync
          enrollmentData: enrollment,
          processedAt: new Date().toISOString(),
          retryCount: 0,
        };

        // Add job to queue
        await enrollmentQueue.add(
          `sync-${enrollment.id}`,
          jobData,
          {
            jobId: `sync-${enrollment.id}`,
            priority: 4, // Lower priority than webhooks
            delay: 0,
          }
        );

        queuedCount++;
        lastProcessedAt = enrollment.activated_at || lastProcessedAt;
        lastEnrollmentId = enrollment.id;

        console.log(`✅ Queued enrollment for sync: ${enrollment.id}`);

      } catch (error: any) {
        console.error(`❌ Error processing enrollment ${enrollment.id}:`, error);
      }
    }

    // Update cursor
    const newCursor: SyncCursor = {
      lastProcessedAt,
      lastEnrollmentId,
      totalProcessed: cursor.totalProcessed + enrollments.length,
    };

    await updateSyncCursor(newCursor);

    // Get queue metrics
    const waiting = await enrollmentQueue.getWaiting();
    const failed = await enrollmentQueue.getFailed();

    console.log(`🎯 Sync completed: ${queuedCount} queued, ${skippedCount} skipped`);

    return res.status(200).json({
      message: 'Sync completed successfully',
      cursor: newCursor,
      processed: enrollments.length,
      queued: queuedCount,
      skipped: skippedCount,
      queueStatus: {
        waiting: waiting.length,
        failed: failed.length,
      },
    });

  } catch (error: any) {
    console.error('❌ Sync process error:', error);
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to sync enrollments',
      details: error.message,
    });
  }
}

/**
 * GET endpoint to check sync status
 */
export async function getSyncStatus(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const cursor = await getSyncCursor();
    const waiting = await enrollmentQueue.getWaiting();
    const failed = await enrollmentQueue.getFailed();

    return res.status(200).json({
      cursor,
      queueStatus: {
        waiting: waiting.length,
        failed: failed.length,
      },
      lastSync: cursor.lastProcessedAt,
    });
  } catch (error: any) {
    console.error('❌ Error getting sync status:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get sync status',
    });
  }
}

