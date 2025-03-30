import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuthLogic } from "@/features/auth";
import { NotificationService } from "@/service";
import { useNotificationsSuscription } from "./useNotificationsSuscription";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const limit = 20;

  const { user } = useAuthLogic();

  const {
    subscribeToNotifications,
    unsubscribe: unsubscribeFromNotifications,
  } = useNotificationsSuscription(setNotifications);

  useEffect(() => {
    if (!user) return;

    subscribeToNotifications(user.id, () =>
      NotificationService.getUserNotifications(user.id)
    );

    return () => {
      unsubscribeFromNotifications();
    };
  }, [user, subscribeToNotifications, unsubscribeFromNotifications]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const data = await NotificationService.getUserNotifications(user.id, {
        limit,
        offset: 0,
      });
      setNotifications(data);
      setHasMore(data.length === limit);
      setPage(1);
    } catch (err) {
      setError(err.message);
      toast.error("Error loading notifications");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadMoreNotifications = useCallback(async () => {
    if (!user || !hasMore || loading) return;

    setLoading(true);
    try {
      const nextOffset = page * limit;
      const newData = await NotificationService.getUserNotifications(user.id, {
        limit,
        offset: nextOffset,
      });

      if (newData.length < limit) {
        setHasMore(false);
      }

      setNotifications((prev) => [...prev, ...newData]);
      setPage((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
      toast.error("Error loading more notifications");
      console.error("Error loading more notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user, hasMore, loading, page]);

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!user || !notificationId) return;

      try {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, is_read: true }
              : notification
          )
        );

        await NotificationService.markNotificationAsRead(
          notificationId,
          user.id
        );
      } catch (err) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId && notification.is_read
              ? { ...notification, is_read: false }
              : notification
          )
        );
        toast.error("Error marking notification as read");
        console.error("Error marking notification as read:", err);
      }
    },
    [user]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    const originalNotifications = [...notifications];

    try {
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true }))
      );

      await NotificationService.markAllNotificationsAsRead(user.id);
      toast.success("All notifications marked as read");
    } catch (err) {
      setNotifications(originalNotifications);
      toast.error("Error marking all notifications as read");
      console.error("Error marking all notifications as read:", err);
    }
  }, [user, notifications]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  return {
    notifications,
    loading,
    error,
    hasMore,
    fetchNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
  };
};
