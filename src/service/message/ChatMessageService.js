import BaseService from "../base/baseService";
import ChatSubscriptionService from "./ChatSubscriptionService";

class ChatMessageService extends BaseService {
  static async getConversations(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "get_user_conversations",
        {
          p_user_id: userId,
        }
      );

      this.handleError(error, "Error fetching conversations");

      return data || [];
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw new Error(error.message);
    }
  }

  static async getConversationMessages(conversationId, userId) {
    this.validateRequiredId(conversationId, "Conversation ID");
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "get_conversation_messages",
        {
          p_conversation_id: conversationId,
          p_user_id: userId,
        }
      );

      this.handleError(error, "Error fetching conversation");

      return data;
    } catch (error) {
      console.error("Error fetching conversation by ID:", error);
      throw new Error(error.message);
    }
  }

  static createOptimisticMessage(content, user) {
    return {
      id: `temp-${Date.now()}`,
      content,
      is_from_current_user: true,
      is_read: true,
      is_read_by_others: false,
      sender_fullname: user?.full_name,
      sender_id: user?.id,
      sender_username: user?.username,
      sender_avatar_url: user?.avatar_url,
      created_at: new Date().toISOString(),
    };
  }

  static async sendMessage(recipientId, content, user, conversationId) {
    this.validateRequiredId(recipientId, "Recipient ID");
    this.validateRequiredId(content, "Message content");

     const optimisticMessage = this.createOptimisticMessage(
       content,
       user
     );

    try {
       await ChatSubscriptionService.handleOptimisticUpdate(
         "messages",
         conversationId,
         optimisticMessage
       );
      const { data, error } = await this.supabase.rpc("send_message", {
        recipient_id: recipientId,
        content: content,
      });

      this.handleError(error, "Error sending message");

      return data;
    } catch (error) {
       await ChatSubscriptionService.handleOptimisticError(
         "messages",
         conversationId,
         optimisticMessage,
         error
       );
       throw error;
    }
  }

  static async markMessageAsRead(messageId, userId) {
    this.validateRequiredId(messageId, "Message ID");
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase
        .from("user_messages")
        .update({ is_read: true })
        .eq("message_id", messageId)
        .eq("user_id", userId);

      this.handleError(error, "Error marking message as read");

      return data;
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw new Error(error.message);
    }
  }

  static async markAllMessagesAsRead(conversationId, userId) {
    this.validateRequiredId(conversationId, "Conversation ID");
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "mark_conversation_messages_as_read",
        {
          p_conversation_id: conversationId,
          p_user_id: userId,
        }
      );

      this.handleError(error, "Error marking all messages as read");

      return data;
    } catch (error) {
      console.error("Error marking all messages as read:", error);
      throw new Error(error.message);
    }
  }

  static async markConversationAsRead(conversationId, userId) {
    this.validateRequiredId(conversationId, "Conversation ID");
    this.validateRequiredId(userId, "User ID");

    try {
      // Actualizar last_read_at
      const { data, error } = await this.supabase
        .from("user_conversations")
        .update({ last_read_at: new Date() })
        .eq("conversation_id", conversationId)
        .eq("user_id", userId);

      this.handleError(error, "Error updating last read timestamp");

      // Marcar todos los mensajes como leídos
      await this.markAllMessagesAsRead(conversationId, userId);

      return data;
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      throw new Error(error.message);
    }
  }

  static async deleteMessage(messageId, userId) {
    this.validateRequiredId(messageId, "Message ID");
    this.validateRequiredId(userId, "User ID");

    try {
      // Soft delete para el usuario específico
      const { data, error } = await this.supabase
        .from("user_messages")
        .update({ is_deleted: true })
        .eq("message_id", messageId)
        .eq("user_id", userId);

      this.handleError(error, "Error deleting message");

      return data;
    } catch (error) {
      console.error("Error deleting message:", error);
      throw new Error(error.message);
    }
  }

  static async deleteConversation(conversationId, userId) {
    this.validateRequiredId(conversationId, "Conversation ID");
    this.validateRequiredId(userId, "User ID");

    try {
      // Soft delete para el usuario específico
      const { data, error } = await this.supabase
        .from("user_conversations")
        .update({ is_deleted: true })
        .eq("conversation_id", conversationId)
        .eq("user_id", userId);

      this.handleError(error, "Error deleting conversation");

      return data;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw new Error(error.message);
    }
  }

  static async getUnreadConversationsCount(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "get_unread_conversations_count",
        {
          p_user_id: userId,
        }
      );

      this.handleError(error, "Error fetching unread conversations count");

      return data || 0;
    } catch (error) {
      console.error("Error fetching unread conversations count:", error);
      throw new Error(error.message);
    }
  }

  static async getUserConversationStats(userId) {
    this.validateRequiredId(userId, "User ID");

    try {
      const { data, error } = await this.supabase.rpc(
        "get_user_conversation_stats",
        {
          p_user_id: userId,
        }
      );

      this.handleError(error, "Error fetching user conversation stats");

      return (
        data || {
          total_conversations: 0,
          total_messages: 0,
          unread_messages: 0,
          unread_conversations: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching user conversation stats:", error);
      throw new Error(error.message);
    }
  }
}

export default ChatMessageService;
