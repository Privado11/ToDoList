import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { NotificationService } from "@/service";

import { useNotificationsSuscription } from "./useNotificationsSuscription";
import { useProfile } from "@/features/users";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [page, setPage] = useState(0);
  const limit = 20;

  const { profile: user } = useProfile();

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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
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
      console.error("Error loading more notifications:", err);
      toast.error("Error loading more notifications", {
        description: "Please try again later",
        action: {
          label: "Retry",
          onClick: () => loadMoreNotifications(),
        },
      });
    } finally {
      setLoading(false);
    }
  }, [user, hasMore, loading, page]);

  const markAsRead = useCallback(
    async (notificationId) => {
      if (!notificationId || !user?.id) return;

      const originalNotifications = [...notifications];
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );

      try {
        await NotificationService.markNotificationAsRead(
          notificationId,
          user.id
        );

        toast.success("Notification marked as read", {
          description: "Your notification has been updated",
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });
      } catch (err) {
        setNotifications(originalNotifications);

        toast.error("Error marking notification as read", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => markAsRead(notificationId),
          },
        });
      }
    },
    [user, notifications]
  );

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    const originalNotifications = [...notifications];
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, is_read: true }))
    );

    try {
      await NotificationService.markAllNotificationsAsRead(user.id);

      toast.success("All notifications marked as read", {
        description: "Your notification inbox is now up to date",
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
    } catch (err) {
      setNotifications(originalNotifications);

      toast.error("Error marking all notifications as read", {
        description: "Please try again later",
        action: {
          label: "Retry",
          onClick: () => markAllAsRead(),
        },
      });
    }
  }, [user, notifications]);

  const refreshNotifications = useCallback(() => {
    if (user?.id) {
      loadInitialNotifications(user.id);
    }
  }, [user, loadInitialNotifications]);

  const getUserNotificationsPreferences = useCallback(async () => {
    if (!user) return {};

    try {
      const preferences =
        await NotificationService.getUserNotificationPreferences(user.id);

      setPreferences(preferences);
      return preferences;
    } catch (err) {
      return {};
    }
  }, [user]);

  const updateUserNotificationsPreferences = useCallback(
    async (newPreferences) => {
      if (!user) return;

      setLoading(true);

      const previousPreferences = { ...preferences };
      setPreferences(newPreferences);

      try {
        const updatedPreferences =
          await NotificationService.updateUserNotificationPreferences(
            user.id,
            newPreferences
          );

        setPreferences(updatedPreferences);

        toast.success("Notification preferences updated", {
          description: "Your settings have been saved successfully",
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });
      } catch (err) {
        setPreferences(previousPreferences);
        toast.error("Failed to update notification preferences", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => updateUserNotificationsPreferences(newPreferences),
          },
        });
      } finally {
        setLoading(false);
      }
    },
    [user, preferences]
  );

  const deleteNotification = useCallback(
    async (notificationId) => {
      if (!notificationId || !user?.id) return;

      const notificationToDelete = notifications.find(
        (notification) => notification.id === notificationId
      );
      const originalNotifications = [...notifications];

      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId)
      );

      try {
        await NotificationService.deleteNotification(notificationId);

        toast.success("Notification deleted", {
          description: `Notification has been removed successfully`,
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });
      } catch (err) {
        setNotifications(originalNotifications);

        toast.error("Error deleting notification", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => deleteNotification(notificationId),
          },
        });
      }
    },
    [user, notifications]
  );

  return {
    notifications,
    loading,
    error,
    hasMore,
    refreshNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    preferences,
    getUserNotificationsPreferences,
    updateUserNotificationsPreferences,
    deleteNotification,
  };
};
