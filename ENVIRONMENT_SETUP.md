# Environment Configuration Required

## Required Environment Variables

Add these to your `.env` file (create if it doesn't exist):

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Thinkific Webhook Secret (set this to match your Thinkific webhook configuration)
THINKIFIC_WEBHOOK_SECRET=your_webhook_secret_here

# Existing Thinkific API credentials (should already be set)
# API_KEY=your_api_key
# API_SUBDOMAIN=your_subdomain
```

## Redis Setup Options

### Option 1: Docker (Recommended)
```bash
docker run -d -p 6379:6379 redis:alpine
```

### Option 2: Windows Installation
1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Install and start the Redis service
3. Or use Windows Subsystem for Linux (WSL)

### Option 3: Cloud Redis
- Use Redis Cloud, AWS ElastiCache, or similar service
- Update REDIS_HOST and REDIS_PASSWORD accordingly

## Testing Without Redis

For initial testing, you can modify the worker to use an in-memory queue temporarily.

