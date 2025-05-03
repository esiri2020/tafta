import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Typography,
  Badge,
} from '@mui/material';
import {Mail as MailIcon, MailOpen as MailOpenIcon} from '@mui/icons-material';
import {
  useGetNotificationsQuery,
  useMarkNotificationsAsReadMutation,
} from '../../../services/api';

export const NotificationsPopover = props => {
  const {anchorEl, onClose, open, ...other} = props;
  const {data, isLoading, refetch} = useGetNotificationsQuery({
    page: 0,
    limit: 5,
  });

  const [markAsRead] = useMarkNotificationsAsReadMutation();

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAsRead({markAllAsRead: true});
      refetch();
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  const handleMarkAsRead = async notificationId => {
    try {
      await markAsRead({notificationIds: [notificationId]});
      refetch();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const notifications = data?.notifications || [];
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'center',
        vertical: 'bottom',
      }}
      onClose={onClose}
      open={open}
      PaperProps={{sx: {width: 320}}}
      transitionDuration={0}
      {...other}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
        }}>
        <Typography variant='h6'>
          Notifications
          {unreadCount > 0 && (
            <Badge badgeContent={unreadCount} color='error' sx={{ml: 1}} />
          )}
        </Typography>
        {unreadCount > 0 && (
          <Button color='primary' size='small' onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </Box>
      <Divider />
      {isLoading ? (
        <Box sx={{p: 2, textAlign: 'center'}}>
          <Typography variant='body2'>Loading notifications...</Typography>
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{p: 2, textAlign: 'center'}}>
          <Typography variant='body2'>No notifications</Typography>
        </Box>
      ) : (
        <List disablePadding>
          {notifications.map(notification => (
            <ListItem
              divider
              key={notification.id}
              onClick={() =>
                !notification.isRead && handleMarkAsRead(notification.id)
              }
              sx={{
                backgroundColor: notification.isRead
                  ? 'transparent'
                  : 'action.hover',
                cursor: !notification.isRead ? 'pointer' : 'default',
              }}>
              <ListItemIcon>
                {notification.isRead ? (
                  <MailIcon color='disabled' />
                ) : (
                  <MailOpenIcon color='primary' />
                )}
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={
                  <>
                    <Typography variant='body2' component='span'>
                      {notification.message}
                    </Typography>
                    <Typography variant='caption' display='block' sx={{mt: 1}}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
      <Box sx={{p: 1}}>
        <Button
          color='primary'
          fullWidth
          variant='text'
          component='a'
          href='/dashboard?tab=notifications'>
          See all notifications
        </Button>
      </Box>
    </Popover>
  );
};

NotificationsPopover.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.bool,
}; 