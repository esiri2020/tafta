import React, {useEffect} from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Badge} from '@/components/ui/badge';
import {Mail, MailOpen, Bell} from 'lucide-react';
import {
  useGetNotificationsQuery,
  useMarkNotificationsAsReadMutation,
} from '../../../services/api';
import {useRouter} from 'next/router';

const NotificationsPopover = ({open, onClose}) => {
  const router = useRouter();
  const {data, isLoading, refetch} = useGetNotificationsQuery({
    page: 0,
    limit: 5,
    isRead: false, // Only fetch unread notifications for the popover
  });

  const [markAsRead] = useMarkNotificationsAsReadMutation();

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  // Add polling for new notifications with shorter interval
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 10000); // Check for new notifications every 10 seconds

    return () => clearInterval(interval);
  }, [refetch]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAsRead({markAllAsRead: true});
      refetch();
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  };

  const handleMarkAsRead = async (notificationId, relatedEntityId) => {
    try {
      await markAsRead({notificationIds: [notificationId]});
      refetch();
      
      // If there's a related entity, navigate to it
      if (relatedEntityId) {
        router.push(`/dashboard?entity=${relatedEntityId}`);
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const notifications = data?.notifications || [];
  const unreadCount = notifications.length;

  return (
    <Popover open={open} onOpenChange={onClose}>
      <PopoverContent className="w-96 p-0" align="end" sideOffset={5}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b">
            <CardTitle className="text-sm font-medium flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Mark all as read
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No new notifications
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                        !notification.isRead ? 'bg-muted/30' : ''
                      }`}
                      onClick={() => handleMarkAsRead(notification.id, notification.relatedEntityId)}
                    >
                      <div className="mt-1">
                        {notification.isRead ? (
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <MailOpen className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => {
                  onClose();
                  router.push('/dashboard/notifications');
                }}
              >
                View all notifications
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover; 