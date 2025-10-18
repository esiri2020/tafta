#!/usr/bin/env node

const { cacheManager } = require('../lib/redis');

/**
 * Get cache statistics
 */
async function getCacheStats() {
  try {
    console.log('📊 Cache Statistics');
    console.log('==================');
    
    // Check Redis connection
    const connected = await cacheManager.isConnected();
    console.log(`Redis Connected: ${connected ? '✅' : '❌'}`);
    
    if (!connected) {
      console.log('❌ Redis is not connected. Please check your Redis configuration.');
      return;
    }
    
    // Get detailed stats
    const stats = await cacheManager.getStats();
    
    console.log(`Memory Usage: ${stats.memory ? `${Math.round(stats.memory / 1024 / 1024)}MB` : 'N/A'}`);
    console.log(`Keyspace: ${stats.keyspace ? 'Available' : 'N/A'}`);
    
    // Get key counts by pattern
    const patterns = [
      'enrollments:*',
      'applicants:*',
      'statistics:*',
      'dashboard:*',
      'user:*',
      'rate_limit:*',
      'prisma:*'
    ];
    
    console.log('\n📈 Cache Key Counts:');
    console.log('====================');
    
    for (const pattern of patterns) {
      try {
        const keys = await cacheManager.redis.keys(pattern);
        console.log(`${pattern}: ${keys.length} keys`);
      } catch (error) {
        console.log(`${pattern}: Error getting count`);
      }
    }
    
    // Get total key count
    try {
      const allKeys = await cacheManager.redis.keys('*');
      console.log(`\nTotal Keys: ${allKeys.length}`);
    } catch (error) {
      console.log('\nTotal Keys: Error getting count');
    }
    
    // Get Redis info
    try {
      const info = await cacheManager.redis.info('memory');
      const memoryMatch = info.match(/used_memory_human:([^\r\n]+)/);
      if (memoryMatch) {
        console.log(`Used Memory: ${memoryMatch[1]}`);
      }
      
      const peakMatch = info.match(/used_memory_peak_human:([^\r\n]+)/);
      if (peakMatch) {
        console.log(`Peak Memory: ${peakMatch[1]}`);
      }
    } catch (error) {
      console.log('Memory Info: Error getting memory info');
    }
    
  } catch (error) {
    console.error('❌ Error getting cache stats:', error);
    process.exit(1);
  }
}

/**
 * Get cache health status
 */
async function getCacheHealth() {
  try {
    console.log('🏥 Cache Health Check');
    console.log('====================');
    
    const connected = await cacheManager.isConnected();
    console.log(`Redis Connection: ${connected ? '✅ Healthy' : '❌ Unhealthy'}`);
    
    if (connected) {
      try {
        await cacheManager.redis.ping();
        console.log('Redis Ping: ✅ Healthy');
      } catch (error) {
        console.log('Redis Ping: ❌ Unhealthy');
      }
      
      try {
        const stats = await cacheManager.getStats();
        if (stats.memory) {
          console.log('Memory Usage: ✅ Available');
        } else {
          console.log('Memory Usage: ⚠️ Limited');
        }
      } catch (error) {
        console.log('Memory Usage: ❌ Error');
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking cache health:', error);
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'stats';
  
  switch (command) {
    case 'stats':
      await getCacheStats();
      break;
    case 'health':
      await getCacheHealth();
      break;
    default:
      console.log('Usage: node cache-stats.js [command]');
      console.log('Commands:');
      console.log('  stats  - Get detailed cache statistics (default)');
      console.log('  health - Get cache health status');
      process.exit(1);
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  getCacheStats,
  getCacheHealth
};
