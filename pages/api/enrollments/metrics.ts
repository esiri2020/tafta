import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { getMetrics, resetMetrics } from '../../../workers/enrollment-processor.js';
import { EnrollmentSyncMetrics } from '../../../types/enrollment';

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

/**
 * Get comprehensive metrics for the enrollment sync system
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Require authentication
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only allow admins to view metrics
  if (token?.userData?.role !== 'SUPERADMIN' && token?.userData?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Unauthorized - Admin access required' });
  }

  try {
    // Get worker metrics
    const workerMetrics = getMetrics();

    // Get queue metrics
    const waiting = await enrollmentQueue.getWaiting();
    const active = await enrollmentQueue.getActive();
    const completed = await enrollmentQueue.getCompleted();
    const failed = await enrollmentQueue.getFailed();
    const delayed = await enrollmentQueue.getDelayed();

    // Get Redis info
    const redisInfo = await redis.info('memory');
    const memoryUsage = redisInfo.match(/used_memory_human:(\S+)/)?.[1] || 'Unknown';

    // Calculate additional metrics
    const totalJobs = completed.length + failed.length + waiting.length + active.length + delayed.length;
    const successRate = totalJobs > 0 ? (workerMetrics.successful / totalJobs) * 100 : 0;
    const failureRate = totalJobs > 0 ? (workerMetrics.failed / totalJobs) * 100 : 0;

    // Get recent failed jobs for debugging
    const recentFailed = failed.slice(0, 10).map(job => ({
      id: job.id,
      name: job.name,
      failedReason: job.failedReason,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
    }));

    // Get recent completed jobs
    const recentCompleted = completed.slice(0, 10).map(job => ({
      id: job.id,
      name: job.name,
      timestamp: job.timestamp,
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      duration: job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : null,
    }));

    const metrics: EnrollmentSyncMetrics & {
      queueMetrics: {
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
        total: number;
      };
      systemMetrics: {
        redisMemoryUsage: string;
        successRate: number;
        failureRate: number;
      };
      recentActivity: {
        failed: any[];
        completed: any[];
      };
    } = {
      ...workerMetrics,
      queueMetrics: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: totalJobs,
      },
      systemMetrics: {
        redisMemoryUsage: memoryUsage,
        successRate: Math.round(successRate * 100) / 100,
        failureRate: Math.round(failureRate * 100) / 100,
      },
      recentActivity: {
        failed: recentFailed,
        completed: recentCompleted,
      },
    };

    return res.status(200).json({
      message: 'Metrics retrieved successfully',
      timestamp: new Date().toISOString(),
      metrics,
    });

  } catch (error: any) {
    console.error('❌ Error getting metrics:', error);
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to retrieve metrics',
      details: error.message,
    });
  }
}

/**
 * POST endpoint to reset metrics
 */
export async function resetMetricsEndpoint(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    resetMetrics();
    
    return res.status(200).json({
      message: 'Metrics reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Error resetting metrics:', error);
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to reset metrics',
    });
  }
}

