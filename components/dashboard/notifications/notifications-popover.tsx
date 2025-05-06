import React from 'react';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Message as MessageIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { format, parseISO } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'ALERT' | 'NOTIFICATION';
  sender: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  isRead: boolean;
}

interface NotificationsPopoverProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  notifications,
  open,
  onClose,
}) => {
  const router = useRouter();

  const handleNotificationClick = (notification: Notification) => {
    onClose();
    if (notification.type === 'ALERT') {
      router.push('/admin-dashboard/notifications/alerts');
    } else {
      router.push('/admin-dashboard/notifications');
    }
  };

  const getNotificationSummary = (notification: Notification) => {
    const senderName = `${notification.sender.firstName} ${notification.sender.lastName}`;
    return notification.type === 'ALERT'
      ? `${senderName} sent an alert`
      : `${senderName} sent a notification`;
  };

  return (
    <Popover
      open={open}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      PaperProps={{
        sx: { width: 360, maxHeight: 480 },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Notifications</Typography>
        <Badge badgeContent={notifications?.filter(n => !n.isRead).length || 0} color="error">
          <NotificationsIcon />
        </Badge>
      </Box>
      <Divider />
      <List sx={{ p: 0 }}>
        {notifications && notifications.length > 0 ? (
          notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <ListItemIcon>
                  {notification.type === 'ALERT' ? (
                    <WarningIcon color="warning" />
                  ) : (
                    <MessageIcon color="primary" />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={getNotificationSummary(notification)}
                  secondary={format(parseISO(notification.createdAt), 'h:mm a')}
                />
                <IconButton size="small">
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No notifications" />
          </ListItem>
        )}
      </List>
    </Popover>
  );
};

export default NotificationsPopover; 