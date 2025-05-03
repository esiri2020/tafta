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
} from '@mui/material';
import { format } from 'date-fns';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { SplashScreen } from '../../../components/splash-screen';
import { useGetNotificationsQuery } from '@/services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  createdAt: string;
  recipient: {
    firstName: string;
    lastName: string;
  };
}

const NotificationsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Fetch notifications
  const { data: notificationsData, isLoading, error } = useGetNotificationsQuery({
    page,
    limit: rowsPerPage,
  });

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) return <SplashScreen />;
  if (error) return <div>Error loading notifications</div>;
  if (!notificationsData) return <div>No Data!</div>;

  return (
    <>
      <Head>
        <title>Notifications</title>
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
              title="Applicant Notifications"
              subheader="View all notifications sent to applicants"
            />
            <CardContent>
              {notificationsData.notifications.length === 0 ? (
                <Typography color="textSecondary" align="center">
                  No notifications found
                </Typography>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Message</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Recipient</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {notificationsData.notifications.map((notification: Notification) => (
                          <TableRow key={notification.id}>
                            <TableCell>{notification.title}</TableCell>
                            <TableCell>{notification.message}</TableCell>
                            <TableCell>
                              <Chip
                                label={notification.type}
                                color={notification.type === 'ALERT' ? 'error' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={notification.status}
                                color={notification.status === 'SENT' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {notification.recipient.firstName} {notification.recipient.lastName}
                            </TableCell>
                            <TableCell>
                              {format(new Date(notification.createdAt), 'MMM d, yyyy HH:mm')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <TablePagination
                    component="div"
                    count={notificationsData.total || 0}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
};

// Add layout
NotificationsPage.getLayout = (page: React.ReactNode) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default NotificationsPage; 