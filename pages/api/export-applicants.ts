import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Set up streaming response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const scriptPath = path.join(process.cwd(), 'export_applicant_data.py');
  const pythonProcess = spawn('python', [scriptPath]);

  let downloadLink = '';

  pythonProcess.stdout.on('data', (data) => {
    const text = data.toString();
    res.write(`data: ${JSON.stringify({ log: text })}\n\n`);
    // Try to extract the file name from the output
    const match = text.match(/Data exported successfully to (.+\.xlsx)/);
    if (match) {
      let filePath = match[1];
      // Remove 'public/exports/' or 'public\\exports\\' from the path if present
      filePath = filePath.replace(/^public[\\\/]exports[\\\/]/, '');
      downloadLink = `/exports/${filePath}`;
    }
  });

  pythonProcess.stderr.on('data', (data) => {
    res.write(`data: ${JSON.stringify({ log: data.toString(), error: true })}\n\n`);
  });

  pythonProcess.on('close', (code) => {
    res.write(`data: ${JSON.stringify({ done: true, downloadLink })}\n\n`);
    res.end();
  });
} 