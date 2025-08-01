import BaseService from "../base/baseService";

class SubscriptionService extends BaseService {
  static subscriptions = {
    tasks: new Map(),
    comments: new Map(),
    sharedTasks: new Map(),
  };

  static subscribeToUserTasks(userId, { onTasksChange, getTasks }) {
    this.validateRequiredId(userId, "User ID");


    if (this.subscriptions.tasks.has(userId)) {
      this.unsubscribeFromTasks(userId);
    }


    const handleTaskUpdate = async (payload) => {
      try {
        if (payload.old?.status !== payload.new?.status) {
          console.log("Task status updated:", payload);
          const updatedTasks = await getTasks(userId);
          onTasksChange?.(updatedTasks);
        }
      } catch (error) {
        console.error("Error updating tasks in real-time:", error);
      }
    };

     const updatedStatusTask = this.supabase
       .channel(`updated-status-tasks-${userId}`)
       .on(
         "postgres_changes",
         {
           event: "UPDATE",
           schema: "public",
           table: "tasks",
           columns: ["status_id"],
         },
         handleTaskUpdate
       )
       .subscribe((status) => {
         if (status === "SUBSCRIBED") {
           console.log(
             `Subscribed to task updates status for user ${userId}`
           );
         }
       });


    const recipientSubscription = this.supabase
      .channel(`shared-tasks-recipient-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shared_tasks",
          filter: `recipient_id=eq.${userId}`,
          columns: ["status"],
        },
        handleTaskUpdate
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `Subscribed to shared task updates as recipient for user ${userId}`
          );
        }
      });


    const senderSubscription = this.supabase
      .channel(`shared-tasks-sender-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "shared_tasks",
          filter: `sender_id=eq.${userId}`,
          columns: ["status"],
        },
        handleTaskUpdate
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `Subscribed to shared task updates as sender for user ${userId}`
          );
        }
      });

    this.subscriptions.tasks.set(userId, {
      updatedStatusTask,
      recipientSubscription,
      senderSubscription,
      handlers: {
        onChange: onTasksChange,
        onOptimisticUpdate: null,
        onOptimisticError: null,
      },
    });

    return { updatedStatusTask, recipientSubscription, senderSubscription };
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

  static unsubscribeFromTasks(userId) {
    const subscriptionData = this.subscriptions.tasks.get(userId);
    if (subscriptionData?.subscription) {
      subscriptionData.subscription.unsubscribe();
      this.subscriptions.tasks.delete(userId);
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
