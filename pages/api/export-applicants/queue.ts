import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { exportQueue } from '@/lib/export-queue';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the token from the request
    const token = await getToken({ req });
    if (!token || !token.userData) {
      return res.status(401).json({
        error: 'You must be signed in to export data.',
      });
    }

    const userRole = token.userData.role || '';
    if (!['SUPERADMIN', 'ADMIN', 'SUPPORT'].includes(userRole)) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    // Get mobilizer filter from request body
    const { mobilizerId } = req.body || {};

    // Create a unique job ID
    const jobId = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add export job to queue
    const job = await exportQueue.add(
      'export-applicants',
      {
        mobilizerId: mobilizerId || null,
        requestedBy: token.userData.userId,
        requestedAt: new Date().toISOString(),
      },
      {
        jobId,
        priority: mobilizerId ? 5 : 3, // Higher priority for filtered exports
      }
    );

    console.log(`✅ Export job queued: ${jobId}`);

    return res.status(202).json({
      success: true,
      jobId: job.id,
      message: 'Export job queued successfully',
      statusUrl: `/api/export-applicants/status?id=${job.id}`,
    });
  } catch (err: any) {
    console.error('❌ Error queueing export:', err);
    return res.status(500).json({
      error: 'Failed to queue export job',
      message: err.message,
    });
  }
}
