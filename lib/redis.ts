import { Redis } from 'ioredis';

// Redis connection configuration
console.log('🔍 Redis Environment Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  REDIS_URL: process.env.REDIS_URL ? 'SET' : 'NOT_SET',
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD ? 'SET' : 'NOT_SET',
});

const redisConfig = {
  // Use REDIS_URL if available (for Upstash), otherwise fall back to individual configs
  ...(process.env.REDIS_URL ? {
    url: process.env.REDIS_URL,
  } : {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  }),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  // Add TLS configuration for production Redis
  ...(process.env.NODE_ENV === 'production' && process.env.REDIS_URL ? {
    tls: {},
  } : {}),
};

console.log('🔍 Redis Config Debug:', {
  hasUrl: !!(redisConfig as any).url,
  host: (redisConfig as any).host || 'N/A',
  port: (redisConfig as any).port || 'N/A',
  hasTls: !!(redisConfig as any).tls,
});

// Check if Redis is disabled
const isRedisDisabled = process.env.DISABLE_REDIS === 'true';

// Circuit breaker for Redis failures
let redisFailureCount = 0;
const MAX_REDIS_FAILURES = 5;
let redisCircuitOpen = false;

// Create Redis client instance
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    if (isRedisDisabled || redisCircuitOpen) {
      console.log('🚫 Redis client creation skipped: Redis caching disabled or circuit open.');
      // Return a mock Redis client that doesn't do anything
      redis = new Redis({
        host: 'localhost',
        port: 6379,
        lazyConnect: true,
        maxRetriesPerRequest: 0, // Don't retry
        connectTimeout: 1000,
        commandTimeout: 1000,
      });
      return redis;
    }
    
    try {
      redis = new Redis(redisConfig);
      
      redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
        redisFailureCount = 0; // Reset failure count on successful connection
        redisCircuitOpen = false;
      });
      
      redis.on('error', (error) => {
        console.error('❌ Redis connection error:', error);
        redisFailureCount++;
        
        if (redisFailureCount >= MAX_REDIS_FAILURES) {
          console.log('🚫 Redis circuit breaker opened after', MAX_REDIS_FAILURES, 'failures');
          redisCircuitOpen = true;
        }
        
        // Don't throw the error, just log it
        // This allows the app to continue without Redis
      });
      
      redis.on('close', () => {
        console.log('🔌 Redis connection closed');
      });
      
      redis.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });
    } catch (error) {
      console.error('❌ Failed to create Redis client:', error);
      redisFailureCount++;
      
      if (redisFailureCount >= MAX_REDIS_FAILURES) {
        console.log('🚫 Redis circuit breaker opened after', MAX_REDIS_FAILURES, 'failures');
        redisCircuitOpen = true;
      }
      
      // Return a mock Redis client that doesn't do anything
      // This prevents the app from crashing when Redis is unavailable
      redis = new Redis({
        host: 'localhost',
        port: 6379,
        lazyConnect: true,
        maxRetriesPerRequest: 0, // Don't retry
        connectTimeout: 1000,
        commandTimeout: 1000,
      });
    }
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
  private redis: Redis | null = null;
  private disabled: boolean = false;
  
  constructor() {
    if (!isRedisDisabled && !redisCircuitOpen) {
      this.redis = getRedisClient();
    } else {
      this.disabled = true;
      console.log('🚫 Redis caching disabled via DISABLE_REDIS environment variable or circuit breaker');
    }
  }
  
  /**
   * Get cached data with fallback
   */
  async get<T>(key: string): Promise<T | null> {
    if (this.disabled || !this.redis) {
      return null; // No caching when disabled
    }
    
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
    if (this.disabled || !this.redis) {
      return; // No caching when disabled
    }
    
    try {
      // Convert BigInt to string for JSON serialization
      const serializedData = JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      );
      await this.redis!.setex(key, ttlSeconds, serializedData);
    } catch (error) {
      console.error('❌ Cache set error:', error);
    }
  }
  
  /**
   * Delete cached data
   */
  async del(key: string): Promise<void> {
    if (this.disabled || !this.redis) {
      return; // No caching when disabled
    }
    
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
    if (this.disabled || !this.redis) {
      return; // No caching when disabled
    }
    
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
    if (this.disabled || !this.redis) {
      return; // No caching when disabled
    }
    
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
    if (this.disabled || !this.redis) {
      // If Redis is disabled, just execute fallback without caching
      return await fallback();
    }
    
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
    if (this.disabled || !this.redis) {
      return false;
    }
    
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
    if (this.disabled || !this.redis) {
      return {
        connected: false,
        memory: null,
        keyspace: null,
      };
    }
    
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
