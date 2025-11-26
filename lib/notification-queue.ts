import { Queue } from 'bullmq';
import { getRedisClient } from './redis';

// Create Redis connection
const redis = getRedisClient();

// Create BullMQ queue for notification emails
export const notificationEmailQueue = new Queue('notification-emails', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000, // Keep last 1000 completed jobs
    },
    removeOnFail: {
      age: 24 * 3600, // Keep failed jobs for 24 hours
    },
    attempts: 3, // Retry failed jobs 3 times
    backoff: {
      type: 'exponential',
      delay: 2000, // Start with 2 second delay
    },
  },
});

