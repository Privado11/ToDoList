import BaseService from "../base/baseService";

class UnifiedSubscriptionService extends BaseService {
  static subscriptions = {
    // Chat subscriptions
    conversations: new Map(),
    messages: new Map(),

    // Task subscriptions
    comments: new Map(),
    sharedTasks: new Map(),

    // Notification subscriptions
    notifications: new Map(),
  };

  // ------------ CHAT SUBSCRIPTIONS ------------

  static subscribeToUserConversations(
    userId,
    { onConversationsChange, getConversations }
  ) {
    this.validateRequiredId(userId, "User ID");

    if (this.subscriptions.conversations.has(userId)) {
      this.unsubscribeFromSubscription("conversations", userId);
    }

    const subscription = this.supabase
      .channel(`user-conversations-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_conversations",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          try {
            const updatedConversation = await getConversations(userId);
            onConversationsChange?.(updatedConversation);
          } catch (error) {
            console.error("Error updating conversation in real-time:", error);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`Subscribed to conversation updates for user ${userId}`);
        }
      });

    this.subscriptions.conversations.set(userId, {
      subscription,
      handlers: {
        onChange: onConversationsChange,
        onOptimisticUpdate: null,
        onOptimisticError: null,
      },
    });

    return subscription;
  }

  static subscribeToMessages(
    conversationId,
    { onMessagesChange, getMessages }
  ) {
    this.validateRequiredId(conversationId, "Conversation ID");

    if (this.subscriptions.messages.has(conversationId)) {
      this.unsubscribeFromSubscription("messages", conversationId);
    }

    const subscription = this.supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          try {
            const updateMessages = await getMessages(conversationId);
            onMessagesChange?.(updateMessages);
          } catch (error) {
            console.error("Error updating messages in real-time:", error);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_messages",
        },
        async (payload) => {
          try {
            if (payload.new && payload.new.user_id) {
              const updateMessages = await getMessages(conversationId);
              onMessagesChange?.(updateMessages);
            }
          } catch (error) {
            console.error("Error updating user_messages in real-time:", error);
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(
            `Subscribed to messages updates for conversation ${conversationId}`
          );
        }
      });

    this.subscriptions.messages.set(conversationId, {
      subscription,
      handlers: {
        onChange: onMessagesChange,
        onOptimisticUpdate: null,
        onOptimisticError: null,
      },
    });

    return subscription;
  }

  // ------------ TASK SUBSCRIPTIONS ------------

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
        this.unsubscribeFromSubscription("comments", taskId);
        this.unsubscribeFromSubscription("sharedTasks", taskId);
      },
    };
  }

  static subscribeToComments(taskId, { onCommentsChange, getComments }) {
    this.validateRequiredId(taskId, "Task ID");

    if (this.subscriptions.comments.has(taskId)) {
      this.unsubscribeFromSubscription("comments", taskId);
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
      this.unsubscribeFromSubscription("sharedTasks", taskId);
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

  // ------------ NOTIFICATION SUBSCRIPTIONS ------------

  static subscribeToUserNotifications(
    userId,
    { onNotificationsChange, getNotifications }
  ) {
    this.validateRequiredId(userId, "User ID");

    if (this.subscriptions.notifications.has(userId)) {
      this.unsubscribeFromSubscription("notifications", userId);
    }

    const subscription = this.supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
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

  // ------------ COMMON METHODS ------------

  static registerOptimisticHandlers(
    type,
    id,
    { onOptimisticUpdate, onOptimisticError }
  ) {
    const subscriptionMap = this.subscriptions[type];
    const subscriptionData = subscriptionMap.get(id);

    if (subscriptionData) {
      subscriptionData.handlers = {
        ...subscriptionData.handlers,
        onOptimisticUpdate,
        onOptimisticError,
      };
      subscriptionMap.set(id, subscriptionData);
    }
  }

  static async handleOptimisticUpdate(type, id, optimisticData) {
    const subscriptionData = this.subscriptions[type].get(id);
    if (subscriptionData?.handlers.onOptimisticUpdate) {
      await subscriptionData.handlers.onOptimisticUpdate(optimisticData);
    }
  }

  static async handleOptimisticError(type, id, optimisticData, error) {
    const subscriptionData = this.subscriptions[type].get(id);
    if (subscriptionData?.handlers.onOptimisticError) {
      await subscriptionData.handlers.onOptimisticError(optimisticData, error);
    }
  }

  static unsubscribeFromSubscription(type, id) {
    const subscriptionMap = this.subscriptions[type];
    const subscriptionData = subscriptionMap.get(id);

    if (subscriptionData?.subscription) {
      subscriptionData.subscription.unsubscribe();
      subscriptionMap.delete(id);
      const date = new Date().toLocaleTimeString();
      console.log(`Unsubscribed from ${type} for ID ${id} at ${date}`);
    }
  }

  // Métodos específicos para mantener compatibilidad con código existente
  static unsubscribeFromMessages(conversationId) {
    this.unsubscribeFromSubscription("messages", conversationId);
  }

  static unsubscribeFromConversation(userId) {
    this.unsubscribeFromSubscription("conversations", userId);
  }

  static unsubscribeFromComments(taskId) {
    this.unsubscribeFromSubscription("comments", taskId);
  }

  static unsubscribeFromSharedTasks(taskId) {
    this.unsubscribeFromSubscription("sharedTasks", taskId);
  }

  static unsubscribeFromNotifications(userId) {
    this.unsubscribeFromSubscription("notifications", userId);
  }

  static unsubscribeFromAll() {
    // Desuscribirse de todas las suscripciones
    Object.keys(this.subscriptions).forEach((type) => {
      this.subscriptions[type].forEach((subscriptionData, id) => {
        subscriptionData.subscription.unsubscribe();
        console.log(`Unsubscribed from ${type} for ID ${id}`);
      });
      this.subscriptions[type].clear();
    });
  }
}

export default UnifiedSubscriptionService;
