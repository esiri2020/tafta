#!/usr/bin/env node

/**
 * Notification Email Worker Startup Script
 * 
 * This script starts the BullMQ worker for processing notification emails.
 * It should be run as a separate process or service.
 * 
 * Usage:
 *   node workers/start-notification-worker.js
 *   npm run worker:notifications
 */

const { notificationEmailWorker } = require('./notification-email-processor.js');

console.log('🚀 Starting Notification Email Worker...');

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  
  try {
    await notificationEmailWorker.close();
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
    await notificationEmailWorker.close();
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

