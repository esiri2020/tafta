import React, { useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Typography,
  Alert,
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
} from '@mui/material';
import { format } from 'date-fns';
import { Send as SendIcon } from '@mui/icons-material';
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState('');
  const [alertType, setAlertType] = useState('REMINDER');
  const [alertMessage, setAlertMessage] = useState('');

  // Fetch alerts (notifications with COHORT_COMPLETION tag)
  const { data: alertsData, isLoading: isLoadingAlerts, error: alertsError } = useGetNotificationsQuery({
    page,
    limit: rowsPerPage,
    tag: 'COHORT_COMPLETION',
    type: 'REMINDER',
  });

  // Fetch cohorts for the create dialog
  const { data: cohortsData, isLoading: isLoadingCohorts } = useGetCohortsQuery({
    page: 0,
    limit: 100,
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Cohort</TableCell>
                          <TableCell>Title</TableCell>
                          <TableCell>Message</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Created By</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {alertsData.notifications.map((alert: StaffAlert) => (
                          <TableRow key={alert.id}>
                            <TableCell>{alert.cohort.name}</TableCell>
                            <TableCell>{alert.title}</TableCell>
                            <TableCell>{alert.message}</TableCell>
                            <TableCell>
                              <Chip
                                label={alert.type}
                                color={alert.type === 'REMINDER' ? 'warning' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={alert.status}
                                color={alert.status === 'SENT' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {alert.sender.firstName} {alert.sender.lastName}
                              <br />
                              <Typography variant="caption" color="textSecondary">
                                {alert.sender.role}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {format(new Date(alert.createdAt), 'MMM d, yyyy HH:mm')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component="div"
                    count={alertsData.total || 0}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
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