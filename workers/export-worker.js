const { parentPort } = require('worker_threads');
const { spawn } = require('child_process');
const path = require('path');

parentPort.on('message', (data) => {
  if (data.start) {
    const scriptPath = path.join(process.cwd(), 'export_applicant_data.py');
    // Use the full path to the Python executable
    const pythonExecutable = process.platform === 'win32' ? 'python' : '/usr/bin/python3';
    const pythonProcess = spawn(pythonExecutable, [scriptPath]);

    let downloadLink = '';

    pythonProcess.stdout.on('data', (data) => {
      const text = data.toString();
      parentPort.postMessage({ log: text });
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
      parentPort.postMessage({ log: data.toString(), error: true });
    });

    pythonProcess.on('close', (code) => {
      parentPort.postMessage({ done: true, downloadLink });
    });
  }
}); 