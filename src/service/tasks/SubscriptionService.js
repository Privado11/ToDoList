import BaseService from "../base/baseService";

class SubscriptionService extends BaseService {
  static subscriptions = {
    comments: new Map(),
    sharedTasks: new Map(),
  };

  static subscribeToTask(
    taskId,
    { onCommentsChange, onSharedTasksChange, getTaskById }
  ) {
    this.validateRequiredId(taskId, "Task ID");

    // Suscribirse a comentarios
    this.subscribeToComments(taskId, {
      onCommentsChange,
      getComments: async () => {
        const task = await getTaskById(taskId);
        return task?.comments || [];
      },
    });

    // Suscribirse a tareas compartidas
    this.subscribeToSharedTasks(taskId, {
      onSharedTasksChange,
      getUsersFromSharedTask: async () => {
        const task = await getTaskById(taskId);
        return task?.shared_tasks || [];
      },
    });

    // Retornar un objeto de suscripción combinado
    return {
      unsubscribe: () => {
        this.unsubscribeFromComments(taskId);
        this.unsubscribeFromSharedTasks(taskId);
      },
    };
  }

  static subscribeToComments(taskId, { onCommentsChange, getComments }) {
    this.validateRequiredId(taskId, "Task ID");

    if (this.subscriptions.comments.has(taskId)) {
      this.unsubscribeFromComments(taskId);
    }

    const subscription = this.supabase
      .channel(`comments-${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
        },
        async (payload) => {
          try {
            const updatedComment = await getComments(taskId);
            onCommentsChange?.(updatedComment);
          } catch (error) {
            console.error("Error updating comments in real-time:", error);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to comments updates for task ${taskId}`);
        }
      });

    this.subscriptions.comments.set(taskId, {
      subscription,
      handlers: {
        onChange: onCommentsChange,
        onOptimisticUpdate: null,
        onOptimisticError: null,
      },
    });

    return subscription;
  }

  static subscribeToSharedTasks(
    taskId,
    { onSharedTasksChange, getUsersFromSharedTask }
  ) {
    this.validateRequiredId(taskId, "Task ID");

    if (this.subscriptions.sharedTasks.has(taskId)) {
      this.unsubscribeFromSharedTasks(taskId);
    }

    const subscription = this.supabase
      .channel(`shared-tasks-${taskId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shared_tasks",
        },
        async (payload) => {
          try {
            const updateUsersFromSharedTask = await getUsersFromSharedTask(
              taskId
            );
            onSharedTasksChange?.(updateUsersFromSharedTask);
          } catch (error) {
            console.error("Error updating shared tasks in real-time:", error);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to shared tasks updates for task ${taskId}`);
        }
      });

    this.subscriptions.sharedTasks.set(taskId, {
      subscription,
      handlers: {
        onChange: onSharedTasksChange,
        onOptimisticUpdate: null,
        onOptimisticError: null,
      },
    });

    return subscription;
  }

  static registerOptimisticHandlers(
    type,
    taskId,
    { onOptimisticUpdate, onOptimisticError }
  ) {
    const subscriptionMap = this.subscriptions[type];
    const subscriptionData = subscriptionMap.get(taskId);

    if (subscriptionData) {
      subscriptionData.handlers = {
        ...subscriptionData.handlers,
        onOptimisticUpdate,
        onOptimisticError,
      };
      subscriptionMap.set(taskId, subscriptionData);
    }
  }

  static async handleOptimisticUpdate(type, taskId, optimisticData) {
    const subscriptionData = this.subscriptions[type].get(taskId);
    if (subscriptionData?.handlers.onOptimisticUpdate) {
      await subscriptionData.handlers.onOptimisticUpdate(optimisticData);
    }
  }

  static async handleOptimisticError(type, taskId, optimisticData, error) {
    const subscriptionData = this.subscriptions[type].get(taskId);
    if (subscriptionData?.handlers.onOptimisticError) {
      await subscriptionData.handlers.onOptimisticError(optimisticData, error);
    }
  }

  static unsubscribeFromComments(taskId) {
    const subscriptionData = this.subscriptions.comments.get(taskId);
    if (subscriptionData?.subscription) {
      subscriptionData.subscription.unsubscribe();
      this.subscriptions.comments.delete(taskId);
      console.log(`Unsubscribed from comments updates for task ${taskId}`);
    }
  }

  static unsubscribeFromSharedTasks(taskId) {
    const subscriptionData = this.subscriptions.sharedTasks.get(taskId);
    if (subscriptionData?.subscription) {
      subscriptionData.subscription.unsubscribe();
      this.subscriptions.sharedTasks.delete(taskId);
      console.log(`Unsubscribed from shared tasks updates for task ${taskId}`);
    }
  }

  static unsubscribeFromAll() {
    this.subscriptions.comments.forEach((subscriptionData, taskId) => {
      subscriptionData.subscription.unsubscribe();
      console.log(`Unsubscribed from comments updates for task ${taskId}`);
    });
    this.subscriptions.comments.clear();

    this.subscriptions.sharedTasks.forEach((subscriptionData, taskId) => {
      subscriptionData.subscription.unsubscribe();
      console.log(`Unsubscribed from shared tasks updates for task ${taskId}`);
    });
    this.subscriptions.sharedTasks.clear();
  }
}

export default SubscriptionService;
