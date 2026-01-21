#!/usr/bin/env node

/**
 * Export Worker Startup Script
 * 
 * This script starts the BullMQ worker for processing applicant export jobs.
 * It should be run as a separate process or service.
 * 
 * Usage:
 *   node workers/start-export-worker.js
 *   npm run worker:export
 */

const { exportWorker } = require('./export-processor.js');

console.log('🚀 Starting Export Worker...');

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing worker gracefully...');
  await exportWorker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, closing worker gracefully...');
  await exportWorker.close();
  process.exit(0);
});

// Log worker status
console.log('✅ Export Worker started successfully');
console.log('📊 Worker configuration:', {
  concurrency: 1,
  queue: 'applicant-exports',
});

// Keep the process alive
setInterval(() => {
  // Heartbeat to keep process alive
}, 60000);
