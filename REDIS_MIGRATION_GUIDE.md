# Migration Guide: Transitioning to Redis Caching

This guide helps you migrate from the existing batch rehydration system to the new Redis-based caching and webhook-driven revalidation system.

## 🎯 Migration Overview

The migration involves:
1. Setting up Redis infrastructure
2. Updating environment variables
3. Deploying new cached API routes
4. Configuring webhook endpoints
5. Monitoring and validation

## 📋 Pre-Migration Checklist

### Infrastructure Requirements
- [ ] Redis server (local or cloud)
- [ ] Docker Compose setup (if using local Redis)
- [ ] Environment variables configured
- [ ] Webhook endpoints accessible
- [ ] Monitoring tools ready

### Code Requirements
- [ ] New cached API routes deployed
- [ ] Webhook handlers updated
- [ ] Worker processes updated
- [ ] Cache management scripts available

## 🚀 Step-by-Step Migration

### Step 1: Infrastructure Setup

#### Local Development
```bash
# Start Redis with Docker Compose
docker-compose up redis -d

# Verify Redis is running
redis-cli ping
```

#### Production Setup
1. Set up Redis server (AWS ElastiCache, Redis Cloud, etc.)
2. Configure security groups and access
3. Set up monitoring and backups
4. Test connectivity from your application

### Step 2: Environment Configuration

#### Update Environment Variables
```bash
# Add to your .env file
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cache TTL settings
CACHE_TTL_ENROLLMENTS=300
CACHE_TTL_APPLICANTS=300
CACHE_TTL_STATISTICS=600
CACHE_TTL_DASHBOARD=300

# Rate limiting
RATE_LIMIT_API_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

#### Production Environment
```bash
# Production Redis settings
REDIS_HOST=your-production-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-secure-password

# Production cache settings (longer TTL)
CACHE_TTL_ENROLLMENTS=600
CACHE_TTL_APPLICANTS=600
CACHE_TTL_STATISTICS=1200
CACHE_TTL_DASHBOARD=600
```

### Step 3: Deploy New API Routes

#### Gradual Rollout Strategy
1. Deploy cached routes alongside existing routes
2. Test cached routes in staging environment
3. Gradually migrate traffic to cached routes
4. Monitor performance and error rates

#### Route Mapping
```
Old Route → New Cached Route
/api/enrollments → /api/enrollments/cached
/api/applicants → /api/applicants/cached
/api/statistics → /api/statistics/cached
```

### Step 4: Webhook Configuration

#### Update Thinkific Webhook Settings
1. Point webhook URL to your new endpoint
2. Configure webhook events:
   - `enrollment.created`
   - `enrollment.progress`
   - `enrollment.completed`
3. Set webhook secret for security
4. Test webhook delivery

#### Webhook Endpoint
```
POST /api/webhooks/enrollment
```

### Step 5: Worker Process Updates

#### Update Enrollment Worker
```bash
# Stop existing worker
pm2 stop enrollment-worker

# Start updated worker
npm run worker:enrollment
```

#### Monitor Worker Performance
```bash
# Check worker metrics
npm run cache:stats
```

### Step 6: Frontend Updates

#### Update API Calls
```typescript
// Old API calls
const enrollments = await fetch('/api/enrollments');

// New cached API calls
const enrollments = await fetch('/api/enrollments/cached');
```

#### Add Cache Headers
```typescript
// Add cache control headers
const response = await fetch('/api/enrollments/cached', {
  headers: {
    'Cache-Control': 'max-age=300',
  },
});
```

## 🔄 Migration Strategies

### Strategy 1: Blue-Green Deployment

1. **Blue Environment**: Current system
2. **Green Environment**: New cached system
3. **Switch**: Gradual traffic migration
4. **Rollback**: Instant switch back if issues

### Strategy 2: Canary Deployment

1. **5% Traffic**: Route to cached system
2. **Monitor**: Performance and error rates
3. **Increase**: Gradually increase traffic
4. **Complete**: Full migration when stable

### Strategy 3: Feature Flags

1. **Feature Flag**: Control cached vs. non-cached
2. **A/B Testing**: Compare performance
3. **Gradual Rollout**: Increase cached traffic
4. **Full Migration**: Remove feature flag

## 📊 Performance Validation

### Key Metrics to Monitor

#### Response Times
- **Cold Load**: < 800ms target
- **Warm Load**: < 300ms target
- **API Response**: < 200ms target

#### Cache Performance
- **Hit Rate**: > 80% target
- **Miss Rate**: < 20% target
- **Error Rate**: < 1% target

#### Database Performance
- **Query Reduction**: > 80% target
- **Connection Pool**: Stable usage
- **Lock Contention**: Minimal

### Monitoring Tools

#### Cache Statistics
```bash
# Get cache statistics
npm run cache:stats

