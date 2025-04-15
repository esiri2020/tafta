import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {Mail, MailOpen} from 'lucide-react';

export const NotificationPanel = ({notificationsData}) => {
  if (!notificationsData || !notificationsData.notifications) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', p: 3}}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <List sx={{width: '100%'}}>
      {notificationsData.notifications.length > 0 ? (
        notificationsData.notifications.map(notification => (
          <ListItem key={notification.id} divider>
            <ListItemIcon>
              {notification.isRead ? (
                <MailOpen size={24} color='#757575' />
              ) : (
                <Mail size={24} color='#1976d2' />
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
        ))
      ) : (
        <ListItem>
          <ListItemText primary='No notifications found' />
        </ListItem>
      )}
    </List>
  );
};
