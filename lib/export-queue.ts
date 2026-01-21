import { Queue } from 'bullmq';
import { getRedisClient } from './redis';

// Create Redis connection
const redis = getRedisClient();

// Create BullMQ queue for export jobs
export const exportQueue = new Queue('applicant-exports', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 100, // Keep last 100 completed jobs
    },
    removeOnFail: {
      age: 24 * 3600, // Keep failed jobs for 24 hours
    },
    attempts: 1, // Don't retry exports (they're expensive)
  },
});

