import { NextApiRequest, NextApiResponse } from 'next';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import crypto from 'crypto';
import { revalidateAfterChange } from '../../../lib/cache-revalidator';
import { cacheManager } from '../../../lib/redis';

// Redis connection - use the same config as main app
import { getRedisClient } from '../../../lib/redis';
const redis = getRedisClient();

// BullMQ queue
const enrollmentQueue = new Queue('enrollment-processing', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
});

/**
 * Verify Thinkific webhook signature
 */
function verifyThinkificWebhook(payload: string, signature: string, secret: string): boolean {
  try {
    if (!signature || !secret) {
      console.warn('⚠️ Missing signature or secret for webhook verification');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );

    if (!isValid) {
      console.warn('❌ Invalid webhook signature:', {
        expected: expectedSignature,
        received: signature,
        payloadLength: payload.length
      });
    }

    return isValid;
  } catch (error) {
    console.error('❌ Error verifying webhook signature:', error);
    return false;
  }
}

/**
 * Extract webhook signature from headers
 */
function extractWebhookSignature(headers: any): string | null {
  const signature = headers['x-thinkific-hmac-sha256'] || 
                   headers['X-Thinkific-Hmac-SHA256'] ||
                   headers['X-THINKIFIC-HMAC-SHA256'];
  
  return signature || null;
}

/**
 * Get webhook secret from environment
 */
function getWebhookSecret(): string {
  return process.env.THINKIFIC_WEBHOOK_SECRET || 
         process.env.API_KEY || 
         '';
}

/**
 * Get priority for different event types
 */
function getEventPriority(eventType: string): number {
  switch (eventType) {
    case 'enrollment.completed':
      return 1; // Highest priority
    case 'enrollment.progress':
      return 2; // Medium priority
    case 'enrollment.created':
      return 3; // Lower priority
    default:
      return 5; // Default priority
  }
}

/**
 * Webhook endpoint for receiving Thinkific enrollment events
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are accepted' 
    });
  }

  try {
    console.log('📨 Received webhook request');

    // Get raw body for signature verification
    const rawBody = JSON.stringify(req.body);
    const signature = extractWebhookSignature(req.headers);
    const secret = getWebhookSecret();

    // Verify webhook signature
    if (!verifyThinkificWebhook(rawBody, signature || '', secret)) {
      console.error('❌ Invalid webhook signature');
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid webhook signature' 
      });
    }

    // Parse webhook event
    const webhookEvent = req.body;

    // Validate event structure
    if (!webhookEvent.id || !webhookEvent.type || !webhookEvent.data) {
      console.error('❌ Invalid webhook event structure:', webhookEvent);
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'Invalid webhook event structure' 
      });
    }

    // Validate event type
    const validEventTypes = ['enrollment.created', 'enrollment.progress', 'enrollment.completed'];
    if (!validEventTypes.includes(webhookEvent.type)) {
      console.warn(`⚠️ Unsupported event type: ${webhookEvent.type}`);
      return res.status(200).json({ 
        message: 'Event type not supported, but webhook received successfully' 
      });
    }

    console.log(`🔄 Processing webhook event: ${webhookEvent.type} (${webhookEvent.id})`);

    // Check for duplicate events (idempotency)
    const existingJob = await enrollmentQueue.getJob(webhookEvent.id);
    if (existingJob) {
      console.log(`✅ Event ${webhookEvent.id} already processed, skipping`);
      return res.status(200).json({ 
        message: 'Event already processed',
        eventId: webhookEvent.id 
      });
    }

    // Prepare job data
    const jobData = {
      eventId: webhookEvent.id,
      eventType: webhookEvent.type,
      enrollmentData: webhookEvent.data,
      processedAt: new Date().toISOString(),
      retryCount: 0,
    };

    // Add job to queue
    const job = await enrollmentQueue.add(
      webhookEvent.id, // Use event ID as job ID for deduplication
      jobData,
      {
        jobId: webhookEvent.id, // Ensure idempotency
        priority: getEventPriority(webhookEvent.type),
        delay: 0, // Process immediately
      }
    );

    console.log(`✅ Queued enrollment event: ${webhookEvent.id} (Job: ${job.id})`);

    // Invalidate relevant caches immediately for real-time updates
    try {
      await revalidateAfterChange('enrollment');
      console.log('🔄 Cache invalidated for enrollment webhook');
    } catch (error) {
      console.error('❌ Cache invalidation error:', error);
    }

    // Get queue metrics
    const waiting = await enrollmentQueue.getWaiting();
    const failed = await enrollmentQueue.getFailed();

    return res.status(200).json({
      message: 'Webhook processed successfully',
      eventId: webhookEvent.id,
      eventType: webhookEvent.type,
      jobId: job.id,
      queueStatus: {
        waiting: waiting.length,
        failed: failed.length,
      },
    });

  } catch (error: any) {
    console.error('❌ Webhook processing error:', error);
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process webhook',
      details: error.message,
    });
  }
}

// Export queue for use in other modules
export { enrollmentQueue };