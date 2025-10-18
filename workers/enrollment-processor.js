const { Worker, Job, Queue } = require('bullmq');
const { Redis } = require('ioredis');
const prisma = require('../lib/prismadb').default;

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

// Metrics tracking
let metrics = {
  totalProcessed: 0,
  successful: 0,
  failed: 0,
  retries: 0,
  averageLatency: 0,
  queueSize: 0,
  dlqSize: 0,
  lastProcessedAt: new Date().toISOString()
};

// Worker configuration
const workerConfig = {
  connection: redis,
  concurrency: 5, // Process up to 5 jobs concurrently
  removeOnComplete: 100, // Keep last 100 completed jobs
  removeOnFail: 50, // Keep last 50 failed jobs
  attempts: 3, // Retry failed jobs up to 3 times
  backoff: {
    type: 'exponential',
    delay: 2000, // Start with 2 second delay
  },
};

/**
 * Process enrollment event from webhook or poller
 */
async function processEnrollmentEvent(job) {
  const startTime = Date.now();
  const { eventId, eventType, enrollmentData } = job.data;

  console.log(`🔄 Processing enrollment event: ${eventId} (${eventType})`);

  try {
    // Check if enrollment already exists and is completed
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        id: enrollmentData.id ? BigInt(enrollmentData.id) : undefined,
        course_id: BigInt(enrollmentData.course_id),
        user_id: enrollmentData.user_id ? BigInt(enrollmentData.user_id) : undefined,
      },
    });

    // Stop processing if enrollment is already completed
    if (existingEnrollment?.completed) {
      console.log(`✅ Enrollment ${enrollmentData.id} already completed, skipping`);
      metrics.successful++;
      return { status: 'skipped', reason: 'already_completed' };
    }

    // Prepare update data
    const updateData = {
      course_id: enrollmentData.course_id,
      enrolled: true,
      updated_at: new Date(),
    };

    // Map Thinkific fields to our database fields
    if (enrollmentData.id) updateData.id = enrollmentData.id;
    if (enrollmentData.user_id) updateData.user_id = enrollmentData.user_id;
    if (enrollmentData.activated_at) updateData.activated_at = new Date(enrollmentData.activated_at);
    if (enrollmentData.completed_at) updateData.completed_at = new Date(enrollmentData.completed_at);
    if (enrollmentData.started_at) updateData.started_at = new Date(enrollmentData.started_at);
    if (enrollmentData.expiry_date) updateData.expiry_date = new Date(enrollmentData.expiry_date);
    if (enrollmentData.percentage_completed !== undefined) updateData.percentage_completed = enrollmentData.percentage_completed;
    if (enrollmentData.is_free_trial !== undefined) updateData.is_free_trial = enrollmentData.is_free_trial;
    if (enrollmentData.completed !== undefined) updateData.completed = enrollmentData.completed;
    if (enrollmentData.expired !== undefined) updateData.expired = enrollmentData.expired;

    // Perform idempotent upsert
    const result = await prisma.enrollment.upsert({
      where: {
        id: enrollmentData.id ? BigInt(enrollmentData.id) : undefined,
        course_id: BigInt(enrollmentData.course_id),
      },
      update: updateData,
      create: {
        ...updateData,
        course_name: `Course ${enrollmentData.course_id}`, // Fallback name
        userCohortId: 'temp', // This should be resolved from user lookup
      },
    });

    // Update metrics
    const processingTime = Date.now() - startTime;
    metrics.totalProcessed++;
    metrics.successful++;
    metrics.averageLatency = (metrics.averageLatency + processingTime) / 2;
    metrics.lastProcessedAt = new Date().toISOString();

    console.log(`✅ Successfully processed enrollment ${enrollmentData.id} in ${processingTime}ms`);

    return {
      status: 'success',
      enrollmentId: result.uid,
      processingTime,
      eventType,
    };

  } catch (error) {
    console.error(`❌ Error processing enrollment event ${eventId}:`, error);
    
    metrics.totalProcessed++;
    metrics.failed++;

    // Check if it's a retryable error
    const isRetryable = error.code === 'P2002' || // Unique constraint violation
                       error.code === 'P2025' || // Record not found
                       error.message.includes('timeout') ||
                       error.message.includes('connection');

    if (isRetryable) {
      metrics.retries++;
      throw error; // Let BullMQ handle retry
    }

    // Non-retryable error - log and continue
    console.error(`💥 Non-retryable error for enrollment ${enrollmentData.id}:`, error.message);
    
    return {
      status: 'failed',
      error: error.message,
      eventType,
      retryable: false,
    };
  }
}

/**
 * Create and start the enrollment worker
 */
function createEnrollmentWorker() {
  const worker = new Worker(
    'enrollment-processing',
    processEnrollmentEvent,
    workerConfig
  );

  // Event handlers
  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
    updateQueueMetrics();
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
    updateQueueMetrics();
  });

  worker.on('error', (err) => {
    console.error('💥 Worker error:', err);
  });

  worker.on('stalled', (jobId) => {
    console.warn(`⚠️ Job ${jobId} stalled`);
  });

  return worker;
}

/**
 * Update queue metrics
 */
async function updateQueueMetrics() {
  try {
    const waiting = await enrollmentQueue.getWaiting();
    const failed = await enrollmentQueue.getFailed();
    
    metrics.queueSize = waiting.length;
    metrics.dlqSize = failed.length;
  } catch (error) {
    console.error('❌ Error updating queue metrics:', error);
  }
}

/**
 * Get current metrics
 */
function getMetrics() {
  return { ...metrics };
}

/**
 * Reset metrics
 */
function resetMetrics() {
  metrics = {
    totalProcessed: 0,
    successful: 0,
    failed: 0,
    retries: 0,
    averageLatency: 0,
    queueSize: 0,
    dlqSize: 0,
    lastProcessedAt: new Date().toISOString()
  };
}

// Create and export worker instance
const worker = createEnrollmentWorker();

module.exports = {
  worker,
  redis,
  enrollmentQueue,
  getMetrics,
  resetMetrics
};
