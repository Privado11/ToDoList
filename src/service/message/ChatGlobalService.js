// ChatGlobalService.js
import { ChatSubscriptionService, ChatMessageService } from "@/service";

class ChatGlobalService {
  static subscriptions = {
    conversations: {
      userId: null,
      isSubscribed: false,
      subscribers: new Set(),
      data: [],
    },
    messages: new Map(), 
  };

  // Método para inicializar la suscripción a conversaciones de usuario
  static initializeConversationsSubscription(userId) {
    if (
      !userId ||
      (userId === this.subscriptions.conversations.userId &&
        this.subscriptions.conversations.isSubscribed)
    ) {
      return;
    }

    // Limpiar suscripción anterior si existe
    if (
      this.subscriptions.conversations.isSubscribed &&
      this.subscriptions.conversations.userId
    ) {
      ChatSubscriptionService.unsubscribeFromConversation(
        this.subscriptions.conversations.userId
      );
    }

    this.subscriptions.conversations.userId = userId;

    // Crear una nueva suscripción
    ChatSubscriptionService.subscribeToUserConversations(userId, {
      onConversationsChange: (updatedConversations) => {
        this.subscriptions.conversations.data = updatedConversations;
        this.notifyConversationSubscribers();
      },
      getConversations: () => ChatMessageService.getConversations(userId),
    });

    this.subscriptions.conversations.isSubscribed = true;

    // Cargar las conversaciones iniciales
    this.fetchConversations(userId);
  }

  // Método para inicializar la suscripción a mensajes de una conversación
  static initializeMessagesSubscription(conversationId, userId) {
    if (!conversationId || !userId) return;

    if (!this.subscriptions.messages.has(conversationId)) {
      this.subscriptions.messages.set(conversationId, {
        isSubscribed: false,
        subscribers: new Set(),
        data: [],
      });
    }

    const messageSub = this.subscriptions.messages.get(conversationId);

    if (messageSub.isSubscribed) return;

    // Crear nueva suscripción a mensajes
    ChatSubscriptionService.subscribeToMessages(conversationId, {
      onMessagesChange: (updatedMessages) => {
        messageSub.data = updatedMessages;
        this.notifyMessageSubscribers(conversationId);
      },
      getMessages: () =>
        ChatMessageService.getConversationMessages(conversationId, userId),
    });

    messageSub.isSubscribed = true;

    // Cargar los mensajes iniciales
    this.fetchMessages(conversationId, userId);
  }

  // Método para cargar conversaciones
  static async fetchConversations(userId) {
    if (!userId) return;

    try {
      const data = await ChatMessageService.getConversations(userId);
      this.subscriptions.conversations.data = data;
      this.notifyConversationSubscribers();
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }

  // Método para cargar mensajes
  static async fetchMessages(conversationId, userId) {
    if (!conversationId || !userId) return;

    try {
      if (!this.subscriptions.messages.has(conversationId)) {
        this.subscriptions.messages.set(conversationId, {
          isSubscribed: false,
          subscribers: new Set(),
          data: [],
        });
      }

      const messageSub = this.subscriptions.messages.get(conversationId);
      const data = await ChatMessageService.getConversationMessages(
        conversationId,
        userId
      );
      messageSub.data = data;
      this.notifyMessageSubscribers(conversationId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }

  // Suscribirse a cambios en conversaciones
  static subscribeToConversations(callback) {
    this.subscriptions.conversations.subscribers.add(callback);
    // Entregar datos actuales inmediatamente
    callback(this.subscriptions.conversations.data);
    return () => this.unsubscribeFromConversations(callback);
  }

  // Cancelar suscripción a conversaciones
  static unsubscribeFromConversations(callback) {
    this.subscriptions.conversations.subscribers.delete(callback);
  }

  // Suscribirse a cambios en mensajes de una conversación específica
  static subscribeToConversationMessages(conversationId, callback) {
    if (!this.subscriptions.messages.has(conversationId)) {
      this.subscriptions.messages.set(conversationId, {
        isSubscribed: false,
        subscribers: new Set(),
        data: [],
      });
    }

    const messageSub = this.subscriptions.messages.get(conversationId);
    messageSub.subscribers.add(callback);

    // Entregar datos actuales inmediatamente
    callback(messageSub.data);

    return () =>
      this.unsubscribeFromConversationMessages(conversationId, callback);
  }

  // Cancelar suscripción a mensajes de una conversación
  static unsubscribeFromConversationMessages(conversationId, callback) {
    if (!this.subscriptions.messages.has(conversationId)) return;

    const messageSub = this.subscriptions.messages.get(conversationId);
    messageSub.subscribers.delete(callback);
  }

  // Notificar a todos los suscriptores de conversaciones
  static notifyConversationSubscribers() {
    this.subscriptions.conversations.subscribers.forEach((callback) => {
      callback(this.subscriptions.conversations.data);
    });
  }

  // Notificar a todos los suscriptores de mensajes de una conversación
  static notifyMessageSubscribers(conversationId) {
    if (!this.subscriptions.messages.has(conversationId)) return;

    const messageSub = this.subscriptions.messages.get(conversationId);
    messageSub.subscribers.forEach((callback) => {
      callback(messageSub.data);
    });
  }

  // Limpiar una suscripción de mensajes específica
  static cleanupMessageSubscription(conversationId) {
    if (this.subscriptions.messages.has(conversationId)) {
      const messageSub = this.subscriptions.messages.get(conversationId);

      if (messageSub.isSubscribed) {
        ChatSubscriptionService.unsubscribeFromMessages(conversationId);
        messageSub.isSubscribed = false;
      }

      messageSub.subscribers.clear();
      this.subscriptions.messages.delete(conversationId);
    }
  }

  // Limpiar todas las suscripciones
  static cleanup() {
    if (
      this.subscriptions.conversations.isSubscribed &&
      this.subscriptions.conversations.userId
    ) {
      ChatSubscriptionService.unsubscribeFromConversation(
        this.subscriptions.conversations.userId
      );
      this.subscriptions.conversations.isSubscribed = false;
      this.subscriptions.conversations.userId = null;
      this.subscriptions.conversations.subscribers.clear();
      this.subscriptions.conversations.data = [];
    }

    // Limpiar todas las suscripciones de mensajes
    this.subscriptions.messages.forEach((_, conversationId) => {
      this.cleanupMessageSubscription(conversationId);
    });

    this.subscriptions.messages.clear();
  }
}

export default ChatGlobalService;
