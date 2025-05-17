import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuthLogic } from "@/features/auth";
import { NotificationService } from "@/service";
import NotificationGlobalService from "@/service/notification/NotificationGlobalService";
import { set } from "date-fns";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [anonymousMessage, setAnonymousMessage] = useState(null);
  const [page, setPage] = useState(0);
  const limit = 20;

  const { profile: user } = useAuthLogic();

  useEffect(() => {
    if (user?.is_anonymous) {
      setNotifications([]);
      setAnonymousMessage(
        "Notifications are only available for registered users.\nCreate a full account to access this feature."
      );
      setLoading(false);
      return;
    }

    setAnonymousMessage(null);

      if (!user) {
        setLoading(false);
        NotificationGlobalService.handleLogout();
        return;
      }
      setLoading(true);

    NotificationGlobalService.initialize(user.id);

    const unsubscribe = NotificationGlobalService.subscribe(
      (updatedNotifications) => {
        setNotifications(updatedNotifications);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  const loadMoreNotifications = useCallback(async () => {
    if (!user || user.is_anonymous || !hasMore || loading) return;

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
      toast.error("Error al cargar más notificaciones");
      console.error("Error loading more notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user, hasMore, loading, page]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!notificationId) return;
    await NotificationGlobalService.markAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(async () => {
    await NotificationGlobalService.markAllAsRead();
  }, []);

  const refreshNotifications = useCallback(() => {
    if (user) {
      setLoading(true);
      NotificationGlobalService.fetchNotifications();
    }
  }, [user]);

  return {
    notifications,
    loading,
    error,
    hasMore,
    anonymousMessage,
    refreshNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
  };
};
