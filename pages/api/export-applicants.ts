import type { NextApiRequest, NextApiResponse } from 'next';
import { Worker } from 'worker_threads';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Set up streaming response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const worker = new Worker(path.join(process.cwd(), 'workers/export-worker.js'));

  worker.on('message', (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
    if (data.done) {
      worker.terminate();
      res.end();
    }
  });

  worker.on('error', (err) => {
    res.write(`data: ${JSON.stringify({ log: err.message, error: true })}\n\n`);
    worker.terminate();
    res.end();
  });

  worker.postMessage({ start: true });
} 