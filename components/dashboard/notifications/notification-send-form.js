import React, {useState, useEffect} from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  MenuItem,
  Select,
  TextField,
  FormControl,
  InputLabel,
  Typography,
  FormHelperText,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import {
  useSendNotificationMutation,
  useSendCohortNotificationMutation,
  useGetCohortsQuery,
} from '../../../services/api';

export const NotificationSendForm = ({
  recipientIds,
  onSuccess,
  filteredApplicants,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState('GENERAL');
  const [cohortId, setCohortId] = useState('');
  const [isCohortMode, setIsCohortMode] = useState(false);
  const [isFilteredMode, setIsFilteredMode] = useState(
    !!filteredApplicants && (!recipientIds || recipientIds.length === 0),
  );
  const [formErrors, setFormErrors] = useState({});

  // Get cohorts for dropdown
  const {data: cohortsData} = useGetCohortsQuery({page: 0, limit: 100});

  // Mutations for sending notifications
  const [
    sendNotification,
    {isLoading: isSending, isSuccess: isSent, error: sendError},
  ] = useSendNotificationMutation();
  const [
    sendCohortNotification,
    {
      isLoading: isSendingCohort,
      isSuccess: isSentCohort,
      error: sendCohortError,
    },
  ] = useSendCohortNotificationMutation();

  const isLoading = isSending || isSendingCohort;
  const isSuccess = isSent || isSentCohort;
  const error = sendError || sendCohortError;

  // Reset form on successful send
  useEffect(() => {
    if (isSuccess) {
      setTitle('');
      setMessage('');
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [isSuccess, onSuccess]);

  // Debug logs to understand what's happening
  useEffect(() => {
    console.log('NotificationSendForm initialized with:', {
      recipientIds: recipientIds?.length || 0,
      filteredApplicants: filteredApplicants?.length || 0,
      isFilteredMode,
      isCohortMode,
    });
  }, []);

  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    }

    if (!message.trim()) {
      errors.message = 'Message is required';
    }

    if (isCohortMode && !cohortId) {
      errors.cohortId = 'Please select a cohort';
    }

    if (
      !isCohortMode &&
      !isFilteredMode &&
      (!recipientIds || recipientIds.length === 0)
    ) {
      errors.recipients =
        'Please select recipients or choose a different send method';
    }

    if (
      isFilteredMode &&
      (!filteredApplicants || filteredApplicants.length === 0)
    ) {
      errors.recipients =
        'No filtered applicants available. Try adjusting your filters.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const notificationData = {
      title,
      message,
      type: notificationType,
    };

    try {
      console.log('Sending notification with mode:', {
        isCohortMode,
        isFilteredMode,
        recipientIds: recipientIds?.length || 0,
        filteredApplicants: filteredApplicants?.length || 0,
      });

      if (isCohortMode) {
        if (!cohortId) {
          throw new Error('No cohort selected');
        }

        console.log('Sending to cohort:', cohortId);
        const response = await sendCohortNotification({
          ...notificationData,
          cohortId,
        });
        console.log('Cohort notification response:', response);
      } else if (isFilteredMode && filteredApplicants?.length > 0) {
        // Send to filtered applicants
        console.log('Sending to filtered applicants:', filteredApplicants);

        // Ensure we have valid IDs - this is important!
        const validIds = filteredApplicants.filter(
          id => id !== null && id !== undefined && id !== '',
        );

        if (validIds.length === 0) {
          throw new Error(
            'No valid recipient IDs found in filtered applicants',
          );
        }

        // Log the exact payload we're sending to the API
        const payload = {
          ...notificationData,
          recipientIds: validIds,
        };
        console.log('Sending notification payload:', JSON.stringify(payload));

        // Send without unwrap to avoid RTK query error handling issues
        const response = await sendNotification(payload);
        console.log('Filtered notification response:', response);
      } else {
        // Send to explicitly selected recipients
        console.log('Sending to selected recipients:', recipientIds);

        // Ensure we have valid IDs
        const validIds = recipientIds.filter(
          id => id !== null && id !== undefined && id !== '',
        );

        if (validIds.length === 0) {
          throw new Error(
            'No valid recipient IDs found in selected applicants',
          );
        }

        // Log the exact payload we're sending to the API
        const payload = {
          ...notificationData,
          recipientIds: validIds,
        };
        console.log('Sending notification payload:', JSON.stringify(payload));

        // Send without unwrap to avoid RTK query error handling issues
        const response = await sendNotification(payload);
        console.log('Selected notification response:', response);
      }
    } catch (err) {
      console.error('Error sending notification:', err);

      // Show more details about the error
      if (err.data) {
        console.error(`Error data: ${JSON.stringify(err.data || {})}`);
      } else if (err.message) {
        console.error(`Error message: ${err.message}`);
      }
    }
  };

  return (
    <form autoComplete='off' noValidate onSubmit={handleSubmit}>
      <Card>
        <CardHeader
          title='Send Notification'
          subheader={
            isCohortMode
              ? 'Send a notification to all applicants in a cohort'
              : isFilteredMode
              ? `Send a notification to ${
                  filteredApplicants?.length || 0
                } filtered applicants`
              : recipientIds?.length
              ? `Send a notification to ${recipientIds.length} selected applicant(s)`
              : 'Please select recipients to send a notification'
          }
        />
        <Divider />
        <CardContent>
          {error && (
            <Alert severity='error' sx={{mb: 2}}>
              <AlertTitle>Error</AlertTitle>
              {error.data?.error ||
                'Failed to send notification. Please try again.'}
            </Alert>
          )}

          {isSuccess && (
            <Alert severity='success' sx={{mb: 2}}>
              <AlertTitle>Success</AlertTitle>
              Notification sent successfully!
            </Alert>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id='notification-type-label'>Send to</InputLabel>
                <Select
                  labelId='notification-type-label'
                  value={
                    isFilteredMode
                      ? 'filtered'
                      : isCohortMode
                      ? 'cohort'
                      : 'selected'
                  }
                  label='Send to'
                  onChange={e => {
                    const value = e.target.value;
                    setIsFilteredMode(value === 'filtered');
                    setIsCohortMode(value === 'cohort');
                  }}
                  disabled={isLoading}>
                  {filteredApplicants?.length > 0 && (
                    <MenuItem value='filtered'>Filtered Applicants</MenuItem>
                  )}
                  {recipientIds?.length > 0 && (
                    <MenuItem value='selected'>Selected Applicants</MenuItem>
                  )}
                  <MenuItem value='cohort'>All Applicants in a Cohort</MenuItem>
                </Select>
                <FormHelperText>
                  {isFilteredMode
                    ? 'Send to all applicants matching your current filters'
                    : isCohortMode
                    ? 'Send to all applicants in a specific cohort'
                    : 'Send to selected applicants only'}
                </FormHelperText>
              </FormControl>
            </Grid>

            {isCohortMode && (
              <Grid item xs={12}>
                <FormControl fullWidth error={!!formErrors.cohortId}>
                  <InputLabel id='cohort-label'>Cohort</InputLabel>
                  <Select
                    labelId='cohort-label'
                    value={cohortId}
                    label='Cohort'
                    onChange={e => setCohortId(e.target.value)}
                    disabled={isLoading}>
                    {cohortsData?.cohorts?.map(cohort => (
                      <MenuItem key={cohort.id} value={cohort.id}>
                        {cohort.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.cohortId && (
                    <FormHelperText>{formErrors.cohortId}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.type}>
                <InputLabel id='notification-type-label'>
                  Notification Type
                </InputLabel>
                <Select
                  labelId='notification-type-label'
                  value={notificationType}
                  label='Notification Type'
                  onChange={e => setNotificationType(e.target.value)}
                  disabled={isLoading}>
                  <MenuItem value='GENERAL'>General</MenuItem>
                  <MenuItem value='ANNOUNCEMENT'>Announcement</MenuItem>
                  <MenuItem value='COURSE_UPDATE'>Course Update</MenuItem>
                  <MenuItem value='REMINDER'>Reminder</MenuItem>
                  <MenuItem value='APPROVAL'>Approval</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Title'
                name='title'
                onChange={e => setTitle(e.target.value)}
                required
                value={title}
                variant='outlined'
                error={!!formErrors.title}
                helperText={formErrors.title}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label='Message'
                name='message'
                onChange={e => setMessage(e.target.value)}
                required
                value={message}
                variant='outlined'
                multiline
                rows={4}
                error={!!formErrors.message}
                helperText={formErrors.message}
                disabled={isLoading}
              />
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            p: 2,
          }}>
          <Button
            color='primary'
            variant='contained'
            type='submit'
            disabled={
              isLoading ||
              (!recipientIds?.length && !isCohortMode && !isFilteredMode)
            }
            startIcon={
              isLoading ? <CircularProgress size={20} color='inherit' /> : null
            }>
            {isLoading ? 'Sending...' : 'Send Notification'}
          </Button>
        </Box>
      </Card>
    </form>
  );
};
