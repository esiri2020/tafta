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
import {Mail, MailOpen} from 'lucide-react';
import {
  useGetNotificationsQuery,
  useMarkNotificationsAsReadMutation,
} from '../../../services/api';

const NotificationsPopover = ({anchorEl, onClose, open}) => {
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
    <Popover open={open} onOpenChange={onClose}>
      <PopoverContent className="w-80 p-0" align="end">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
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
              >
                Mark all as read
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`flex items-start space-x-4 rounded-lg p-2 ${
                        !notification.isRead ? 'bg-muted' : ''
                      }`}
                      onClick={() =>
                        !notification.isRead && handleMarkAsRead(notification.id)
                      }
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
                        <p className="text-sm text-muted-foreground">
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
            <div className="mt-4">
              <Button
                variant="ghost"
                className="w-full"
                asChild
              >
                <a href="/dashboard?tab=notifications">
                  See all notifications
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover; 