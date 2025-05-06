import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
  Collapse,
  Divider,
  Paper,
} from '@mui/material';
import {
  Mail as MailIcon,
  MarkEmailRead as MarkEmailReadIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { useMarkNotificationsAsReadMutation } from '../../../services/api';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

interface Notification {
  id: string;
  title: string;
  message: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  isRead: boolean;
  createdAt: string;
}

interface NotificationsData {
  notifications: Notification[];
}

interface NotificationPanelProps {
  notificationsData?: NotificationsData;
  onNotificationUpdate?: () => void;
}

interface GroupedNotifications {
  [key: string]: Notification[];
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ 
  notificationsData, 
  onNotificationUpdate 
}) => {
  const [markAsRead] = useMarkNotificationsAsReadMutation();
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationIds: [notificationId] });
      if (onNotificationUpdate) {
        onNotificationUpdate();
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const getStatusChip = (status: string, isRead: boolean) => {
    let color: 'default' | 'success' | 'info' | 'warning' = 'default';
    let label = status;
    let icon: React.ReactElement | undefined;

    if (status === 'DELIVERED' && isRead) {
      color = 'success';
      label = 'Read';
      icon = <CheckCircleIcon fontSize="small" />;
    } else if (status === 'DELIVERED') {
      color = 'info';
      label = 'Delivered';
      icon = <EmailIcon fontSize="small" />;
    } else if (status === 'SENT') {
      color = 'warning';
      label = 'Sent';
      icon = <MailIcon fontSize="small" />;
    }

    return (
      <Chip
        size="small"
        color={color}
        label={label}
        icon={icon}
        sx={{ ml: 1 }}
      />
    );
  };

  const getGroupTitle = (date: string) => {
    const parsedDate = parseISO(date);
    if (isToday(parsedDate)) {
      return 'Today';
    } else if (isYesterday(parsedDate)) {
      return 'Yesterday';
    }
    return format(parsedDate, 'MMMM d, yyyy');
  };

  const toggleGroup = (date: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [date]: !prev[date]
    }));
  };

  const toggleNotification = (notificationId: string) => {
    setExpandedNotification(prev => prev === notificationId ? null : notificationId);
  };

  if (!notificationsData || !notificationsData.notifications) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
        <CircularProgress />
      </Box>
    );
  }

  // Group notifications by date
  const groupedNotifications: GroupedNotifications = notificationsData.notifications.reduce((groups, notification) => {
    const date = format(parseISO(notification.createdAt), 'yyyy-MM-dd');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(notification);
    return groups;
  }, {} as GroupedNotifications);

  return (
    <List sx={{width: '100%'}}>
      {Object.entries(groupedNotifications).length > 0 ? (
        Object.entries(groupedNotifications).map(([date, notifications]) => (
          <Paper key={date} sx={{ mb: 2, overflow: 'hidden' }}>
            <ListItem 
              button 
              onClick={() => toggleGroup(date)}
              sx={{ 
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <ListItemText 
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {getGroupTitle(date)}
                  </Typography>
                }
                secondary={`${notifications.length} notification${notifications.length > 1 ? 's' : ''}`}
              />
              <IconButton edge="end">
                {expandedGroups[date] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </ListItem>
            <Collapse in={expandedGroups[date]}>
              <Divider />
              {notifications.map(notification => (
                <React.Fragment key={notification.id}>
                  <ListItem 
                    button
                    onClick={() => toggleNotification(notification.id)}
                    sx={{
                      bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                    }}
                  >
                    <ListItemIcon>
                      {notification.isRead ? (
                        <EmailIcon color="action" />
                      ) : (
                        <MailIcon color="primary" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="subtitle1">
                            {notification.title}
                          </Typography>
                          {getStatusChip(notification.status, notification.isRead)}
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography variant="body2" component="span">
                            {notification.message}
                          </Typography>
                          <Typography variant="caption" display="block" sx={{mt: 1}}>
                            {format(parseISO(notification.createdAt), 'h:mm a')}
                          </Typography>
                        </>
                      }
                    />
                    {!notification.isRead && (
                      <ListItemSecondaryAction>
                        <Tooltip title="Mark as read">
                          <IconButton 
                            edge="end" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            size="small"
                          >
                            <MarkEmailReadIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                  <Collapse in={expandedNotification === notification.id}>
                    <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Sent at {format(parseISO(notification.createdAt), 'h:mm a')}
                      </Typography>
                    </Box>
                  </Collapse>
                  <Divider />
                </React.Fragment>
              ))}
            </Collapse>
          </Paper>
        ))
      ) : (
        <ListItem>
          <ListItemText primary="No notifications found" />
        </ListItem>
      )}
    </List>
  );
};

export default NotificationPanel; 