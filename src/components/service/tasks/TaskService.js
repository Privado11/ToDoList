import BaseService from "../BaseService";

class TaskService extends BaseService {
  static TASK_LIST_SELECT = `
    id,
    title, 
    description,
    create_at,
    due_date,
    categories(*),
    priorities(*),
    statuses(*)
  `;

  static prepareTaskData(data) {
    const { user_id, categories, priorities, created_at, id, ...taskData } =
      data;
    return taskData;
  }

  static async getTasks(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("tasks")
        .select(this.TASK_LIST_SELECT)
        .eq("user_id", userId)
        .order("create_at", { ascending: false });

      this.handleError(error, "Error fetching tasks");
      return data || [];
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  static async getTaskById(id) {
    this.validateRequiredId(id, "Task ID");

    try {
      const { data, error } = await this.supabase.rpc("get_task_detail", {
        task_id: id,
      });

      this.handleError(error, "Error fetching task");
      return data;
    } catch (error) {
      console.error("Error fetching task:", error);
      throw error;
    }
  }

  static async getOverdueTasksCount(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc("get_overdue_tasks_count", {
        user_id: userId,
      });

      this.handleError(error, "Error fetching overdue tasks count");
      return data?.[0]?.count || 0;
    } catch (error) {
      console.error("Error fetching overdue tasks count:", error);
      throw error;
    }
  }

  static async createTask(taskData, userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const preparedData = {
        ...this.prepareTaskData(taskData),
        user_id: userId,
        create_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from("tasks")
        .insert([preparedData])
        .select();

      this.handleError(error, "Error creating task");
      return data?.[0];
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  static async updateTask(id, taskData) {
    this.validateRequiredId(id, "Task ID");

    try {
      const preparedData = this.prepareTaskData(taskData);

      const { data, error } = await this.supabase
        .from("tasks")
        .update(preparedData)
        .eq("id", id)
        .select();

      this.handleError(error, "Error updating task");
      return data?.[0];
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  static async deleteTask(id) {
    this.validateRequiredId(id, "Task ID");

    try {
      const { error } = await this.supabase.from("tasks").delete().eq("id", id);

      this.handleError(error, "Error deleting task");
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }
}

export default TaskService;
