# Real-Time Enrollment Sync System

This system replaces the 24-hour batch processing with real-time webhook-driven updates for enrollment statuses.

## Architecture Overview

```
Thinkific Webhooks → Webhook Endpoint → BullMQ Queue → Worker → Database
                                    ↓
                              Sync Poller (backup)
```

## Components

### 1. Webhook Endpoint (`/api/webhooks/enrollment`)
- Receives real-time events from Thinkific
- Validates HMAC signatures for security
- Deduplicates events by ID
- Queues events for processing

### 2. BullMQ Worker (`workers/enrollment-processor.js`)
- Processes enrollment events asynchronously
- Implements idempotent upserts
- Stops processing completed enrollments
- Provides comprehensive metrics

### 3. Sync Poller (`/api/enrollments/sync`)
- Fetches missed events every 2-5 minutes
- Uses cursor-based pagination
- Ensures gap-free consistency

### 4. Metrics & Monitoring (`/api/enrollments/metrics`)
- Real-time system health monitoring
- Queue metrics and performance data
- Error tracking and debugging

## Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Thinkific Webhook Secret
THINKIFIC_WEBHOOK_SECRET=your_webhook_secret

# Existing Thinkific API credentials
API_KEY=your_api_key
API_SUBDOMAIN=your_subdomain
```

### 2. Install Dependencies

```bash
npm install bullmq redis ioredis
```

### 3. Start Redis Server

```bash
# Using Docker
docker run -d -p 6379:6379 redis:alpine

# Or install locally
# Windows: Download from https://github.com/microsoftarchive/redis/releases
# macOS: brew install redis
# Linux: sudo apt-get install redis-server
```

### 4. Start the Worker

```bash
# Production
npm run worker:enrollment

# Development (with auto-restart)
npm run worker:dev
```

### 5. Configure Thinkific Webhooks

In your Thinkific admin panel:

1. Go to Settings → Code & Analytics → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/enrollment`
3. Select events:
   - `enrollment.created`
   - `enrollment.progress`
   - `enrollment.completed`
4. Set webhook secret (same as `THINKIFIC_WEBHOOK_SECRET`)

## API Endpoints

### Webhook Endpoint
- **POST** `/api/webhooks/enrollment`
- Receives Thinkific webhook events
- No authentication required (uses HMAC verification)

### Sync Endpoint
- **POST** `/api/enrollments/sync`
- Manually trigger sync for missed events
- Requires admin authentication

### Metrics Endpoint
- **GET** `/api/enrollments/metrics`
- View system metrics and health
- Requires admin authentication

## Key Features

### ✅ Real-Time Updates
- Webhook events processed in seconds
- No more 24-hour delays

### ✅ Event Deduplication
- Prevents duplicate processing
- Uses Thinkific event IDs

### ✅ Idempotent Operations
- Safe to replay events
- Last-write-wins strategy

### ✅ Gap-Free Consistency
- Poller catches missed events
- Cursor-based synchronization

### ✅ Comprehensive Monitoring
- Real-time metrics
- Error tracking
- Performance monitoring

### ✅ Scalable Architecture
- Rate limiting
- Exponential backoff
- Queue-based processing

## Monitoring & Debugging

### View Metrics
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://yourdomain.com/api/enrollments/metrics
```

### Check Queue Status
```bash
# Redis CLI
redis-cli
> LLEN bull:enrollment-processing:waiting
> LLEN bull:enrollment-processing:failed
```

### Manual Sync
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  https://yourdomain.com/api/enrollments/sync
```

## Troubleshooting

### Common Issues

1. **Webhook Signature Verification Failed**
   - Check `THINKIFIC_WEBHOOK_SECRET` matches Thinkific configuration
   - Verify webhook URL is accessible

2. **Worker Not Processing Jobs**
   - Ensure Redis is running
   - Check worker logs for errors
   - Verify database connection

3. **High Queue Backlog**
   - Increase worker concurrency
   - Check for database performance issues
   - Monitor Redis memory usage

### Logs

Worker logs include:
- Job processing status
- Error details
- Performance metrics
- Queue health

## Migration from Batch Processing

The new system is designed to run alongside the existing batch processing:

1. **Phase 1**: Deploy webhook system
2. **Phase 2**: Monitor webhook performance
3. **Phase 3**: Disable batch processing
4. **Phase 4**: Remove old batch code

## Performance Expectations

- **Latency**: < 5 seconds for webhook processing
- **Throughput**: 100+ events per minute
- **Reliability**: 99.9% success rate
- **Recovery**: Automatic retry with exponential backoff

## Security Considerations

- HMAC signature verification
- Rate limiting on API calls
- Admin-only access to sync/metrics
- Secure Redis configuration
- Input validation and sanitization

