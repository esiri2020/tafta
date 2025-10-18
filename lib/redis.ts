import { Redis } from 'ioredis';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create Redis client instance
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(redisConfig);
    
    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });
    
    redis.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });
    
    redis.on('close', () => {
      console.log('🔌 Redis connection closed');
    });
  }
  
  return redis;
}

// Cache key generators
export const CacheKeys = {
  // Enrollment cache keys
  enrollments: (params: Record<string, any>) => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    return `enrollments:${JSON.stringify(sortedParams)}`;
  },
  
  // Applicant cache keys
  applicants: (params: Record<string, any>) => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {} as Record<string, any>);
    return `applicants:${JSON.stringify(sortedParams)}`;
  },
  
  // Statistics cache keys
  statistics: (cohortId?: string) => `statistics:${cohortId || 'all'}`,
  
  // Dashboard cache keys
  dashboard: (cohortId?: string) => `dashboard:${cohortId || 'all'}`,
  
  // User-specific cache keys
  userEnrollments: (email: string) => `user:enrollments:${email}`,
  
  // Cache invalidation tags
  tags: {
    enrollments: 'enrollments',
    applicants: 'applicants',
    statistics: 'statistics',
    dashboard: 'dashboard',
    users: 'users',
  }
};

// Cache helper functions
export class CacheManager {
  private redis: Redis;
  
  constructor() {
    this.redis = getRedisClient();
  }
  
  /**
   * Get cached data with fallback
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      console.error('❌ Cache get error:', error);
      return null;
    }
  }
  
  /**
   * Set cached data with TTL
   */
  async set(key: string, data: any, ttlSeconds: number = 300): Promise<void> {
    try {
      await this.redis.setex(key, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      console.error('❌ Cache set error:', error);
    }
  }
  
  /**
   * Delete cached data
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('❌ Cache delete error:', error);
    }
  }
  
  /**
   * Delete multiple keys by pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('❌ Cache pattern delete error:', error);
    }
  }
  
  /**
   * Invalidate cache by tag
   */
  async invalidateByTag(tag: string): Promise<void> {
    try {
      const pattern = `*${tag}*`;
      await this.delPattern(pattern);
      console.log(`🗑️ Invalidated cache for tag: ${tag}`);
    } catch (error) {
      console.error('❌ Cache invalidation error:', error);
    }
  }
  
  /**
   * Get or set cached data with automatic fallback
   */
  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
      
      // Cache miss - execute fallback function
      const data = await fallback();
      
      // Cache the result
      await this.set(key, data, ttlSeconds);
      
      return data;
    } catch (error) {
      console.error('❌ Cache getOrSet error:', error);
      // If caching fails, still return the fallback result
      return await fallback();
    }
  }
  
  /**
   * Cache with lock to prevent cache stampede
   */
  async getOrSetWithLock<T>(
    key: string,
    fallback: () => Promise<T>,
    ttlSeconds: number = 300,
    lockTtlSeconds: number = 30
  ): Promise<T> {
    const lockKey = `${key}:lock`;
    
    try {
      // Try to acquire lock
      const lockAcquired = await this.redis.set(lockKey, '1', 'EX', lockTtlSeconds, 'NX');
      
      if (lockAcquired) {
        // We got the lock, execute fallback and cache result
        try {
          const data = await fallback();
          await this.set(key, data, ttlSeconds);
          return data;
        } finally {
          // Always release the lock
          await this.redis.del(lockKey);
        }
      } else {
        // Lock not acquired, wait and retry
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.getOrSetWithLock(key, fallback, ttlSeconds, lockTtlSeconds);
      }
    } catch (error) {
      console.error('❌ Cache lock error:', error);
      // If locking fails, fall back to regular getOrSet
      return this.getOrSet(key, fallback, ttlSeconds);
    }
  }
  
  /**
   * Check if Redis is connected
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get cache statistics
   */
  async getStats(): Promise<{
    connected: boolean;
    memory: any;
    keyspace: any;
  }> {
    try {
      const connected = await this.isConnected();
      const memoryInfo = await this.redis.info('memory');
      const keyspaceInfo = await this.redis.info('keyspace');
      
      // Parse memory usage from info string
      const memoryMatch = memoryInfo.match(/used_memory:(\d+)/);
      const memory = memoryMatch ? parseInt(memoryMatch[1]) : null;
      
      return {
        connected,
        memory,
        keyspace: keyspaceInfo,
      };
    } catch (error) {
      console.error('❌ Cache stats error:', error);
      return {
        connected: false,
        memory: null,
        keyspace: null,
      };
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Export Redis client for direct use if needed
export { redis };
