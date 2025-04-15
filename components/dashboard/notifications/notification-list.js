import React, {useState} from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  Pagination,
  Avatar,
  Chip,
  IconButton,
  Badge,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Announcement as AnnouncementIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  School as SchoolIcon,
  AccessTime as AccessTimeIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';
import {format} from 'date-fns';
import {
  useGetNotificationsQuery,
  useMarkNotificationsAsReadMutation,
  useDeleteNotificationsMutation,
} from '../../../services/api';

export const NotificationList = ({limit = 5}) => {
  const [page, setPage] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const {data, error, isLoading} = useGetNotificationsQuery({
    page,
    limit,
    isRead: showUnreadOnly ? false : undefined,
  });

  const [markAsRead] = useMarkNotificationsAsReadMutation();
  const [deleteNotifications] = useDeleteNotificationsMutation();

  const handlePageChange = (event, newPage) => {
    setPage(newPage - 1); // Pagination component is 1-indexed, but our API is 0-indexed
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAsRead({markAllAsRead: true}).unwrap();
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  const handleMarkAsRead = async notificationId => {
    try {
      await markAsRead({notificationIds: [notificationId]}).unwrap();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleDelete = async notificationId => {
    try {
      await deleteNotifications({notificationIds: [notificationId]}).unwrap();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Get the appropriate icon based on notification type
  const getNotificationIcon = type => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return <AnnouncementIcon />;
      case 'COURSE_UPDATE':
        return <SchoolIcon />;
      case 'REMINDER':
        return <AccessTimeIcon />;
      case 'APPROVAL':
        return <CheckCircleIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  // Get color based on notification type
  const getNotificationColor = type => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return 'primary';
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

  // Format the notification time
  const formatNotificationTime = createdAt => {
    try {
      return format(new Date(createdAt), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return 'Unknown time';
    }
  };

  const notifications = data?.notifications || [];
  const totalCount = data?.count || 0;
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const totalPages = Math.ceil(totalCount / limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader title='Notifications' />
        <Divider />
        <CardContent>
          <Typography>Loading notifications...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader title='Notifications' />
        <Divider />
        <CardContent>
          <Typography color='error'>
            Error loading notifications: {error.message}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title={
          <Box display='flex' alignItems='center'>
            <NotificationsIcon sx={{mr: 1}} />
            <Typography variant='h6'>
              Notifications
              {unreadCount > 0 && (
                <Badge badgeContent={unreadCount} color='error' sx={{ml: 1}} />
              )}
            </Typography>
          </Box>
        }
        action={
          <Box>
            <Button
              size='small'
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              startIcon={
                showUnreadOnly ? (
                  <NotificationsIcon />
                ) : (
                  <NotificationsActiveIcon />
                )
              }>
              {showUnreadOnly ? 'Show All' : 'Unread Only'}
            </Button>
            {unreadCount > 0 && (
              <Button
                size='small'
                onClick={handleMarkAllAsRead}
                startIcon={<MarkEmailReadIcon />}
                sx={{ml: 1}}>
                Mark All Read
              </Button>
            )}
          </Box>
        }
      />
      <Divider />
      <CardContent sx={{p: 0}}>
        {notifications.length === 0 ? (
          <Box p={3} textAlign='center'>
            <Typography color='textSecondary'>
              {showUnreadOnly
                ? 'You have no unread notifications'
                : 'You have no notifications'}
            </Typography>
          </Box>
        ) : (
          <List sx={{width: '100%'}}>
            {notifications.map(notification => (
              <React.Fragment key={notification.id}>
                <ListItem
                  alignItems='flex-start'
                  secondaryAction={
                    <Stack direction='row' spacing={1}>
                      {!notification.isRead && (
                        <Tooltip title='Mark as read'>
                          <IconButton
                            edge='end'
                            size='small'
                            onClick={() => handleMarkAsRead(notification.id)}>
                            <CheckIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title='Delete'>
                        <IconButton
                          edge='end'
                          size='small'
                          onClick={() => handleDelete(notification.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                  sx={{
                    bgcolor: notification.isRead
                      ? 'transparent'
                      : 'action.hover',
                    borderLeft: notification.isRead
                      ? 'none'
                      : `4px solid ${theme =>
                          theme.palette[getNotificationColor(notification.type)]
                            .main}`,
                  }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: theme =>
                          theme.palette[getNotificationColor(notification.type)]
                            .main,
                      }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        display='flex'
                        justifyContent='space-between'
                        alignItems='center'>
                        <Typography
                          variant='subtitle1'
                          component='span'
                          fontWeight={notification.isRead ? 'normal' : 'bold'}>
                          {notification.title}
                        </Typography>
                        <Chip
                          label={notification.type.replace('_', ' ')}
                          size='small'
                          color={getNotificationColor(notification.type)}
                          variant='outlined'
                        />
                      </Box>
                    }
                    secondary={
                      <React.Fragment>
                        <Typography
                          variant='body2'
                          component='span'
                          display='block'
                          color='text.primary'>
                          {notification.message}
                        </Typography>
                        <Box
                          display='flex'
                          justifyContent='space-between'
                          alignItems='center'
                          mt={1}>
                          <Typography variant='caption' color='text.secondary'>
                            From: {notification.sender.firstName}{' '}
                            {notification.sender.lastName}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {formatNotificationTime(notification.createdAt)}
                          </Typography>
                        </Box>
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider component='li' />
              </React.Fragment>
            ))}
          </List>
        )}
        {totalPages > 1 && (
          <Box display='flex' justifyContent='center' py={2}>
            <Pagination
              count={totalPages}
              page={page + 1} // Convert 0-indexed to 1-indexed for the UI
              onChange={handlePageChange}
              color='primary'
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
