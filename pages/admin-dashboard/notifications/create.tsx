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
  Tabs,
  Tab,
  IconButton,
  Collapse,
  Grid,
  Paper,
} from '@mui/material';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { Send as SendIcon, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useGetCohortAlertsQuery, useTriggerCohortAlertMutation, useGetNotificationsQuery } from '../../../services/api';

interface SessionUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  userData?: {
    role: string;
    id: string;
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

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  tags: string[];
  createdAt: string;
  sender: {
    firstName: string;
    lastName: string;
    role: string;
  };
  recipients: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function Row({ row, type }: { row: Notification | CohortAlert; type: 'notification' | 'alert' }) {
  const [open, setOpen] = useState(false);

  if (type === 'notification') {
    const notification = row as Notification;
    return (
      <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
          <TableCell>{notification.title}</TableCell>
          <TableCell>
            <Chip label={notification.type} color="primary" size="small" />
          </TableCell>
          <TableCell>{notification.sender.firstName} {notification.sender.lastName}</TableCell>
          <TableCell>{notification.recipients.length} recipients</TableCell>
          <TableCell>{format(new Date(notification.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Message:</Typography>
                    <Typography variant="body2">{notification.message}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Tags:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {notification.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Recipients:</Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {notification.recipients.map((recipient) => (
                          <TableRow key={recipient.id}>
                            <TableCell>{recipient.firstName} {recipient.lastName}</TableCell>
                            <TableCell>{recipient.email}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  } else {
    const alert = row as CohortAlert;
    return (
      <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
          <TableCell>{alert.cohortName}</TableCell>
          <TableCell sx={{ width: '200px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(alert.currentCompletion / alert.targetCompletion) * 100}
                  color={alert.status === 'WARNING' ? 'error' : alert.status === 'REMINDER' ? 'warning' : 'info'}
                />
              </Box>
              <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">
                  {`${Math.round((alert.currentCompletion / alert.targetCompletion) * 100)}%`}
                </Typography>
              </Box>
            </Box>
          </TableCell>
          <TableCell>
            <Chip
              label={alert.status}
              color={alert.status === 'WARNING' ? 'error' : alert.status === 'REMINDER' ? 'warning' : 'info'}
              size="small"
            />
          </TableCell>
          <TableCell>{alert.triggeredBy.firstName} {alert.triggeredBy.lastName}</TableCell>
          <TableCell>{format(new Date(alert.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Typography variant="h6" gutterBottom component="div">
                  Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Message:</Typography>
                    <Typography variant="body2">{alert.message}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Current Completion:</Typography>
                    <Typography variant="body2">{alert.currentCompletion.toLocaleString()} points</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">Target Completion:</Typography>
                    <Typography variant="body2">{alert.targetCompletion.toLocaleString()} points</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1">Triggered By:</Typography>
                    <Typography variant="body2">
                      {alert.triggeredBy.firstName} {alert.triggeredBy.lastName} ({alert.triggeredBy.role})
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  }
}

const CreateNotification: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Immediate debug logging
  console.log('=== Component Render ===');
  console.log('Initial Session Status:', status);
  console.log('Initial Session Data:', session);
  
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'WARNING' | 'REMINDER' | 'CAUTION'>('WARNING');
  
  // Filter states
  const [notificationType, setNotificationType] = useState('');
  const [alertStatus, setAlertStatus] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const { data: alertsData, isLoading: isLoadingAlerts } = useGetCohortAlertsQuery({
    page: page + 1,
    limit: rowsPerPage,
    status: alertStatus || undefined,
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined,
  });

  const { data: notificationsData, isLoading: isLoadingNotifications } = useGetNotificationsQuery({
    page: page + 1,
    limit: rowsPerPage,
    type: notificationType || undefined,
    startDate: dateRange.start || undefined,
    endDate: dateRange.end || undefined,
  });

  const [triggerAlert] = useTriggerCohortAlertMutation();

  // Session check effect
  React.useEffect(() => {
    console.log('=== Session Check Effect ===');
    console.log('Effect Session Status:', status);
    console.log('Effect Session Data:', session);
    
    if (status === 'loading') {
      console.log('Session is still loading...');
      return;
    }

    if (status === 'unauthenticated') {
      console.log('User is not authenticated, redirecting to login');
      router.push('/auth/signin');
      return;
    }

    // Check if user has required role
    const userRole = (session?.user as any)?.userData?.role;
    console.log('User Role:', userRole);
    
    if (!userRole) {
      console.log('No user role found in session');
      return;
    }

    const allowedRoles = ['SUPERADMIN', 'ADMIN', 'SUPPORT'];
    console.log('Allowed Roles:', allowedRoles);
    console.log('Is Role Allowed:', allowedRoles.includes(userRole));

    if (!allowedRoles.includes(userRole)) {
      console.log('User does not have required role, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }

    // If we get here, the user is authenticated and has the correct role
    console.log('User is authenticated and has correct role');
  }, [session, status, router]);

  // Show loading state while session is being checked
  if (status === 'loading') {
    console.log('Rendering loading state...');
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography>Loading session...</Typography>
      </Box>
    );
  }

  // Show loading state while data is being fetched
  if (isLoadingAlerts || isLoadingNotifications) {
    console.log('Rendering data loading state...');
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Typography>Loading data...</Typography>
      </Box>
    );
  }

  // If we get here, we know the user is authenticated and has the correct role
  console.log('Rendering main content...');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenAlertDialog = () => {
    setOpenAlertDialog(true);
  };

  const handleCloseAlertDialog = () => {
    setOpenAlertDialog(false);
    setSelectedCohort('');
    setAlertMessage('');
    setAlertType('WARNING');
  };

  const handleTriggerAlert = async () => {
    try {
      await triggerAlert({
        cohortId: selectedCohort,
        message: alertMessage,
        type: alertType,
      }).unwrap();
      handleCloseAlertDialog();
    } catch (error) {
      console.error('Failed to trigger alert:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader
          title="Notifications & Alerts"
          subheader="View notification history and course completion alerts"
        />
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="notification tabs">
              <Tab label="Notifications" />
              <Tab label="Staff Alerts" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={notificationType}
                      label="Type"
                      onChange={(e) => setNotificationType(e.target.value)}
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="GENERAL">General</MenuItem>
                      <MenuItem value="ENROLLMENT">Enrollment</MenuItem>
                      <MenuItem value="COURSE_UPDATE">Course Update</MenuItem>
                      <MenuItem value="ANNOUNCEMENT">Announcement</MenuItem>
                      <MenuItem value="REMINDER">Reminder</MenuItem>
                      <MenuItem value="APPROVAL">Approval</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Start Date"
                    type="date"
                    size="small"
                    fullWidth
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="End Date"
                    type="date"
                    size="small"
                    fullWidth
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {notificationsData?.notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No notifications found. Try adjusting your filters or check back later.
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell>Title</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Sender</TableCell>
                        <TableCell>Recipients</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {notificationsData?.notifications.map((notification: Notification) => (
                        <Row key={notification.id} row={notification} type="notification" />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={notificationsData?.total || 0}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Paper sx={{ p: 2, flex: 1, mr: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={alertStatus}
                        label="Status"
                        onChange={(e) => setAlertStatus(e.target.value)}
                      >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="WARNING">Warning</MenuItem>
                        <MenuItem value="REMINDER">Reminder</MenuItem>
                        <MenuItem value="CAUTION">Caution</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="Start Date"
                      type="date"
                      size="small"
                      fullWidth
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      label="End Date"
                      type="date"
                      size="small"
                      fullWidth
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </Paper>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SendIcon />}
                onClick={handleOpenAlertDialog}
              >
                Trigger Alert
              </Button>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Alerts are triggered at 1,000, 1,500, and 2,500 completion points to help track progress towards the 3,000 target.
            </Alert>

            {alertsData?.alerts.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No alerts found. Try adjusting your filters or check back later.
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell />
                        <TableCell>Cohort</TableCell>
                        <TableCell>Progress</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Triggered By</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {alertsData?.alerts.map((alert: CohortAlert) => (
                        <Row key={alert.id} row={alert} type="alert" />
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={alertsData?.total || 0}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </TabPanel>
        </CardContent>
      </Card>

      {/* Staff Alert Dialog */}
      <Dialog open={openAlertDialog} onClose={handleCloseAlertDialog} maxWidth="sm" fullWidth>
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
          <Button onClick={handleCloseAlertDialog}>Cancel</Button>
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
const CreateNotificationPage = () => {
  return (
    <DashboardLayout>
      <CreateNotification />
    </DashboardLayout>
  );
};

export default CreateNotificationPage; 