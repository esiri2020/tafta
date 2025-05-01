import React, { useState } from 'react';
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
  LinearProgress,
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
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { Send as SendIcon } from '@mui/icons-material';

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string;
  userData?: {
    role?: string;
    userId?: string;
  };
}

interface CohortAlert {
  id: string;
  cohortId: string;
  cohortName: string;
  currentCompletion: number;
  targetCompletion: number;
  status: 'WARNING' | 'REMINDER' | 'CAUTION';
  createdAt: string;
  message: string;
  triggeredBy: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

const CohortAlertsPage: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'WARNING' | 'REMINDER' | 'CAUTION'>('WARNING');

  // Redirect if not staff
  React.useEffect(() => {
    console.log('Session data:', session);
    const userRole = (session?.user as any)?.userData?.role;
    console.log('User role:', userRole);
    if (!userRole || !['SUPERADMIN', 'ADMIN', 'SUPPORT'].includes(userRole)) {
      console.log('Redirecting to dashboard - Invalid role:', userRole);
      router.push('/dashboard');
    }
  }, [session, router]);

  // Mock data - replace with actual API call
  const mockAlerts: CohortAlert[] = [
    {
      id: '1',
      cohortId: 'cohort1',
      cohortName: 'Cohort A',
      currentCompletion: 800,
      targetCompletion: 3000,
      status: 'WARNING',
      createdAt: new Date().toISOString(),
      message: 'Warning: Cohort completion is below 1,000 points.',
      triggeredBy: {
        firstName: 'John',
        lastName: 'Doe',
        role: 'SUPERADMIN'
      }
    },
    {
      id: '2',
      cohortId: 'cohort2',
      cohortName: 'Cohort B',
      currentCompletion: 1200,
      targetCompletion: 3000,
      status: 'REMINDER',
      createdAt: new Date().toISOString(),
      message: 'Reminder: Cohort needs to reach 1,500 points.',
      triggeredBy: {
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'ADMIN'
      }
    },
    {
      id: '3',
      cohortId: 'cohort3',
      cohortName: 'Cohort C',
      currentCompletion: 2000,
      targetCompletion: 3000,
      status: 'CAUTION',
      createdAt: new Date().toISOString(),
      message: 'Caution: Cohort needs to reach 2,500 points.',
      triggeredBy: {
        firstName: 'Mike',
        lastName: 'Johnson',
        role: 'SUPPORT'
      }
    }
  ];

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WARNING':
        return 'error';
      case 'REMINDER':
        return 'warning';
      case 'CAUTION':
        return 'info';
      default:
        return 'default';
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return (current / target) * 100;
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCohort('');
    setAlertMessage('');
    setAlertType('WARNING');
  };

  const handleTriggerAlert = () => {
    // TODO: Implement API call to trigger alert
    console.log('Triggering alert:', {
      cohortId: selectedCohort,
      message: alertMessage,
      type: alertType
    });
    handleCloseDialog();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader
          title="Cohort Completion Alerts"
          subheader="Monitor cohort completion progress and receive alerts for underperforming cohorts"
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              onClick={handleOpenDialog}
            >
              Trigger Alert
            </Button>
          }
        />
        <CardContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Alerts are triggered at 1,000, 1,500, and 2,500 completion points to help track progress towards the 3,000 target.
          </Alert>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cohort</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Current Completion</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Message</TableCell>
                  <TableCell>Triggered By</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockAlerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>{alert.cohortName}</TableCell>
                    <TableCell sx={{ width: '200px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={calculateProgress(alert.currentCompletion, alert.targetCompletion)}
                            color={getStatusColor(alert.status) as any}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {`${Math.round(calculateProgress(alert.currentCompletion, alert.targetCompletion))}%`}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{alert.currentCompletion.toLocaleString()}</TableCell>
                    <TableCell>{alert.targetCompletion.toLocaleString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={alert.status}
                        color={getStatusColor(alert.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{alert.message}</TableCell>
                    <TableCell>
                      {alert.triggeredBy.firstName} {alert.triggeredBy.lastName}
                      <br />
                      <Typography variant="caption" color="textSecondary">
                        {alert.triggeredBy.role}
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
            count={mockAlerts.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>

      {/* Trigger Alert Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Trigger Cohort Alert</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Cohort</InputLabel>
              <Select
                value={selectedCohort}
                label="Cohort"
                onChange={(e) => setSelectedCohort(e.target.value)}
              >
                <MenuItem value="cohort1">Cohort A</MenuItem>
                <MenuItem value="cohort2">Cohort B</MenuItem>
                <MenuItem value="cohort3">Cohort C</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Alert Type</InputLabel>
              <Select
                value={alertType}
                label="Alert Type"
                onChange={(e) => setAlertType(e.target.value as any)}
              >
                <MenuItem value="WARNING">Warning</MenuItem>
                <MenuItem value="REMINDER">Reminder</MenuItem>
                <MenuItem value="CAUTION">Caution</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Alert Message"
              multiline
              rows={4}
              value={alertMessage}
              onChange={(e) => setAlertMessage(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleTriggerAlert} 
            variant="contained" 
            color="primary"
            disabled={!selectedCohort || !alertMessage}
          >
            Trigger Alert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Wrap the component with DashboardLayout
const AlertsPage = () => {
  return (
    <DashboardLayout>
      <CohortAlertsPage />
    </DashboardLayout>
  );
};

export default AlertsPage; 