import React, {useEffect} from 'react';
import {Badge, IconButton, Tooltip} from '@mui/material';
import {Notifications as NotificationsIcon} from '@mui/icons-material';
import {useGetNotificationsQuery} from '../../../services/api';

export const NotificationBadge = ({onClick}) => {
  const {data, refetch} = useGetNotificationsQuery({
    page: 0,
    limit: 1, // Just need to count, not retrieve all notifications
    isRead: false, // Only unread notifications
  });

  // Periodically check for new notifications
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [refetch]);

  const unreadCount = data?.count || 0;

  return (
    <Tooltip
      title={
        unreadCount > 0
          ? `${unreadCount} unread notifications`
          : 'No new notifications'
      }>
      <IconButton color='inherit' onClick={onClick}>
        <Badge badgeContent={unreadCount} color='error' max={99}>
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};
