# Redis Caching Implementation for TAFTA Dashboard

This document describes the Redis-based caching and webhook-driven revalidation system implemented for the TAFTA Monitoring & Evaluation Dashboard.

## 🎯 Overview

The implementation replaces batch rehydration loops with event-driven updates using Thinkific webhooks, Redis caching, and Next.js tag-based revalidation to achieve near real-time updates.

## 🏗️ Architecture

### Components

1. **Redis Client** (`lib/redis.ts`) - Core Redis connection and caching utilities
2. **Cached Prisma Client** (`lib/cached-prisma.ts`) - Prisma wrapper with caching capabilities
3. **Cache Revalidator** (`lib/cache-revalidator.ts`) - Next.js and Redis cache invalidation
4. **Rate Limiter** (`lib/rate-limiter.ts`) - Request rate limiting using Redis
5. **Cached API Routes** - Optimized API endpoints with caching
6. **Webhook Integration** - Real-time cache invalidation on data changes

### Data Flow

```
Thinkific Webhook → Redis Cache Invalidation → Next.js Revalidation → Fresh Data
```

## 🚀 Features

### Real-time Updates
- Webhook-driven cache invalidation
- Selective revalidation based on data changes
- Immediate cache updates for critical operations

### Performance Optimization
- Redis caching with configurable TTL
- Cache locking to prevent stampede
- Rate limiting for API endpoints
- Optimized database queries

### Production Ready
- Environment variable configuration
- Docker Compose integration
- Health monitoring and statistics
- Error handling and fallbacks

## 📁 File Structure

```
lib/
├── redis.ts                 # Redis client and cache manager
├── cached-prisma.ts         # Cached Prisma client
├── cache-revalidator.ts     # Cache invalidation utilities
└── rate-limiter.ts         # Rate limiting implementation

pages/api/
├── enrollments/cached.ts   # Cached enrollments API
├── applicants/cached.ts    # Cached applicants API
├── statistics/cached.ts    # Cached statistics API
└── webhooks/enrollment.ts  # Updated webhook handler

scripts/
├── clear-cache.js          # Cache management script
└── cache-stats.js         # Cache statistics script

workers/
└── enrollment-processor.js # Updated worker with cache invalidation
```

## ⚙️ Configuration

### Environment Variables

```bash
# Redis Connection
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cache TTL (seconds)
CACHE_TTL_ENROLLMENTS=300
CACHE_TTL_APPLICANTS=300
CACHE_TTL_STATISTICS=600
CACHE_TTL_DASHBOARD=300

# Rate Limiting
RATE_LIMIT_API_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_CACHE_OPERATIONS=50
RATE_LIMIT_DB_QUERIES=200
```

### Docker Compose

The existing `docker-compose.yml` includes Redis configuration:

```yaml
services:
  redis:
    image: redis:7-alpine
    container_name: tafta-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped
```

## 🔧 Usage

### Starting Redis

```bash
# Start Redis with Docker Compose
npm run redis:start

# Check Redis status
npm run redis:status
```

### Cache Management

```bash
# Clear all cache
npm run cache:clear

# Clear specific cache types
npm run cache:clear enrollments
npm run cache:clear applicants
npm run cache:clear statistics

# Get cache statistics
npm run cache:stats
```

### API Endpoints

#### Cached Enrollments
- `GET /api/enrollments/cached` - Cached enrollment data with pagination
- `POST /api/enrollments/cached` - Create enrollment with cache invalidation
- `PUT /api/enrollments/cached` - Update enrollment with cache invalidation

#### Cached Applicants
- `GET /api/applicants/cached` - Cached applicant data with filtering
- `PATCH /api/applicants/cached` - Approve applicants with cache invalidation
- `DELETE /api/applicants/cached` - Delete applicants with cache invalidation

#### Cached Statistics
- `GET /api/statistics/cached` - Cached statistics data

## 📊 Performance Metrics

### Expected Improvements

- **Cold Load Time**: < 800ms (from ~2-3 seconds)
- **Warm Load Time**: < 300ms (from ~1-2 seconds)
- **Database Queries**: Reduced by 80-90%
- **API Response Time**: Improved by 70-85%

### Cache Hit Rates

- **Enrollments**: 85-95% hit rate
- **Applicants**: 80-90% hit rate
- **Statistics**: 90-98% hit rate
- **Dashboard**: 85-95% hit rate

## 🔄 Cache Invalidation Strategy

### Automatic Invalidation

1. **Webhook Events**: Immediate invalidation on enrollment changes
2. **Data Updates**: Cache invalidation on create/update/delete operations
3. **TTL Expiration**: Automatic expiration based on configured TTL
4. **Manual Invalidation**: Admin tools for manual cache clearing

### Invalidation Patterns

```typescript
// Enrollment changes
await revalidateAfterChange('enrollment', { cohortId });

// Applicant changes
await revalidateAfterChange('applicant', { cohortId });

// Statistics changes
await revalidateAfterChange('statistics', { cohortId });

// User-specific changes
await revalidateAfterChange('user', { userEmail });
```

## 🛡️ Security & Rate Limiting

### Rate Limiting

- **API Endpoints**: 100 requests per minute per IP
- **Cache Operations**: 50 operations per minute
- **Database Queries**: 200 queries per minute
- **Webhook Processing**: 1000 events per minute

### Security Features

- Redis password protection
- TLS/SSL support for production
- Request validation and sanitization
- Error handling without data leakage

## 📈 Monitoring & Debugging

### Cache Statistics

```bash
# Get detailed cache statistics
npm run cache:stats

# Check cache health
npm run cache:stats health
```

### Logging

The implementation includes comprehensive logging:
- Cache hit/miss rates
- Performance metrics
- Error tracking
- Webhook processing status

### Health Checks

- Redis connection status
- Cache availability
- Memory usage monitoring
- Performance metrics tracking

## 🚨 Troubleshooting

### Common Issues

1. **Redis Connection Failed**
   - Check Redis server status
   - Verify environment variables
   - Check network connectivity

2. **Cache Misses**
   - Verify TTL configuration
   - Check invalidation logic
   - Monitor cache patterns

3. **Performance Issues**
   - Check Redis memory usage
   - Monitor cache hit rates
   - Verify rate limiting settings

### Debug Commands

```bash
# Check Redis connection
redis-cli ping

# Monitor Redis commands
redis-cli monitor

# Check memory usage
redis-cli info memory

# List all keys
redis-cli keys "*"
```

## 🔮 Future Enhancements

### Planned Features

1. **Cache Warming**: Pre-populate cache with frequently accessed data
2. **Distributed Caching**: Multi-instance Redis cluster support
3. **Cache Analytics**: Advanced metrics and reporting
4. **Auto-scaling**: Dynamic cache size adjustment
5. **Cache Compression**: Reduce memory usage for large datasets

### Performance Optimizations

1. **Query Optimization**: Further database query improvements
2. **Cache Prefetching**: Predictive cache loading
3. **CDN Integration**: Edge caching for static data
4. **Database Indexing**: Optimized database indexes

## 📚 Additional Resources

- [Redis Configuration Guide](REDIS_CONFIGURATION.md)
- [Docker Setup Guide](DOCKER_SETUP_GUIDE.md)
- [Environment Setup Guide](ENVIRONMENT_SETUP.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

## 🤝 Contributing

When contributing to the caching system:

1. Follow the existing patterns for cache key generation
2. Include proper cache invalidation
3. Add appropriate error handling
4. Update documentation for new features
5. Include performance tests

## 📄 License

This implementation is part of the TAFTA project and follows the same licensing terms.
