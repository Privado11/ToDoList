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
  const [anonymousMessage, setAnonymousMessage] = useState(null);
  const [page, setPage] = useState(0);
  const limit = 20;

  const { profile: user } = useAuthLogic();

  const {
    subscribeToNotifications,
    unsubscribe: unsubscribeFromNotifications,
  } = useNotificationsSuscription(setNotifications);


  const loadInitialNotifications = useCallback(async (userId) => {
    try {
      setLoading(true);
      const initialNotifications =
        await NotificationService.getUserNotifications(userId, {
          limit: 20,
          offset: 0,
        });
      setNotifications(initialNotifications);
      setPage(1); 
    } catch (err) {
      setError(err.message);
      console.error("Error loading initial notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
      return;
    }



    loadInitialNotifications(user.id);


    subscribeToNotifications(user.id, () =>
      NotificationService.getUserNotifications(user.id, {
        limit: 20,
        offset: 0,
      })
    );

    return () => {
      unsubscribeFromNotifications();
    };
  }, [
    user,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    loadInitialNotifications,
  ]);

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

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId || !user?.id) return; // ✅ Validación añadida

      try {
        await NotificationService.markNotificationAsRead(
          notificationId,
          user.id
        );
      } catch (err) {
        console.error("Error marking notification as read:", err);
        toast.error("Error al marcar notificación como leída");
      }
    },
    [user]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;  

    try {
      await NotificationService.markAllNotificationsAsRead(user.id);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      toast.error("Error al marcar todas las notificaciones como leídas");
    }
  }, [user]);

  const refreshNotifications = useCallback(() => {
    if (user?.id) {
      loadInitialNotifications(user.id);
    }
  }, [user, loadInitialNotifications]);

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
