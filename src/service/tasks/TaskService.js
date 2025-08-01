import BaseService from "../base/baseService";

class TaskService extends BaseService {
  static prepareTaskData(data) {
    const {
      user_id,
      categories,
      priorities,
      statuses,
      created_at,
      id,
      is_shared,
      ...taskData
    } = data;

    if (taskData.title) {
      taskData.title =
        taskData.title.charAt(0).toUpperCase() + taskData.title.slice(1);
    }

    if (taskData.due_date) {
      const dueDate = new Date(taskData.due_date);
      dueDate.setHours(23, 59, 59, 999);
      taskData.due_date = dueDate.toISOString();
    }

    return taskData;
  }

  static async getTasks(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc("get_all_user_tasks", {
        p_user_id: userId,
      });

      this.handleError(error, "Error fetching tasks");
      return data || [];
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  static async getTaskById(userId, taskId) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredId(taskId, "Task ID");

    try {
      const { data, error } = await this.supabase.rpc("get_task_details", {
        p_task_id: taskId,
        p_user_id: userId,
      });
      this.handleError(error, "Error fetching task");

      return data;
    } catch (error) {
      console.error("Error fetching task:", error);
      throw error;
    }
  }

  static async createTask(taskData, userId) {
    this.validateRequiredId(userId, "User ID");
    console.log("Creating task with data:", taskData);

    const now = new Date().toISOString();

    try {
      const preparedData = {
        ...this.prepareTaskData(taskData),
        user_id: userId,
        create_at: now,
      };

      const { data, error } = await this.supabase.rpc("create_task", {
        p_task_data: preparedData,
      });

      this.handleError(error, "Error creating task");

      return data[0];
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  static async updateTask(id, taskData, mode) {
    this.validateRequiredId(id, "Task ID");

    try {
      const preparedData = this.prepareTaskData(taskData);

      const { data, error } = await this.supabase.rpc("update_task", {
        p_task_id: id,
        p_task_data: preparedData,
        p_mode: mode,
      });

      this.handleError(error, "Error updating task");

      return data[0];
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  static async updateTaskStatus(id, userId) {
    this.validateRequiredId(id, "Task ID");
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc("switch_task_status", {
        task_id_param: id,
        user_id_param: userId,
      });

      this.handleError(error, "Error completing task");
      return data;
    } catch (error) {
      console.error("Error completing task:", error);
      throw error;
    }
  }

  static async deleteTask(id) {
    this.validateRequiredId(id, "Task ID");

    try {
      const { error } = await this.supabase.rpc("delete_task_completely", {
        task_id_param: id,
      });

      this.handleError(error, "Error deleting task");
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  static async getTasksChartData(userId, requestingUserId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc("get_tasks_chart_data", {
        user_id: userId,
        requesting_user_id: requestingUserId,
      });

      this.handleError(error, "Error fetching tasks chart data");

      return data || {};
    } catch (error) {
      console.error("Error fetching tasks chart data:", error);
      throw new Error(error.message);
    }
  }

  static async getUserTasksWithPrivacy(userId, requestingUserId) {
    this.validateRequiredId(userId, "User ID");
    this.validateRequiredId(requestingUserId, "Requesting User ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "get_user_tasks_with_privacy",
        {
          user_id: userId,
          requesting_user_id: requestingUserId,
        }
      );

      this.handleError(error, "Error fetching user tasks with privacy");

      return data || [];
    } catch (error) {
      console.error("Error fetching user tasks with privacy:", error);
      throw new Error(error.message);
    }
  }
}

export default TaskService;
