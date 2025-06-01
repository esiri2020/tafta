import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  LinearProgress,
  Typography,
  Box,
} from '@mui/material';

export const ExportProgressDialog = ({ open, onClose }) => {
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [downloadLink, setDownloadLink] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLogs([]);
    setProgress(0);
    setDownloadLink('');
    setIsExporting(true);

    const eventSource = new EventSource('/api/export-applicants');
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.log) {
          setLogs((prev) => [...prev, data.log]);
        }
        if (data.done) {
          setIsExporting(false);
          if (data.downloadLink) setDownloadLink(data.downloadLink);
          eventSource.close();
        }
      } catch (e) {
        setLogs((prev) => [...prev, 'Error parsing log data']);
      }
    };
    eventSource.onerror = (err) => {
      setLogs((prev) => [...prev, 'Error during export']);
      setIsExporting(false);
      eventSource.close();
    };
    return () => eventSource.close();
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Exporting Applicant Data</DialogTitle>
      <DialogContent dividers>
        <Box mb={2}>
          <LinearProgress variant={isExporting ? 'indeterminate' : 'determinate'} value={100} />
        </Box>
        <Box mb={2}>
          <Typography variant='subtitle2'>Export Progress Logs:</Typography>
          <Box
            sx={{
              background: '#f5f5f5',
              borderRadius: 1,
              p: 1,
              maxHeight: 200,
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: 13,
            }}
          >
            {logs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </Box>
        </Box>
        {downloadLink && (
          <Box mt={2}>
            <Button
              variant='contained'
              color='primary'
              href={downloadLink}
              target='_blank'
              rel='noopener noreferrer'
            >
              Download Exported File
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 