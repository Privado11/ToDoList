import BaseService from "../base/baseService";

class NotificationSuscriptionService extends BaseService {
  static subscriptions = {
    notifications: new Map(),
  };

  static subscribeToUserNotifications(
    userId,
    { onNotificationsChange, getNotifications }
  ) {
    this.validateRequiredId(userId, "User ID");

    if (this.subscriptions.notifications.has(userId)) {
      this.unsubscribeFromNotifications(userId);
    }

    const subscription = this.supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },

        async (payload) => {
          try {
            const updatedNotification = await getNotifications(userId);
            onNotificationsChange?.(updatedNotification);
          } catch (error) {
            console.error("Error updating notifications in real-time:", error);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to notifications updates for user ${userId}`);
        }
      });

    this.subscriptions.notifications.set(userId, {
      subscription,
      handlers: {
        onChange: onNotificationsChange,
        onOptimisticUpdate: null,
        onOptimisticError: null,
      },
    });

    return subscription;
  }

  static clearSubscription(type, id) {
    const subscriptionMap = this.subscriptions[type];
    const subscriptionData = subscriptionMap.get(id);

    if (subscriptionData?.subscription) {
      subscriptionData.subscription.unsubscribe();
      subscriptionMap.delete(id);
    }
  }

  static unsubscribeFromNotifications(userId) {
    this.clearSubscription("notifications", userId);
  }

  static unsubscribeFromAll() {
    this.subscriptions.notifications.forEach(
      (subscriptionData, conversationId) => {
        subscriptionData.subscription.unsubscribe();
        console.log(
          `Unsubscribed from notifications updates for ${conversationId}`
        );
      }
    );
    this.subscriptions.notifications.clear();
  }
}

export default NotificationSuscriptionService;
