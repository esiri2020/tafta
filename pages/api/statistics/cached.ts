import { NextApiRequest, NextApiResponse } from 'next';
import { cachedPrisma } from 'lib/cached-prisma';
import { rateLimiter } from 'lib/rate-limiter';
import { revalidateAfterChange } from 'lib/cache-revalidator';
import { unstable_cache } from 'next/cache';

// Cached statistics calculation
const getCachedStatistics = unstable_cache(
  async (cohortId?: string) => {
    return await cachedPrisma.getCachedStatistics(cohortId);
  },
  ['statistics'],
  {
    tags: ['statistics', 'dashboard'],
    revalidate: 600, // 10 minutes
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // Rate limiting
  const identifier = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'anonymous';
  const allowed = await rateLimiter.limitApiRequest('statistics', identifier as string, 50, 60000);
  
  if (!allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests, please try again later',
    });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get cohortId from query parameters
    const { cohortId } = req.query;
    const cohortIdString = Array.isArray(cohortId) ? cohortId[0] : cohortId;

    // Get cached statistics
    const statistics = await getCachedStatistics(cohortIdString);

    return res.status(200).json(statistics);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
