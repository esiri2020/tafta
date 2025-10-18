#!/usr/bin/env node

/**
 * Enrollment Worker Startup Script
 * 
 * This script starts the BullMQ worker for processing enrollment events.
 * It should be run as a separate process or service.
 * 
 * Usage:
 *   node workers/start-enrollment-worker.js
 *   npm run worker:enrollment
 */

const { worker } = require('./enrollment-processor.js');

console.log('🚀 Starting Enrollment Worker...');

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  
  try {
    await worker.close();
    console.log('✅ Worker closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing worker:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  
  try {
    await worker.close();
    console.log('✅ Worker closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error closing worker:', error);
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Log worker status
console.log('✅ Enrollment Worker started successfully');
console.log('📊 Worker configuration:', {
  concurrency: 5,
  removeOnComplete: 100,
  removeOnFail: 50,
  attempts: 3,
});

// Keep the process alive
setInterval(() => {
  // Log worker health every 5 minutes
  console.log('💓 Worker heartbeat:', new Date().toISOString());
}, 5 * 60 * 1000);

