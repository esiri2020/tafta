# Redis Configuration Guide for TAFTA Dashboard

## Environment Variables

The following environment variables need to be configured for Redis caching to work properly:

### Required Variables

```bash
# Redis Connection Settings
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Cache Configuration
CACHE_TTL_ENROLLMENTS=300
CACHE_TTL_APPLICANTS=300
CACHE_TTL_STATISTICS=600
CACHE_TTL_DASHBOARD=300

# Rate Limiting Configuration
RATE_LIMIT_API_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_CACHE_OPERATIONS=50
RATE_LIMIT_DB_QUERIES=200
```

### Production Configuration Examples

#### Docker Compose (Local Development)
```bash
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
```

#### Vercel (Production)
```bash
REDIS_HOST=your-redis-host.redis.cache.windows.net
REDIS_PORT=6380
REDIS_PASSWORD=your-redis-password
REDIS_TLS=true
```

#### AWS ElastiCache
```bash
REDIS_HOST=your-cluster.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

#### Redis Cloud
```bash
REDIS_HOST=your-redis-cloud-host
REDIS_PORT=12345
REDIS_PASSWORD=your-redis-cloud-password
```

## Cache Configuration

### TTL Settings
- **Enrollments**: 5 minutes (300 seconds)
- **Applicants**: 5 minutes (300 seconds)
- **Statistics**: 10 minutes (600 seconds)
- **Dashboard**: 5 minutes (300 seconds)

### Rate Limiting
- **API Requests**: 100 requests per minute
- **Cache Operations**: 50 operations per minute
- **Database Queries**: 200 queries per minute

## Security Considerations

1. **Password Protection**: Always use a strong password for Redis in production
2. **Network Security**: Use TLS/SSL for production Redis connections
3. **Access Control**: Restrict Redis access to your application servers only
4. **Environment Variables**: Never commit Redis passwords to version control

## Performance Optimization

1. **Connection Pooling**: The Redis client uses connection pooling by default
2. **Lazy Connection**: Connections are established only when needed
3. **Retry Logic**: Automatic retry with exponential backoff
4. **Cache Locking**: Prevents cache stampede with distributed locks

## Monitoring

The Redis client includes built-in monitoring:
- Connection status
- Memory usage
- Keyspace information
- Error logging

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check Redis host and port
2. **Authentication Failed**: Verify Redis password
3. **Memory Issues**: Monitor Redis memory usage
4. **Cache Misses**: Check TTL settings and invalidation logic

### Debug Mode

Enable debug logging by setting:
```bash
DEBUG=redis:*
```

## Production Deployment Checklist

- [ ] Redis server is running and accessible
- [ ] Environment variables are set correctly
- [ ] Redis password is secure and not in version control
- [ ] TLS/SSL is enabled for production
- [ ] Rate limiting is configured appropriately
- [ ] Cache TTL values are optimized for your use case
- [ ] Monitoring is set up for Redis performance
- [ ] Backup strategy is in place for Redis data
