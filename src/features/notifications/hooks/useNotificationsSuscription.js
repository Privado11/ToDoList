import { NotificationSuscriptionService } from "@/service";
import { useState, useEffect, useCallback, useRef } from "react";

export const useNotificationsSuscription = (setNotifications) => {
  const activeSubscriptionRef = useRef(null);
  const [userId, setUserId] = useState(null);

  const subscribeToNotifications = useCallback(
    (id, getNotifications) => {
      if (activeSubscriptionRef.current && userId) {
        NotificationSuscriptionService.unsubscribeFromNotifications(userId);
      }

      setUserId(id);

      const subscription =
        NotificationSuscriptionService.subscribeToUserNotifications(id, {
          onNotificationsChange: (updatedNotifications) => {
            setNotifications(updatedNotifications);
          },
          getNotifications,
        });

      activeSubscriptionRef.current = subscription;
    },
    [setNotifications] 
  );

  const unsubscribe = useCallback(() => {
    if (activeSubscriptionRef.current && userId) {
      NotificationSuscriptionService.unsubscribeFromNotifications(userId);
      activeSubscriptionRef.current = null;
      setUserId(null);
    }
  }, [userId]);

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    subscribeToNotifications,
    unsubscribe,
  };
};
