import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { format, parseISO } from 'date-fns';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { useGetNotificationsQuery } from '../../../services/api';

interface NotificationBroadcast {
  id: string;
  title: string;
  message: string;
  type: 'GENERAL' | 'ANNOUNCEMENT' | 'COURSE_UPDATE' | 'REMINDER' | 'APPROVAL';
  status: 'DRAFT' | 'SENT';
  sender: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  recipientCount: number;
  filterParams?: {
    gender?: string;
    applicantType?: string;
    ageRange?: string;
    cohort?: string;
  };
}

interface GroupedNotification {
  title: string;
  totalRecipients: number;
  broadcasts: NotificationBroadcast[];
  latestTimestamp: string;
}

interface RowProps {
  group: GroupedNotification;
  index: number;
  onViewDetails: (id: string) => void;
}

const Row = ({ group, index, onViewDetails }: RowProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{index + 1}</TableCell>
        <TableCell>{group.title}</TableCell>
        <TableCell align="center">{group.totalRecipients}</TableCell>
        <TableCell>
          {format(parseISO(group.latestTimestamp), 'MMM d, yyyy h:mm a')}
        </TableCell>
        <TableCell align="right">
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => onViewDetails(group.broadcasts[0].id)}
            >
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              <Typography variant="subtitle2" gutterBottom component="div">
                Message
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {group.broadcasts[0].message}
              </Typography>
              <Typography variant="subtitle2" gutterBottom component="div">
                Sent by {group.broadcasts[0].sender.firstName} {group.broadcasts[0].sender.lastName}
              </Typography>
              {group.broadcasts[0].filterParams && (
                <>
                  <Typography variant="subtitle2" gutterBottom component="div" sx={{ mt: 1 }}>
                    Filter Parameters
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {Object.entries(group.broadcasts[0].filterParams).map(([key, value]) => (
                      value && (
                        <Chip
                          key={key}
                          label={`${key}: ${value}`}
                          variant="outlined"
                          size="small"
                        />
                      )
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const NotificationsPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { data, isLoading } = useGetNotificationsQuery({
    page,
    limit: rowsPerPage,
  });

  const groupedNotifications = useMemo(() => {
    if (!data?.notifications) return [];
    
    const groups = data.notifications.reduce((acc: GroupedNotification[], broadcast: NotificationBroadcast) => {
      const existingGroup = acc.find(group => group.title === broadcast.title);
      
      if (existingGroup) {
        existingGroup.totalRecipients += broadcast.recipientCount;
        existingGroup.broadcasts.push(broadcast);
        if (new Date(broadcast.createdAt) > new Date(existingGroup.latestTimestamp)) {
          existingGroup.latestTimestamp = broadcast.createdAt;
        }
      } else {
        acc.push({
          title: broadcast.title,
          totalRecipients: broadcast.recipientCount,
          broadcasts: [broadcast],
          latestTimestamp: broadcast.createdAt,
        });
      }
      
      return acc;
    }, []);

    return groups.sort((a: GroupedNotification, b: GroupedNotification) => 
      new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime()
    );
  }, [data?.notifications]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (broadcastId: string) => {
    router.push(`/admin-dashboard/notifications/${broadcastId}`);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading notifications...</Typography>
      </Box>
    );
  }

  return (
    <>
      <Head>
        <title>Notifications | TAFTA Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Notification Broadcasts
          </Typography>

          <Card>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                    <TableCell width="50" />
                    <TableCell width="50">#</TableCell>
                          <TableCell>Title</TableCell>
                    <TableCell align="center">Total Recipients</TableCell>
                    <TableCell>Latest Sent</TableCell>
                    <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                  {groupedNotifications.map((group: GroupedNotification, index: number) => (
                    <Row
                      key={group.title}
                      group={group}
                      index={page * rowsPerPage + index}
                      onViewDetails={handleViewDetails}
                    />
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
              count={groupedNotifications.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
          </Card>
        </Box>
      </Box>
    </>
  );
};

NotificationsPage.getLayout = (page: React.ReactNode) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default NotificationsPage; 