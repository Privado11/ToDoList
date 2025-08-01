import BaseService from "../base/baseService";

class ChatSubscriptionService extends BaseService {
  static subscriptions = {
    conversations: new Map(),
    messages: new Map(),
  };

  static subscribeToUserConversations(
    userId,
    { onConversationsChange, getConversations }
  ) {
    this.validateRequiredId(userId, "User ID");

    if (this.subscriptions.conversations.has(userId)) {
      this.unsubscribeFromConversation(userId);
    }

    const subscription = this.supabase
      .channel(`user-conversations-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*", 
        schema: "public",
        table: "user_conversations",
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
      this.unsubscribeFromMessages(conversationId);
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

  static registerOptimisticHandlers(
    type,
    conversationId,
    { onOptimisticUpdate, onOptimisticError }
  ) {
    const subscriptionMap = this.subscriptions[type];
    const subscriptionData = subscriptionMap.get(conversationId);

    if (subscriptionData) {
      subscriptionData.handlers = {
        ...subscriptionData.handlers,
        onOptimisticUpdate,
        onOptimisticError,
      };
      subscriptionMap.set(conversationId, subscriptionData);
    }
  }

  static async handleOptimisticUpdate(type, conversationId, optimisticData) {
    const subscriptionData = this.subscriptions[type].get(conversationId);
    if (subscriptionData?.handlers.onOptimisticUpdate) {
      await subscriptionData.handlers.onOptimisticUpdate(optimisticData);
    }
  }

  static async handleOptimisticError(
    type,
    conversationId,
    optimisticData,
    error
  ) {
    const subscriptionData = this.subscriptions[type].get(conversationId);
    if (subscriptionData?.handlers.onOptimisticError) {
      await subscriptionData.handlers.onOptimisticError(optimisticData, error);
    }
  }

  static clearSubscription(type, id) {
    const subscriptionMap = this.subscriptions[type];
    const subscriptionData = subscriptionMap.get(id);

    if (subscriptionData?.subscription) {
      subscriptionData.subscription.unsubscribe();
      subscriptionMap.delete(id);
      console.log(`Cleared ${type} subscription for ${id}`);
    }
  }

  static unsubscribeFromMessages(conversationId) {
    this.clearSubscription("messages", conversationId);
  }

  static unsubscribeFromConversation(userId) {
    this.clearSubscription("conversations", userId);
  }

  static unsubscribeFromAll() {
    this.subscriptions.messages.forEach((subscriptionData, conversationId) => {
      subscriptionData.subscription.unsubscribe();
      console.log(
        `Unsubscribed from messages updates for conversation ${conversationId}`
      );
    });
    this.subscriptions.messages.clear();

    this.subscriptions.conversations.forEach(
      (subscriptionData, conversationId) => {
        subscriptionData.subscription.unsubscribe();
        console.log(
          `Unsubscribed from conversation updates for ${conversationId}`
        );
      }
    );
    this.subscriptions.conversations.clear();
  }
}

export default ChatSubscriptionService;
