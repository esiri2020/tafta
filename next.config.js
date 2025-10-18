/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Add ESM support
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx']
    };
    
    // Fix for __webpack_require__.t
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    return config;
  },
  // Environment variables for Redis caching
  env: {
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: process.env.REDIS_PORT || '6379',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
    CACHE_TTL_ENROLLMENTS: process.env.CACHE_TTL_ENROLLMENTS || '300',
    CACHE_TTL_APPLICANTS: process.env.CACHE_TTL_APPLICANTS || '300',
    CACHE_TTL_STATISTICS: process.env.CACHE_TTL_STATISTICS || '600',
    CACHE_TTL_DASHBOARD: process.env.CACHE_TTL_DASHBOARD || '300',
    RATE_LIMIT_API_REQUESTS: process.env.RATE_LIMIT_API_REQUESTS || '100',
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || '60000',
  },
  // Add any other Next.js config options you need
}

module.exports = nextConfig 