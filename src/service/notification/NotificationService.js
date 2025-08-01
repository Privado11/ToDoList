import BaseService from "../base/baseService";

class NotificationService extends BaseService {
  static async getUserNotifications(
    userId,
    options = { limit: 20, offset: 0 }
  ) {
    this.validateRequiredId(userId, "User ID");
    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .range(options.offset, options.offset + options.limit - 1);

      this.handleError(error, "Error fetching notifications");

      return data || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new Error(error.message);
    }
  }

  static async getUnreadNotificationsCount(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { count, error } = await this.supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false)
        .eq("is_deleted", false);

      this.handleError(error, "Error fetching unread notifications count");

      return count || 0;
    } catch (error) {
      console.error("Error fetching unread notifications count:", error);
      throw new Error(error.message);
    }
  }

  static async markNotificationAsRead(notificationId, userId) {
    this.validateRequiredId(notificationId, "Notification ID");
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", userId)
        .select();

      this.handleError(error, "Error marking notification as read");

      return data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new Error(error.message);
    }
  }

  static async markAllNotificationsAsRead(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false)
        .select();

      this.handleError(error, "Error marking all notifications as read");

      return data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw new Error(error.message);
    }
  }

  static async getUserNotificationPreferences(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("notification_preferences")
        .select(
          "email, push, mobile, task_reminders, friend_requests, task_comments, task_updates, shared_tasks"
        )
        .eq("user_id", userId)
        .single();

      this.handleError(error, "Error fetching user notification preferences");

      return data || {};
    } catch (error) {
      console.error("Error fetching user notification preferences:", error);
      throw new Error(error.message);
    }
  }
  static async updateUserNotificationPreferences(userId, preferences) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("notification_preferences")
        .update({ ...preferences })
        .eq("user_id", userId)
        .select("*")
        .single();

      this.handleError(error, "Error updating user notification preferences");

      return data;
    } catch (error) {
      console.error("Error updating user notification preferences:", error);
      throw new Error(error.message);
    }
  }

  static async deleteNotification(notificationId) {
    this.validateRequiredId(notificationId, "Notification ID");

    try {
      const { data, error } = await this.supabase
        .from("notifications")
        .update({ is_deleted: true })
        .eq("id", notificationId)
        .select();

      this.handleError(error, "Error deleting notification");

      return data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw new Error(error.message);
    }
  }
}

export default NotificationService;
