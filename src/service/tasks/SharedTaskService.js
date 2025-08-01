import BaseService from "../base/baseService";

class SharedTaskService extends BaseService {
  static SHARED_TASKS_SELECT = `
    *,
    tasks:task_id (
      title,
      description
    )
  `;

  static USERS_SHARED_TASKS_SELECT = `
    id,
    status,
    profile:recipient_id (
      full_name,
      username
    )
  `;

  static async getUsersFromSharedTask(taskId, userId) {
    this.validateRequiredId(taskId, "Task ID");
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc("get_shared_task_users", {
        p_task_id: taskId,
        p_current_user_id: userId,
      });

      this.handleError(error, "Error fetching shared tasks");
      return data || [];
    } catch (error) {
      console.error("Error fetching shared tasks:", error);
      throw error;
    }
  }

  static async shareTask(taskId, userId, recipientId) {
    this.validateRequiredId(taskId, "Task ID");
    this.validateRequiredId(userId, "User ID");

    try {
      const recipientIds = Array.isArray(recipientId)
        ? recipientId
        : [recipientId];

      this.validateRecipientIds(recipientIds, "Recipient IDs");

      const { data, error } = await this.supabase.rpc(
        "share_task_with_multiple_users",
        {
          from_user_id: userId,
          to_user_ids: recipientIds,
          p_task_id: taskId,
        }
      );

      this.handleError(error, "Error sharing task");

      return data;
    } catch (error) {
      console.error("Error sharing task:", error);
      throw error;
    }
  }

  static validateRecipientIds(recipientIds, fieldName) {
    if (
      !recipientIds ||
      !Array.isArray(recipientIds) ||
      recipientIds.length === 0
    ) {
      throw new Error(`${fieldName} must be a non-empty array`);
    }

    recipientIds.forEach((id, index) => {
      if (!id) {
        throw new Error(`${fieldName}[${index}] is required`);
      }
    });
  }

  static async acceptTaskShare(id) {
    this.validateRequiredId(id, "Invitation ID");

    try {
      const { data, error } = await this.supabase.rpc("accept_task_share", {
        request_id: id,
      });

      this.handleError(error, "Error updating invitation status");

      return data?.[0];
    } catch (error) {
      console.error("Error updating invitation status:", error);
      throw error;
    }
  }

  static async rejectedTaskShare(id) {
    this.validateRequiredId(id, "Invitation ID");

    try {
      const { data, error } = await this.supabase.rpc("rejected_share_task", {
        share_task_id: id,
      });

      this.handleError(error, "Error updating invitation status to rejected");
      return data?.[0];
    } catch (error) {
      console.error("Error updating invitation status to rejected:", error);
      throw error;
    }
  }

  static async cancelShareTask(id) {
    this.validateRequiredId(id, "Shared Task ID");
    console.log("Canceling shared task with ID:", id);

    try {
      const { data, error } = await this.supabase.rpc("cancel_share_tasks", {
        share_task_id: id,
      });

      if (error) {
        console.error("Supabase RPC Error:", error);
        throw new Error("Error canceling shared task: " + error.message);
      }

      console.log("Task canceled successfully:", data);
      return data;
    } catch (error) {
      console.error("Unexpected Error:", error);
      throw error;
    }
  }

  static async leaveSharedTask(id) {
    this.validateRequiredId(id, "Shared Task ID");

    try {
      const { data, error } = await this.supabase
        .from("shared_tasks")
        .update({
          status: "cancelled",
          updated_at: new Date(),
        })
        .eq("id", id);

      this.handleError(error, "Error leaving shared task");
      return data;
    } catch (error) {
      console.error("Error leaving shared task:", error);
      throw error;
    }
  }

  static async searchUsersForSharedTask(
    query,
    currentUserId,
    taskId,
    selectedIds
  ) {
    this.validateRequiredId(currentUserId, "Current User ID");
    this.validateRequiredId(taskId, "Task ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "search_users_for_shared_task",
        {
          current_user_id: currentUserId,
          task_id: taskId,
          search_query: query,
          selected_ids: selectedIds,
        }
      );

      this.handleError(error, "Error searching users");

      return data;
    } catch (error) {
      console.error("Error searching users:", error);
      throw new Error(error.message);
    }
  }

  static async getAvailableFriendsForTask(userId, taskId) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredId(taskId, "Task ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "get_available_friends_for_task",
        {
          p_user_id: userId,
          p_task_id: taskId,
        }
      );

      this.handleError(error, "Error fetching friendships");
      return data || [];
    } catch (error) {
      console.error("Error fetching friendships:", error);
      throw error;
    }
  }
}

export default SharedTaskService;
