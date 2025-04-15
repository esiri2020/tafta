import React, {useEffect} from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {NotificationSendForm} from './notification-send-form';

export const NotificationDialog = ({
  open,
  onClose,
  selectedApplicantIds = [],
  filteredApplicants = [],
  title = 'Send Notification',
}) => {
  const handleSuccess = () => {
    // Close the dialog after a successful send
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  // Debug logging for clarity
  useEffect(() => {
    if (open) {
      console.log('NotificationDialog opened with:', {
        selectedApplicantIds: selectedApplicantIds?.length || 0,
        filteredApplicants: filteredApplicants?.length || 0,
        usingMode: selectedApplicantIds?.length > 0 ? 'selected' : 'filtered',
      });
    }
  }, [open, selectedApplicantIds, filteredApplicants]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth='md'
      aria-labelledby='notification-dialog-title'>
      <DialogTitle id='notification-dialog-title'>
        <Box display='flex' justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>{title}</Typography>
          <IconButton
            edge='end'
            color='inherit'
            onClick={onClose}
            aria-label='close'>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <NotificationSendForm
          recipientIds={selectedApplicantIds}
          filteredApplicants={filteredApplicants}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
