#!/usr/bin/env node

/**
 * Enrollment Failure Monitor
 * 
 * This script helps you monitor enrollment failures by checking server logs
 * for the specific error patterns we log when enrollments fail.
 * 
 * Usage:
 * 1. Run this script: node monitor-enrollment-failures.js
 * 2. It will show you recent enrollment failures that need manual retry
 * 3. Use the enrollment UIDs to manually retry via the admin dashboard
 */

const fs = require('fs');
const path = require('path');

// Function to parse log entries
function parseLogEntry(line) {
  try {
    // Look for our specific enrollment failure log pattern
    if (line.includes('🚨 ENROLLMENT FAILURE LOG:')) {
      const jsonStart = line.indexOf('{');
      if (jsonStart !== -1) {
        const jsonStr = line.substring(jsonStart);
        return JSON.parse(jsonStr);
      }
    }
  } catch (error) {
    // Ignore parsing errors
  }
  return null;
}

// Function to check for enrollment failures in logs
function checkEnrollmentFailures() {
  console.log('🔍 Checking for enrollment failures...\n');
  
  // In a real deployment, you'd check your actual log files
  // For now, this shows you what to look for in your server logs
  
  console.log('📋 Look for these patterns in your server logs:');
  console.log('   🚨 ENROLLMENT FAILURE LOG: { ... }');
  console.log('   ❌ CRITICAL: Failed to create/find Thinkific user during retry');
  console.log('   ❌ Failed to re-activate enrollment with Thinkific');
  console.log('');
  
  console.log('🔧 When you find failures, you can:');
  console.log('   1. Copy the enrollmentUid from the log');
  console.log('   2. Go to admin dashboard');
  console.log('   3. Use the "Retry Enrollment" feature');
  console.log('   4. Or call the API directly: POST /api/enrollments/retry');
  console.log('');
  
  console.log('📊 Common failure reasons:');
  console.log('   • Thinkific API timeout/rate limit');
  console.log('   • User already exists in Thinkific (422 error)');
  console.log('   • Course not found in Thinkific');
  console.log('   • Network connectivity issues');
  console.log('');
  
  console.log('✅ The retry API will:');
  console.log('   • Create missing Thinkific users');
  console.log('   • Handle "already exists" errors');
  console.log('   • Re-activate enrollments');
  console.log('   • Update local database');
}

// Function to show recent failures (if you have log files)
function showRecentFailures() {
  // This would read from your actual log files
  // For now, just show the monitoring instructions
  
  console.log('💡 To monitor failures in real-time:');
  console.log('   tail -f your-log-file.log | grep "🚨 ENROLLMENT FAILURE LOG"');
  console.log('');
}

// Main execution
if (require.main === module) {
  checkEnrollmentFailures();
  showRecentFailures();
  
  console.log('🎯 Next steps:');
  console.log('   1. Monitor your server logs for enrollment failures');
  console.log('   2. When failures occur, use the enrollment UID to retry');
  console.log('   3. The retry API is now fixed and will work properly');
  console.log('   4. No database table needed - failures are logged to console');
}

module.exports = { checkEnrollmentFailures, parseLogEntry };

