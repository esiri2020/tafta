import React, { useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import { 
  Send as SendIcon,
  ExpandMore as ExpandMoreIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useGetNotificationsQuery, useGetCohortsQuery } from '@/services/api';
import { toast } from 'react-hot-toast';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { SplashScreen } from '../../../components/splash-screen';
import type { Cohort } from '@prisma/client';

interface StaffAlert {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: string;
  status: string;
  tags: string[];
  cohort: {
    name: string;
  };
  sender: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

const StaffAlertsPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState('');
  const [alertType, setAlertType] = useState('REMINDER');
  const [alertMessage, setAlertMessage] = useState('');
  const [expandedAlert, setExpandedAlert] = useState<string | false>(false);
  const [selectedAlert, setSelectedAlert] = useState<StaffAlert | null>(null);

  // Fetch alerts (notifications with COHORT_COMPLETION tag)
  const { data: alertsData, isLoading: isLoadingAlerts, error: alertsError } = useGetNotificationsQuery({
    page: 0,
    limit: 100,
    tag: 'COHORT_COMPLETION',
    type: 'REMINDER',
  });

  // Fetch cohorts for the create dialog
  const { data: cohortsData, isLoading: isLoadingCohorts } = useGetCohortsQuery({
    page: 0,
    limit: 100,
  });

  const handleAccordionChange = (alertId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedAlert(isExpanded ? alertId : false);
  };

  const handleViewFullMessage = (alert: StaffAlert) => {
    setSelectedAlert(alert);
  };

  const handleCreateAlert = async () => {
    try {
      // TODO: Implement alert creation
      toast.success('Alert created successfully');
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create alert');
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'REMINDER':
        return <WarningIcon color="warning" />;
      case 'ANNOUNCEMENT':
        return <CheckCircleIcon color="success" />;
      default:
        return <CheckCircleIcon color="info" />;
    }
  };

  if (isLoadingAlerts || isLoadingCohorts) return <SplashScreen />;
  if (alertsError) return <div>Error loading alerts</div>;
  if (!alertsData) return <div>No Data!</div>;

  return (
    <>
      <Head>
        <title>Staff Alerts</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8
        }}
      >
        <Box sx={{ p: 3 }}>
          <Card>
            <CardHeader
              title="Staff Alerts"
              subheader="View and create cohort-related alerts"
              action={
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  Create Alert
                </Button>
              }
            />
            <CardContent>
              {alertsData.notifications.length === 0 ? (
                <Typography color="textSecondary" align="center">
                  No alerts found
                </Typography>
              ) : (
                <Box sx={{ mt: 2 }}>
                  {alertsData.notifications.map((alert: StaffAlert) => (
                    <Accordion
                      key={alert.id}
                      expanded={expandedAlert === alert.id}
                      onChange={handleAccordionChange(alert.id)}
                      sx={{ mb: 2 }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          {getAlertIcon(alert.type)}
                          <Box sx={{ ml: 2, flexGrow: 1 }}>
                            <Typography variant="subtitle1">{alert.title}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {alert.cohort.name} • {format(new Date(alert.createdAt), 'MMM d, yyyy HH:mm')}
                            </Typography>
                          </Box>
                          <Chip
                            label={alert.status}
                            color={alert.status === 'SENT' ? 'success' : 'default'}
                            size="small"
                            sx={{ mr: 2 }}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                            {alert.message}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" color="textSecondary">
                            Sent by {alert.sender.firstName} {alert.sender.lastName} ({alert.sender.role})
                          </Typography>
                          <Box>
                            <Tooltip title="View full message">
                              <IconButton
                                size="small"
                                onClick={() => handleViewFullMessage(alert)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Create Alert Dialog */}
          <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Alert</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Cohort</InputLabel>
                  <Select
                    value={selectedCohort}
                    label="Cohort"
                    onChange={(e) => setSelectedCohort(e.target.value)}
                  >
                    {cohortsData?.cohorts.map((cohort: Cohort) => (
                      <MenuItem key={cohort.id} value={cohort.id}>
                        {cohort.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Alert Type</InputLabel>
                  <Select
                    value={alertType}
                    label="Alert Type"
                    onChange={(e) => setAlertType(e.target.value)}
                  >
                    <MenuItem value="REMINDER">Reminder</MenuItem>
                    <MenuItem value="ANNOUNCEMENT">Announcement</MenuItem>
                    <MenuItem value="WARNING">Warning</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Alert Message"
                  value={alertMessage}
                  onChange={(e) => setAlertMessage(e.target.value)}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateAlert} variant="contained">
                Create Alert
              </Button>
            </DialogActions>
          </Dialog>

          {/* View Full Message Dialog */}
          <Dialog
            open={!!selectedAlert}
            onClose={() => setSelectedAlert(null)}
            maxWidth="md"
            fullWidth
          >
            {selectedAlert && (
              <>
                <DialogTitle>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {getAlertIcon(selectedAlert.type)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {selectedAlert.title}
                    </Typography>
                  </Box>
                </DialogTitle>
                <DialogContent>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedAlert.message}
                    </Typography>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="textSecondary">
                        Cohort: {selectedAlert.cohort.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Sent on: {format(new Date(selectedAlert.createdAt), 'MMM d, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setSelectedAlert(null)}>Close</Button>
                </DialogActions>
              </>
            )}
          </Dialog>
        </Box>
      </Box>
    </>
  );
};

// Add layout
StaffAlertsPage.getLayout = (page: React.ReactNode) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default StaffAlertsPage; 