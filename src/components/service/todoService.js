import { supabase } from "./supabase";

class TodoService {
  static subscriptions = new Map();
  static handleError(error, customMessage) {
    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`${customMessage}: ${error.message}`);
    }
  }

  static async getTodos(userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      const { data, error } = await supabase
        .from("todos")
        .select(
          `
          *,
          priorities!inner(*),
          categories!inner(*),
          statuses!inner(*),
          comments_with_user_names(*)
      )
    )

        `
        )
        .eq("user_id", userId)
        .order("creation_date", { ascending: false });

      this.handleError(error, "Error fetching todos");
      return data;
    } catch (error) {
      console.error("Error fetching todos:", error);
      throw error;
    }
  }

  static subscribeToComments(taskId, onCommentsChange) {
    if (!taskId) {
      throw new Error("Task ID is required for subscription");
    }

    if (this.subscriptions.has(taskId)) {
      this.unsubscribeFromComments(taskId);
    }

    const subscription = supabase
      .channel(`comments-${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `todo_id=eq.${taskId}`,
        },
        async (payload) => {
          try {
            const updatedTask = await this.getTodoById(taskId);
            onCommentsChange(updatedTask.comments_with_user_names);
          } catch (error) {
            console.error("Error updating comments in real-time:", error);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to comments for task ${taskId}`);
        }
      });

    this.subscriptions.set(taskId, subscription);

    return subscription;
  }

  static async sharedTask(taskId, userId, recipientId, isEmail) {
    if (!taskId || !userId || !recipientId) {
      throw new Error("Task ID, User ID, and Recipient ID are required");
    }

    try {
      const { data, error } = await supabase.functions.invoke(
        "sendTaskInvite",
        {
          body: {
            task_id: taskId,
            sender_id: userId,
            recipient: recipientId,
            is_email: isEmail,
          },
        }
      );

      this.handleError(error, "Error fetching shared task");
      return data;
    } catch (error) {
      console.error("Error fetching shared task:", error);
      throw error;
    }
  }

  static unsubscribeFromComments(taskId) {
    const subscription = this.subscriptions.get(taskId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(taskId);
      console.log(`Unsubscribed from comments for task ${taskId}`);
    }
  }

  static unsubscribeFromAll() {
    this.subscriptions.forEach((subscription, taskId) => {
      subscription.unsubscribe();
      console.log(`Unsubscribed from comments for task ${taskId}`);
    });
    this.subscriptions.clear();
  }

  static async comments(taskId) {
    if (!taskId) {
      throw new Error("Task ID is required");
    }

    try {
      const { data, error } = await supabase
        .from("comments")
        .select()
        .eq("task_id", taskId)
        .order("created_at", { ascending: false });

      this.handleError(error, "Error fetching comments");
      return data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  }

  static async getTodoById(id) {
    if (!id) {
      throw new Error("Todo ID is required");
    }

    try {
      const { data, error } = await supabase
        .from("todos")
        .select(
          `
          *,
          priorities!inner(*),
          categories!inner(*),
          statuses!inner(*),
          comments_with_user_names(*),
          attachments(*)
          
        `
        )
        .eq("id", id)
        .single();

      this.handleError(error, "Error fetching todo");
      return {
        ...data,
        comments: data.comments ?? [],
        attachments: data.attachments ?? [],
      };
    } catch (error) {
      console.error("Error fetching todo:", error);
      throw error;
    }
  }

  static async getTodoInvitedById(id) {
    if (!id) {
      throw new Error("Todo ID is required");
    }

    try {
      const { data, error } = await supabase
        .from("shared_tasks_with_sender_name_and_sender_email")
        .select(
          `
        status,
        sender_name, 
        sender_email,
        todos:task_id (
          title,
          description
        )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Error fetching todo: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error("Error fetching todo:", error);
      throw error;
    }
  }

  static async updateInvitationStatus(id, status) {
    if (!id) {
      throw new Error("Todo ID is required");
    }

    try {
      // Verificar que el ID exista
      const { data: task, error: fetchError } = await supabase
        .from("shared_tasks")
        .select("*")
        .eq("id", id)
        .single(); // Asegúrate de que obtienes un solo resultado

      if (fetchError) {
        throw new Error(`Error fetching task: ${fetchError.message}`);
      }

      if (!task) {
        throw new Error("No task found with the given ID");
      }

      // Actualizar el estado de la invitación
      const { data, error } = await supabase
        .from("shared_tasks")
        .update({ status }) // Actualiza solo el campo 'status'
        .eq("id", id)
        .single(); // Asegúrate de que se espera un solo resultado

      if (error) {
        throw new Error(`Error updating invitation status: ${error.message}`);
      }

      return { data };
    } catch (error) {
      console.error("Error updating invitation status:", error);
      throw error;
    }
  }

  static async saveTodo(data, userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    try {
      const { user_id, ...todoData } = data;
      const { data: insertedData, error } = await supabase
        .from("todos")
        .insert([
          {
            ...todoData,
            user_id: userId,
            creation_date: new Date().toISOString(),
          },
        ])
        .select();

      this.handleError(error, "Error creating todo");
      return insertedData[0];
    } catch (error) {
      console.error("Error creating todo:", error);
      throw error;
    }
  }

  static async saveComment(content, taskId, userId) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content,
      todo_id: taskId,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    try {
      const subscription = this.subscriptions.get(taskId);
      if (subscription && subscription.onOptimisticUpdate) {
        subscription.onOptimisticUpdate(optimisticComment);
      }

      const { data: insertedData, error } = await supabase
        .from("comments")
        .insert([
          {
            content: content,
            todo_id: taskId,
            user_id: userId,
          },
        ])
        .select();

      this.handleError(error, "Error creating comment");
      return insertedData[0];
    } catch (error) {
      const subscription = this.subscriptions.get(taskId);
      if (subscription && subscription.onOptimisticError) {
        subscription.onOptimisticError(optimisticComment, error);
      }
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  static async updateTodo(id, data) {
    if (!id) {
      throw new Error("Todo ID is required");
    }

    try {
      const {
        user_id,
        categories,
        priorities,
        created_at,
        id: todoId,
        ...updatedData
      } = data;

      const { data: updatedTodo, error } = await supabase
        .from("todos")
        .update({
          ...updatedData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      this.handleError(error, "Error updating todo");
      return updatedTodo[0];
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  }

  static async deleteTodo(id) {
    if (!id) {
      throw new Error("Todo ID is required");
    }

    try {
      const { error } = await supabase.from("todos").delete().eq("id", id);

      this.handleError(error, "Error deleting todo");
      return true;
    } catch (error) {
      console.error("Error deleting todo:", error);
      throw error;
    }
  }
}

export default TodoService;
