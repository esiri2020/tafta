#!/usr/bin/env node

const { cacheManager } = require('../lib/redis');

/**
 * Clear all cache data
 */
async function clearCache() {
  try {
    console.log('🗑️ Clearing all cache data...');
    
    // Clear all cache patterns
    await cacheManager.delPattern('*');
    
    console.log('✅ Cache cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    process.exit(1);
  }
}

/**
 * Clear specific cache patterns
 */
async function clearCachePattern(pattern) {
  try {
    console.log(`🗑️ Clearing cache pattern: ${pattern}`);
    
    await cacheManager.delPattern(pattern);
    
    console.log(`✅ Cache pattern ${pattern} cleared successfully`);
  } catch (error) {
    console.error('❌ Error clearing cache pattern:', error);
    process.exit(1);
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'all':
      await clearCache();
      break;
    case 'enrollments':
      await clearCachePattern('enrollments:*');
      break;
    case 'applicants':
      await clearCachePattern('applicants:*');
      break;
    case 'statistics':
      await clearCachePattern('statistics:*');
      break;
    case 'dashboard':
      await clearCachePattern('dashboard:*');
      break;
    case 'pattern':
      if (args[1]) {
        await clearCachePattern(args[1]);
      } else {
        console.error('❌ Pattern required for clear pattern command');
        process.exit(1);
      }
      break;
    default:
      console.log('Usage: node clear-cache.js [command]');
      console.log('Commands:');
      console.log('  all          - Clear all cache data');
      console.log('  enrollments  - Clear enrollment cache');
      console.log('  applicants   - Clear applicant cache');
      console.log('  statistics   - Clear statistics cache');
      console.log('  dashboard    - Clear dashboard cache');
      console.log('  pattern <pattern> - Clear specific pattern');
      process.exit(1);
  }
  
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  clearCache,
  clearCachePattern
};
