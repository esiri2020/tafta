import { cacheManager } from './redis';

/**
 * Rate limiting utility using Redis
 */
export class RateLimiter {
  private redis = cacheManager;
  
  /**
   * Check if request is within rate limit
   */
  async checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    try {
      const now = Date.now();
      const window = Math.floor(now / windowMs);
      const rateLimitKey = `rate_limit:${key}:${window}`;
      
      // Get current count
      const current = await this.redis.get<number>(rateLimitKey) || 0;
      
      if (current >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: (window + 1) * windowMs,
        };
      }
      
      // Increment counter
      await this.redis.set(rateLimitKey, current + 1, windowMs / 1000);
      
      return {
        allowed: true,
        remaining: limit - current - 1,
        resetTime: (window + 1) * windowMs,
      };
    } catch (error) {
      console.error('❌ Rate limit check error:', error);
      // If Redis fails, allow the request
      return {
        allowed: true,
        remaining: limit,
        resetTime: Date.now() + windowMs,
      };
    }
  }
  
  /**
   * Rate limit for API endpoints
   */
  async limitApiRequest(
    endpoint: string,
    identifier: string,
    limit: number = 100,
    windowMs: number = 60000
  ): Promise<boolean> {
    const key = `api:${endpoint}:${identifier}`;
    const result = await this.checkRateLimit(key, limit, windowMs);
    
    if (!result.allowed) {
      console.warn(`⚠️ Rate limit exceeded for ${endpoint}:${identifier}`);
    }
    
    return result.allowed;
  }
  
  /**
   * Rate limit for cache operations
   */
  async limitCacheOperation(
    operation: string,
    identifier: string,
    limit: number = 50,
    windowMs: number = 60000
  ): Promise<boolean> {
    const key = `cache:${operation}:${identifier}`;
    const result = await this.checkRateLimit(key, limit, windowMs);
    
    if (!result.allowed) {
      console.warn(`⚠️ Cache rate limit exceeded for ${operation}:${identifier}`);
    }
    
    return result.allowed;
  }
  
  /**
   * Rate limit for database queries
   */
  async limitDbQuery(
    queryType: string,
    identifier: string,
    limit: number = 200,
    windowMs: number = 60000
  ): Promise<boolean> {
    const key = `db:${queryType}:${identifier}`;
    const result = await this.checkRateLimit(key, limit, windowMs);
    
    if (!result.allowed) {
      console.warn(`⚠️ DB rate limit exceeded for ${queryType}:${identifier}`);
    }
    
    return result.allowed;
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Middleware for rate limiting API requests
 */
export function withRateLimit(
  endpoint: string,
  limit: number = 100,
  windowMs: number = 60000
) {
  return async function rateLimitMiddleware(
    req: any,
    res: any,
    next: any
  ): Promise<void> {
    try {
      // Get identifier (IP address or user ID)
      const identifier = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
      
      const allowed = await rateLimiter.limitApiRequest(
        endpoint,
        identifier,
        limit,
        windowMs
      );
      
      if (!allowed) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          message: 'Too many requests, please try again later',
        });
        return;
      }
      
      next();
    } catch (error) {
      console.error('❌ Rate limit middleware error:', error);
      // If rate limiting fails, allow the request
      next();
    }
  };
}
