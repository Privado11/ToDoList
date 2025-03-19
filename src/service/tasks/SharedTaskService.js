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

  static async getSharedTasks(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("shared_tasks")
        .select(this.SHARED_TASKS_SELECT)
        .eq("recipient_id", userId)
        .in("status", ["accepted", "pending"])
        .order("created_at", { ascending: false });

      this.handleError(error, "Error fetching shared tasks");
      return data || [];
    } catch (error) {
      console.error("Error fetching shared tasks:", error);
      throw error;
    }
  }

  static async getUsersFromSharedTask(taskId) {
    this.validateRequiredId(taskId, "Task ID");

    try {
      const { data, error } = await this.supabase
        .from("shared_tasks")
        .select(this.USERS_SHARED_TASKS_SELECT)
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      this.handleError(error, "Error fetching shared tasks");
      return data || [];
    } catch (error) {
      console.error("Error fetching shared tasks:", error);
      throw error;
    }
  }

  static async shareTask(taskId, userId, recipientId, getTaskById) {
    this.validateRequiredId(taskId, "Task ID");
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredId(recipientId, "Recipient ID");

    try {
      // const { data, error } = await this.supabase.functions.invoke(
      //   "sendTaskInvite",
      //   {
      //     body: {
      //       task_id: taskId,
      //       sender_id: userId,
      //       recipient: recipientId,
      //       is_email: isEmail,
      //     },
      //   }
      // );

      const { data, error } = await this.supabase.rpc("share_task_with_user", {
        to_user_id: userId,
        from_user_id: recipientId,
        task_id: taskId,
      });

      this.handleError(error, "Error sharing task");

      const task = await getTaskById(taskId);
      return {
        message: data?.message || "Task shared successfully",
        task,
      };
    } catch (error) {
      console.error("Error sharing task:", error);
      throw error;
    }
  }

  static async acceptTaskShare(id) {
    this.validateRequiredId(id, "Invitation ID");

    try {
      const { data, error } = await this.supabase.rpc("accept_task_share", {
        id,
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
        id,
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

  static async searchUsersForSharedTask(query, currentUserId, taskId) {
    console.log(
      "Searching users for shared task:",
      query,
      currentUserId,
      taskId
    );
    this.validateRequiredId(currentUserId, "Current User ID");
    this.validateRequiredId(taskId, "Task ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "search_users_for_shared_task",
        {
          current_user_id: currentUserId,
          task_id: taskId,
          search_query: query,
        }
      );

      this.handleError(error, "Error searching users");

      return data;
    } catch (error) {
      console.error("Error searching users:", error);
      throw new Error(error.message);
    }
  }
}

export default SharedTaskService;
