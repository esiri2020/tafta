#!/usr/bin/env node

/**
 * Automatic Enrollment Retry Scheduler
 * 
 * This script can be run as a cron job to automatically retry failed enrollments
 * without manual intervention. It finds failed enrollments and retries them.
 * 
 * Usage:
 * 1. Run manually: node auto-retry-scheduler.js
 * 2. Set up as cron job: */5 * * * * node /path/to/auto-retry-scheduler.js
 * 3. Monitor logs for automatic retry results
 */

const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  apiUrl: process.env.API_URL || 'https://reg.terraacademyforarts.com',
  retryInterval: 5 * 60 * 1000, // 5 minutes
  maxRetriesPerRun: 20, // Don't overwhelm the system
  adminEmail: process.env.ADMIN_EMAIL || 'admin@terraacademyforarts.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'your-admin-password'
};

// Function to make authenticated API calls
async function makeAuthenticatedRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${CONFIG.apiUrl}${endpoint}`);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Auto-Retry-Scheduler/1.0'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }

    const req = client.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsedData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Function to get authentication token
async function getAuthToken() {
  try {
    // This would need to be implemented based on your auth system
    // For now, we'll assume you have a way to get an admin token
    console.log('🔐 Getting authentication token...');
    
    // You might need to implement this based on your auth system
    // For example, if you have a service account or API key
    return process.env.ADMIN_TOKEN || 'your-admin-token';
    
  } catch (error) {
    console.error('❌ Failed to get auth token:', error.message);
    throw error;
  }
}

// Function to run automatic retry
async function runAutomaticRetry() {
  try {
    console.log(`🔄 Starting automatic enrollment retry at ${new Date().toISOString()}`);
    
    const token = await getAuthToken();
    
    // Call the auto-retry API
    const response = await makeAuthenticatedRequest('/api/enrollments/auto-retry', 'POST');
    
    if (response.status === 200) {
      const result = response.data;
      console.log('✅ Automatic retry completed successfully');
      console.log(`📊 Processed: ${result.processed}, Successful: ${result.successful}, Failed: ${result.failed}`);
      
      if (result.failed > 0) {
        console.log('⚠️ Some enrollments still failed and may need manual intervention');
        console.log('📋 Failed enrollments:', result.results?.filter(r => r.status === 'failed'));
      }
      
      return result;
    } else {
      console.error('❌ Automatic retry failed:', response.data);
      throw new Error(`API returned status ${response.status}`);
    }
    
  } catch (error) {
    console.error('💥 Automatic retry process failed:', error.message);
    throw error;
  }
}

// Function to run continuously
async function runScheduler() {
  console.log('🚀 Starting Automatic Enrollment Retry Scheduler');
  console.log(`⏰ Retry interval: ${CONFIG.retryInterval / 1000} seconds`);
  console.log(`🎯 Max retries per run: ${CONFIG.maxRetriesPerRun}`);
  
  while (true) {
    try {
      await runAutomaticRetry();
    } catch (error) {
      console.error('💥 Scheduler error:', error.message);
    }
    
    console.log(`⏳ Waiting ${CONFIG.retryInterval / 1000} seconds until next retry...`);
    await new Promise(resolve => setTimeout(resolve, CONFIG.retryInterval));
  }
}

// Function to run once (for cron jobs)
async function runOnce() {
  try {
    console.log('🔄 Running one-time automatic retry...');
    const result = await runAutomaticRetry();
    console.log('✅ One-time retry completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ One-time retry failed:', error.message);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--once')) {
    runOnce();
  } else if (args.includes('--continuous')) {
    runScheduler();
  } else {
    console.log('Usage:');
    console.log('  node auto-retry-scheduler.js --once        # Run once and exit');
    console.log('  node auto-retry-scheduler.js --continuous # Run continuously');
    console.log('');
    console.log('For cron jobs, use:');
    console.log('  */5 * * * * node /path/to/auto-retry-scheduler.js --once');
    process.exit(1);
  }
}

module.exports = { runAutomaticRetry, runScheduler, runOnce };

