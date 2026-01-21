import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { exportQueue } from '@/lib/export-queue';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the token from the request
    const token = await getToken({ req });
    if (!token || !token.userData) {
      return res.status(401).json({
        error: 'You must be signed in to check export status.',
      });
    }

    const userRole = token.userData.role || '';
    if (!['SUPERADMIN', 'ADMIN', 'SUPPORT'].includes(userRole)) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    // Get job ID from query
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Job ID is required' });
    }

    // Get job from queue
    const job = await exportQueue.getJob(id);
    if (!job) {
      return res.status(404).json({
        error: 'Job not found',
        status: 'not_found',
      });
    }

    // Get job state
    const state = await job.getState();
    const progress = job.progress || 0;

    // Prepare response
    const response: any = {
      jobId: job.id,
      status: state,
      progress: typeof progress === 'object' && progress !== null ? progress : { percent: typeof progress === 'number' ? progress : 0 },
    };

    // Add status-specific data
    if (state === 'completed') {
      const result = await job.returnvalue;
      response.downloadLink = result?.downloadLink;
      response.fileName = result?.fileName;
      response.completedAt = new Date(job.finishedOn || 0).toISOString();
    } else if (state === 'failed') {
      const failedReason = job.failedReason;
      response.error = failedReason;
      response.failedAt = new Date(job.finishedOn || 0).toISOString();
    } else if (state === 'active' || state === 'waiting' || state === 'delayed') {
      // Handle progress which can be object with logs/stage or just a number
      if (typeof progress === 'object' && progress !== null && 'logs' in progress) {
        response.logs = (progress as any).logs || [];
        response.stage = (progress as any).stage || 'queued';
      } else {
        response.logs = [];
        response.stage = 'queued';
      }
    }

    return res.status(200).json(response);
  } catch (err: any) {
    console.error('❌ Error checking export status:', err);
    return res.status(500).json({
      error: 'Failed to check export status',
      message: err.message,
    });
  }
}

