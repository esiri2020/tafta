import React, { useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Typography,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
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
  Alert,
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import toast from 'react-hot-toast';

interface StaffAlert {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT';
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

const StaffAlertsPage = () => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    message: '',
    type: 'ALERT' as StaffAlert['type'],
  });
  const [alerts, setAlerts] = useState<StaffAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [allStaffChecked, setAllStaffChecked] = useState(false);

  // Fetch alerts
  React.useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/staff-alerts?page=0&limit=10');
        if (!response.ok) {
          throw new Error('Failed to fetch alerts');
        }
        const data = await response.json();
        setAlerts(data.alerts);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch alerts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, []);

  // Fetch all staff when dialog opens
  React.useEffect(() => {
    if (isCreateDialogOpen) {
      fetch('/api/users?filter=ADMIN')
        .then(res => res.json())
        .then(data => {
          let staff: Staff[] = data.users || [];
          // Fetch SUPERADMIN and SUPPORT as well
          Promise.all([
            fetch('/api/users?filter=SUPERADMIN').then(res => res.json()),
            fetch('/api/users?filter=SUPPORT').then(res => res.json()),
          ]).then(([superadmins, supports]) => {
            staff = [
              ...staff,
              ...(superadmins.users || []),
              ...(supports.users || []),
            ];
            // Remove duplicates by id
            const uniqueStaff = Array.from(new Map(staff.map((s: Staff) => [s.id, s])).values());
            setStaffList(uniqueStaff);
          });
        });
    }
  }, [isCreateDialogOpen]);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleCreateAlert = async () => {
    const toastId = toast.loading('Sending alert...');
    try {
      setError(null);
      const response = await fetch('/api/staff-alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newAlert.title,
          message: newAlert.message,
          type: newAlert.type,
          recipientIds: allStaffChecked ? [] : selectedStaff,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create alert');
      }

      const newAlertData = await response.json();
      setAlerts(prev => [newAlertData, ...prev]);
      setIsCreateDialogOpen(false);
      setNewAlert({
        title: '',
        message: '',
        type: 'ALERT',
      });
      toast.success('Staff alert sent!');
    } catch (error) {
      console.error('Error creating alert:', error);
      setError(error instanceof Error ? error.message : 'Failed to create alert');
      toast.error('Failed to send staff alert');
    } finally {
      toast.dismiss(toastId);
    }
  };

  const getTypeChip = (type: StaffAlert['type']) => {
    const typeConfig = {
      INFO: { color: 'info', icon: <CheckCircleIcon /> },
      WARNING: { color: 'warning', icon: <WarningIcon /> },
      ALERT: { color: 'error', icon: <WarningIcon /> },
    };

    return (
      <Chip
        icon={typeConfig[type].icon}
        label={type}
        color={typeConfig[type].color as any}
        size="small"
      />
    );
  };

  const handleStaffCheck = (id: string) => {
    setSelectedStaff(prev => {
      if (prev.includes(id)) {
        return prev.filter(sid => sid !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  const handleAllStaffCheck = () => {
    if (allStaffChecked) {
      setSelectedStaff([]);
      setAllStaffChecked(false);
    } else {
      setSelectedStaff(staffList.map((s: Staff) => s.id));
      setAllStaffChecked(true);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Staff Alerts | TAFTA Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              Staff Alerts
            </Typography>
                <Button
                  variant="contained"
              startIcon={<AddIcon />}
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  Create Alert
                </Button>
          </Box>

          <Card>
            <Box sx={{ p: 2 }}>
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                    <Accordion
                      key={alert.id}
                    expanded={expanded === alert.id}
                    onChange={handleChange(alert.id)}
                    sx={{
                      '&:not(:last-child)': {
                        mb: 2,
                      },
                      '&:before': {
                        display: 'none',
                      },
                    }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                            backgroundColor: 'action.hover',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar
                          src={alert.sender.image}
                          sx={{ mr: 2 }}
                        >
                          {alert.sender.firstName[0]}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1">
                            {alert.title}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                            {getTypeChip(alert.type)}
                            <Typography variant="caption" color="text.secondary">
                              {format(parseISO(alert.createdAt), 'MMM d, yyyy h:mm a')}
                            </Typography>
                          </Box>
                        </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                            {alert.message}
                          </Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          Sent by: {alert.sender.firstName} {alert.sender.lastName}
                          </Typography>
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                ))
              ) : (
                <Typography color="text.secondary" sx={{ p: 2 }}>
                  No staff alerts
                </Typography>
              )}
                </Box>
          </Card>
        </Box>
      </Box>

          {/* Create Alert Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create Staff Alert</DialogTitle>
            <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={newAlert.title}
              onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
              required
            />
                <TextField
                  fullWidth
              label="Message"
                  multiline
                  rows={4}
              value={newAlert.message}
              onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newAlert.type}
                label="Type"
                onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as StaffAlert['type'] })}
              >
                <MenuItem value="INFO">Info</MenuItem>
                <MenuItem value="WARNING">Warning</MenuItem>
                <MenuItem value="ALERT">Alert</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Recipients</InputLabel>
              <Select
                multiple
                value={allStaffChecked ? staffList.map(s => s.id) : selectedStaff}
                renderValue={selected =>
                  allStaffChecked
                    ? 'All Staff'
                    : selected
                        .map(id => {
                          const staff = staffList.find(s => s.id === id);
                          return staff ? `${staff.firstName} ${staff.lastName}` : '';
                        })
                        .join(', ')
                }
                label="Recipients"
              >
                <MenuItem value="all">
                  <Checkbox checked={allStaffChecked} onChange={handleAllStaffCheck} />
                  <ListItemText primary="All Staff" />
                </MenuItem>
                {staffList.map(staff => (
                  <MenuItem key={staff.id} value={staff.id} disabled={allStaffChecked}>
                    <Checkbox checked={selectedStaff.includes(staff.id) || allStaffChecked} onChange={() => handleStaffCheck(staff.id)} />
                    <ListItemText primary={`${staff.firstName} ${staff.lastName}`} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateAlert}
            disabled={!newAlert.title || !newAlert.message}
          >
                Create Alert
              </Button>
            </DialogActions>
          </Dialog>
    </>
  );
};

StaffAlertsPage.getLayout = (page: React.ReactNode) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default StaffAlertsPage; 