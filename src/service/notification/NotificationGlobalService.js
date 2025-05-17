import NotificationService from "./NotificationService";
import NotificationSuscriptionService from "./NotificationSuscriptionService";


class NotificationGlobalService {
  static instance = null;
  static subscribers = new Set();
  static currentUserId = null;
  static isSubscribed = false;
  static notifications = [];

  static initialize(userId) {
    if (!userId || userId === this.currentUserId) return;

    if (this.isSubscribed && this.currentUserId) {
      NotificationSuscriptionService.unsubscribeFromNotifications(
        this.currentUserId
      );
    }

    this.currentUserId = userId;

    NotificationSuscriptionService.subscribeToUserNotifications(userId, {
      onNotificationsChange: (updatedNotifications) => {
        this.notifications = updatedNotifications;
        this.notifySubscribers();
      },
      getNotifications: () => NotificationService.getUserNotifications(userId),
    });

    this.isSubscribed = true;

    this.fetchNotifications();
  }

  static async fetchNotifications() {
    if (!this.currentUserId) return;

    try {
      const data = await NotificationService.getUserNotifications(
        this.currentUserId,
        {
          limit: 20,
          offset: 0,
        }
      );
      this.notifications = data;
      this.notifySubscribers();
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }

  static subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.notifications);
    return () => this.unsubscribe(callback);
  }

  static unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  static notifySubscribers() {
    this.subscribers.forEach((callback) => callback(this.notifications));
  }

  static cleanup() {
    if (this.isSubscribed && this.currentUserId) {
      NotificationSuscriptionService.unsubscribeFromNotifications(
        this.currentUserId
      );
      this.isSubscribed = false;
      this.currentUserId = null;
      this.subscribers.clear();
      this.notifications = [];
    }
  }

  static async markAsRead(notificationId) {
    if (!this.currentUserId || !notificationId) return;

    try {
      this.notifications = this.notifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      );
      this.notifySubscribers();

      await NotificationService.markNotificationAsRead(
        notificationId,
        this.currentUserId
      );
    } catch (error) {
      this.notifications = this.notifications.map((notification) =>
        notification.id === notificationId && notification.is_read
          ? { ...notification, is_read: false }
          : notification
      );
      this.notifySubscribers();
      console.error("Error marking notification as read:", error);
    }
  }

  static async markAllAsRead() {
    if (!this.currentUserId) return;

    const originalNotifications = [...this.notifications];

    try {
      this.notifications = this.notifications.map((notification) => ({
        ...notification,
        is_read: true,
      }));
      this.notifySubscribers();

      await NotificationService.markAllNotificationsAsRead(this.currentUserId);
    } catch (error) {
      this.notifications = originalNotifications;
      this.notifySubscribers();
      console.error("Error marking all notifications as read:", error);
    }
  }

  static handleLogout() {
    this.cleanup();
  }
}

export default NotificationGlobalService;
