# Docker Setup Guide for Real-Time Sync System

## Step 1: Install Docker Desktop

### For Windows:
1. Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
2. Run the installer and follow the setup wizard
3. Restart your computer when prompted
4. Verify installation by opening Command Prompt and running:
   ```bash
   docker --version
   docker compose version
   ```

## Step 2: Start Redis Container

Once Docker is installed, run these commands in your project directory:

```bash
# Start Redis container
docker compose up -d redis

# Verify Redis is running
docker ps

# Test Redis connection
docker exec tafta-redis redis-cli ping
```

## Step 3: Update Environment Variables

Add these to your `.env` file:

```bash
# Redis Configuration (Docker)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Thinkific Webhook Secret
THINKIFIC_WEBHOOK_SECRET=your_secure_webhook_secret_here
```

## Step 4: Test the System

```bash
# Start the enrollment worker
npm run worker:enrollment

# In another terminal, test the system
npm run test:sync
```

## Production Deployment

### Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: tafta-redis-prod
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    restart: unless-stopped
    environment:
      - REDIS_PASSWORD=${REDIS_PASSWORD}
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  worker:
    build: .
    container_name: tafta-worker
    depends_on:
      - redis
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
      - THINKIFIC_WEBHOOK_SECRET=${THINKIFIC_WEBHOOK_SECRET}
    command: npm run worker:enrollment
    restart: unless-stopped

volumes:
  redis_data:
```

### Production Environment Variables

```bash
# Production Redis (with password)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_redis_password

# Webhook Secret
THINKIFIC_WEBHOOK_SECRET=your_production_webhook_secret

# Existing API credentials
API_KEY=your_api_key
API_SUBDOMAIN=your_subdomain
```

## Benefits of Docker Approach

✅ **Consistency**: Same Redis version across dev/staging/production
✅ **Isolation**: Redis runs in its own container
✅ **Scalability**: Easy to scale Redis or add more services
✅ **Backup**: Redis data persisted in Docker volumes
✅ **Health Checks**: Automatic monitoring and restart
✅ **Security**: Can add Redis password for production

## Commands Reference

```bash
# Start Redis
docker compose up -d redis

# Stop Redis
docker compose down

# View Redis logs
docker logs tafta-redis

# Access Redis CLI
docker exec -it tafta-redis redis-cli

# Restart Redis
docker compose restart redis

# Remove Redis data (careful!)
docker compose down -v
```

