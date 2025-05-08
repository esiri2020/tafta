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
  Button,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Message as MessageIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { format, parseISO } from 'date-fns';
import { useGetNotificationsQuery, useMarkNotificationsAsReadMutation } from '../../../services/api';

interface StaffAlert {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT';
  sender: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  isRead: boolean;
}

interface NotificationsPopoverProps {
  notifications: StaffAlert[];
  open: boolean;
  onClose: () => void;
  onMarkAsRead: (notificationIds: string[]) => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  notifications,
  open,
  onClose,
  onMarkAsRead,
}) => {
  const router = useRouter();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Group alerts by title and sender
  const groupedAlerts = notifications.reduce((groups, alert) => {
    const key = `${alert.title}-${alert.sender.firstName}-${alert.sender.lastName}-${alert.createdAt}`;
    if (!groups[key]) {
      groups[key] = {
        ...alert,
        count: 1,
        ids: [alert.id],
      };
    } else {
      groups[key].count++;
      groups[key].ids.push(alert.id);
    }
    return groups;
  }, {} as Record<string, StaffAlert & { count: number; ids: string[] }>);

  const handleAlertClick = async (alertIds: string[]) => {
    onMarkAsRead(alertIds);
    router.push('/admin-dashboard/notifications/alerts');
    onClose();
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = notifications
      .filter(n => !n.isRead)
      .map(n => n.id);
    
    if (unreadIds.length > 0) {
      onMarkAsRead(unreadIds);
      onClose();
    }
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
        sx: {
          width: 360,
          maxHeight: 480,
          overflow: 'auto',
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Staff Alerts</Typography>
        {unreadCount > 0 && (
          <Button
            size="small"
            onClick={handleMarkAllAsRead}
            sx={{ textTransform: 'none' }}
          >
            Mark all as read
          </Button>
        )}
      </Box>
      <Divider />
      <List sx={{ p: 0 }}>
        {Object.values(groupedAlerts).length > 0 ? (
          Object.values(groupedAlerts).map((alert) => (
            <ListItem
              key={alert.id}
              button
              onClick={() => handleAlertClick(alert.ids)}
              sx={{
                backgroundColor: alert.isRead ? 'inherit' : 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
              }}
            >
              <ListItemIcon>
                {alert.type === 'ALERT' ? (
                  <WarningIcon color="error" />
                ) : alert.type === 'WARNING' ? (
                  <WarningIcon color="warning" />
                ) : (
                  <MessageIcon color="info" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" component="span">
                      {alert.title}
                    </Typography>
                    <Badge
                      badgeContent={alert.count}
                      color="primary"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                }
                secondary={
                  <Typography
                    component="span"
                    variant="caption"
                    color="text.secondary"
                  >
                    {`From: ${alert.sender.firstName} ${alert.sender.lastName} • ${format(parseISO(alert.createdAt), 'MMM d, h:mm a')}`}
                  </Typography>
                }
              />
              <IconButton size="small">
                <ArrowForwardIcon fontSize="small" />
              </IconButton>
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText
              primary={
                <Typography color="text.secondary">
                  No alerts
                </Typography>
              }
            />
          </ListItem>
        )}
      </List>
    </Popover>
  );
};

export default NotificationsPopover; 