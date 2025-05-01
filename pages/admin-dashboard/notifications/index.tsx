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
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Tabs,
  Tab,
  Button,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Send as SendIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useGetNotificationsQuery, useArchiveNotificationMutation } from '../../../services/api';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';

interface NotificationStatus {
  DRAFT: 'DRAFT';
  SENT: 'SENT';
  DELIVERED: 'DELIVERED';
  FAILED: 'FAILED';
  ARCHIVED: 'ARCHIVED';
}

interface NotificationType {
  GENERAL: 'GENERAL';
  ENROLLMENT: 'ENROLLMENT';
  COURSE_UPDATE: 'COURSE_UPDATE';
  ANNOUNCEMENT: 'ANNOUNCEMENT';
  REMINDER: 'REMINDER';
  APPROVAL: 'APPROVAL';
}

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  status: keyof NotificationStatus;
  type: keyof NotificationType;
  tags: string[];
  sender: {
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const NotificationOverview: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);

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

  // Fetch notifications with filters
  const { data, isLoading, error } = useGetNotificationsQuery({
    page,
    limit: rowsPerPage,
    search: searchQuery,
    status: statusFilter,
    type: typeFilter,
    tag: tagFilter,
  });

  const [archiveNotification] = useArchiveNotificationMutation();

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setStatusFilter(newValue === 0 ? 'SENT' : 'DRAFT');
  };

  const handleArchive = async (notificationId: string) => {
    try {
      await archiveNotification(notificationId).unwrap();
    } catch (error) {
      console.error('Failed to archive notification:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'DELIVERED':
        return 'info';
      case 'FAILED':
        return 'error';
      case 'ARCHIVED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return 'primary';
      case 'ENROLLMENT':
        return 'secondary';
      case 'COURSE_UPDATE':
        return 'info';
      case 'REMINDER':
        return 'warning';
      case 'APPROVAL':
        return 'success';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error loading notifications</Typography>;
  }

  // Get unique tags from all notifications
  const allTags: string[] = Array.from(
    new Set(data?.notifications.flatMap((n: Notification) => n.tags) || [])
  );

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader
          title="Notification Management"
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<SendIcon />}
              onClick={() => router.push('/admin-dashboard/notifications/create')}
            >
              Create Notification
            </Button>
          }
        />
        <CardContent>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Sent Notifications" />
            <Tab label="Drafts" />
          </Tabs>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, minWidth: '200px' }}
            />

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="GENERAL">General</MenuItem>
                <MenuItem value="ENROLLMENT">Enrollment</MenuItem>
                <MenuItem value="COURSE_UPDATE">Course Update</MenuItem>
                <MenuItem value="ANNOUNCEMENT">Announcement</MenuItem>
                <MenuItem value="REMINDER">Reminder</MenuItem>
                <MenuItem value="APPROVAL">Approval</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Tag</InputLabel>
              <Select
                value={tagFilter}
                label="Tag"
                onChange={(e) => setTagFilter(e.target.value)}
              >
                <MenuItem value="">All Tags</MenuItem>
                {allTags.map((tag) => (
                  <MenuItem key={tag} value={tag}>
                    {tag}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Sender</TableCell>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.notifications.map((notification: Notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>{notification.title}</TableCell>
                    <TableCell>
                      {notification.sender.firstName} {notification.sender.lastName}
                      <br />
                      <Typography variant="caption" color="textSecondary">
                        {notification.sender.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {notification.recipient.firstName} {notification.recipient.lastName}
                      <br />
                      <Typography variant="caption" color="textSecondary">
                        {notification.recipient.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.type}
                        color={getTypeColor(notification.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.status}
                        color={getStatusColor(notification.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {notification.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      {format(new Date(notification.createdAt), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Archive">
                        <IconButton
                          size="small"
                          onClick={() => handleArchive(notification.id)}
                          disabled={notification.status === 'ARCHIVED'}
                        >
                          <ArchiveIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={data?.count || 0}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

// Wrap the component with DashboardLayout
const NotificationsPage = () => {
  return (
    <DashboardLayout>
      <NotificationOverview />
    </DashboardLayout>
  );
};

export default NotificationsPage; 