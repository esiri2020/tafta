import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

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
  isRead?: boolean; // Optional, as staff alerts may not have this field
}

export const useNotifications = () => {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<StaffAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Skip notifications for mobilizers
  const shouldFetchNotifications = session?.userData?.role !== 'MOBILIZER';

  const fetchAlerts = useCallback(async () => {
    if (!shouldFetchNotifications) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/staff-alerts?page=0&limit=10');
      if (!res.ok) throw new Error('Failed to fetch staff alerts');
      const data = await res.json();
      const alerts = (data.alerts || []).map((alert: StaffAlert) => ({
        ...alert,
        isRead: alert.isRead ?? false,
      }));
      setNotifications(alerts.filter((a: StaffAlert) => !a.isRead));
      setUnreadCount(alerts.filter((n: StaffAlert) => !n.isRead).length);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch staff alerts');
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [shouldFetchNotifications]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Mark as read using the API and refetch
  const handleMarkAsRead = async (alertIds: string[]) => {
    try {
      await fetch('/api/staff-alerts/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertIds }),
      });
      await fetchAlerts();
    } catch (error) {
      console.error('Failed to mark staff alerts as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead: handleMarkAsRead,
    refetch: fetchAlerts,
  };
}; 