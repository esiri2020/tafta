import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { DashboardLayout } from '../../../components/dashboard/dashboard-layout';
import { useGetNotificationsQuery } from '../../../services/api';

interface Recipient {
  id: string;
  firstName: string;
  lastName: string;
  status: 'DELIVERED' | 'READ';
}

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
  recipients?: Recipient[];
}

const NotificationDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { data, isLoading } = useGetNotificationsQuery({
    page: 0,
    limit: 1,
    id: id as string,
  }, {
    skip: !id,
  });

  const broadcast = data?.notifications?.[0];

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading notification details...</Typography>
      </Box>
    );
  }

  if (!broadcast) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Notification not found</Typography>
      </Box>
    );
  }

  const getTypeChip = (type: NotificationBroadcast['type']) => {
    const typeColors: Record<NotificationBroadcast['type'], 'default' | 'primary' | 'info' | 'warning' | 'success'> = {
      GENERAL: 'default',
      ANNOUNCEMENT: 'primary',
      COURSE_UPDATE: 'info',
      REMINDER: 'warning',
      APPROVAL: 'success',
    };
    return (
      <Chip
        label={type.replace('_', ' ')}
        color={typeColors[type as keyof typeof typeColors]}
        size="small"
      />
    );
  };

  const getStatusChip = (status: string) => {
    return (
      <Chip
        label={status}
        color={status === 'SENT' ? 'success' : 'default'}
        size="small"
      />
    );
  };

  // Calculate pagination for recipients
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRecipients = broadcast.recipients?.slice(startIndex, endIndex) || [];

  return (
    <>
      <Head>
        <title>Notification Details | TAFTA Admin</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Box sx={{ p: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ mb: 3 }}
          >
            Back to Notifications
          </Button>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom>
                    {broadcast.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      Sent by {broadcast.sender.firstName} {broadcast.sender.lastName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ScheduleIcon sx={{ mr: 1 }} />
                    <Typography variant="subtitle1">
                      {format(parseISO(broadcast.createdAt), 'MMM d, yyyy h:mm a')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    {getTypeChip(broadcast.type)}
                    {getStatusChip(broadcast.status)}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Message
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {broadcast.message}
                  </Typography>
                </Grid>

                {broadcast.filterParams && (
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Filter Parameters
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {Object.entries(broadcast.filterParams).map(([key, value]) => (
                        value && (
                          <Chip
                            key={key}
                            label={`${key}: ${value}`}
                            variant="outlined"
                          />
                        )
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recipients ({broadcast.recipientCount})
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="50">#</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedRecipients.map((recipient: Recipient, index: number) => (
                      <TableRow key={recipient.id}>
                        <TableCell>{startIndex + index + 1}</TableCell>
                        <TableCell>
                          {recipient.firstName} {recipient.lastName}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={recipient.status}
                            color={recipient.status === 'READ' ? 'success' : 'default'}
                            size="small"
                            icon={recipient.status === 'READ' ? <CheckCircleIcon /> : <ScheduleIcon />}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={broadcast.recipientCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
};

NotificationDetailsPage.getLayout = (page: React.ReactNode) => (
  <DashboardLayout>{page}</DashboardLayout>
);

export default NotificationDetailsPage; 