# Check cache health
npm run cache:stats health
```

#### Application Monitoring
- Redis memory usage
- Cache hit/miss rates
- API response times
- Error rates and types

## 🚨 Rollback Plan

### Immediate Rollback
1. **Switch Routes**: Point back to old API routes
2. **Disable Caching**: Turn off Redis caching
3. **Restore Workers**: Use old worker processes
4. **Monitor**: Check system stability

### Rollback Commands
```bash
# Stop Redis
docker-compose down redis

# Clear cache
npm run cache:clear all

# Restart old workers
pm2 restart enrollment-worker
```

## 🔍 Troubleshooting

### Common Issues

#### Redis Connection Issues
```bash
# Check Redis status
redis-cli ping

# Check Redis logs
docker logs tafta-redis

# Restart Redis
docker-compose restart redis
```

#### Cache Performance Issues
```bash
# Check cache statistics
npm run cache:stats

# Clear problematic cache
npm run cache:clear enrollments

# Monitor Redis memory
redis-cli info memory
```

#### API Performance Issues
```bash
# Check API response times
curl -w "@curl-format.txt" -o /dev/null -s "http://localhost:3000/api/enrollments/cached"

# Check error rates
tail -f logs/api.log | grep ERROR
```

### Debug Commands

#### Redis Debugging
```bash
# Monitor Redis commands
redis-cli monitor

# Check Redis configuration
redis-cli config get "*"

# List all keys
redis-cli keys "*"
```

#### Application Debugging
```bash
# Check cache health
npm run cache:stats health

# Clear specific cache
npm run cache:clear pattern "enrollments:*"

# Monitor worker logs
pm2 logs enrollment-worker
```

## ✅ Post-Migration Validation

### Performance Tests
1. **Load Testing**: Simulate production load
2. **Stress Testing**: Test under high load
3. **End-to-End Testing**: Full user workflows
4. **Performance Benchmarking**: Compare with old system

### Data Validation
1. **Data Consistency**: Verify cached data accuracy
2. **Real-time Updates**: Test webhook processing
3. **Cache Invalidation**: Verify proper invalidation
4. **Error Handling**: Test error scenarios

### User Acceptance Testing
1. **Dashboard Performance**: Test user experience
2. **Data Accuracy**: Verify data correctness
3. **Real-time Updates**: Test live data updates
4. **Error Scenarios**: Test error handling

## 📈 Success Metrics

### Performance Improvements
- **Response Time**: 70-85% improvement
- **Database Load**: 80-90% reduction
- **Cache Hit Rate**: > 80%
- **Error Rate**: < 1%

### User Experience
- **Page Load Time**: < 800ms cold, < 300ms warm
- **Data Freshness**: Real-time updates
- **System Reliability**: 99.9% uptime
- **User Satisfaction**: Improved dashboard experience

## 🎉 Migration Complete

Once migration is complete:

1. **Monitor**: Continue monitoring for 48 hours
2. **Optimize**: Fine-tune cache settings
3. **Document**: Update documentation
4. **Train**: Train team on new system
5. **Celebrate**: Enjoy the performance improvements!

## 📚 Additional Resources

- [Redis Caching Implementation](REDIS_CACHING_README.md)
- [Redis Configuration Guide](REDIS_CONFIGURATION.md)
- [Docker Setup Guide](DOCKER_SETUP_GUIDE.md)
- [Environment Setup Guide](ENVIRONMENT_SETUP.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
