import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useAuthLogic } from "@/features/auth";
import { ChatMessageService } from "@/service";
import ChatGlobalService from "@/service/message/ChatGlobalService";

// Hook para suscribirse a las conversaciones
export const useGlobalChatConversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthLogic();

  useEffect(() => {
    if (!user) return;

    setLoading(true);

    ChatGlobalService.initializeConversationsSubscription(user.id);

    const unsubscribe = ChatGlobalService.subscribeToConversations(
      (updatedConversations) => {
        setConversations(updatedConversations);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    const originalConversations = [...conversations];

    try {
      setConversations((prev) =>
        prev.map((conversation) => ({ ...conversation, is_read: true }))
      );

      await ChatMessageService.markAllConversationsAsRead(user.id);
      toast.success("Todas las conversaciones marcadas como leídas");
    } catch (err) {
      setConversations(originalConversations);
      toast.error("Error al marcar todas las conversaciones como leídas");
      console.error("Error marking all conversations as read:", err);
    }
  }, [user, conversations]);

  const refreshConversations = useCallback(() => {
    if (user) {
      setLoading(true);
      ChatGlobalService.fetchConversations(user.id);
    }
  }, [user]);

  return {
    conversations,
    loading,
    error,
    markAllAsRead,
    refreshConversations,
  };
};

export const useGlobalChatMessages = (conversationId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthLogic();

  useEffect(() => {
    if (!user || !conversationId) return;

    setLoading(true);

    ChatGlobalService.initializeMessagesSubscription(conversationId, user.id);

    const unsubscribe = ChatGlobalService.subscribeToConversationMessages(
      conversationId,
      (updatedMessages) => {
        setMessages(updatedMessages);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user, conversationId]);

  const sendMessage = useCallback(
    async (content) => {
      if (!user || !conversationId || !content.trim()) {
        toast.error("No se puede enviar un mensaje vacío");
        return null;
      }

      const recipientId = messages.find(
        (m) => m.sender_id !== user.id
      )?.sender_id;
      if (!recipientId) {
        toast.error("No se pudo identificar el destinatario");
        return null;
      }

      try {
        const optimisticMessage = ChatMessageService.createOptimisticMessage(
          content,
          user
        );

        setMessages((prev) => [...prev, optimisticMessage]);

        const result = await ChatMessageService.sendMessage(
          recipientId,
          content,
          user,
          conversationId
        );

        return result;
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("No se pudo enviar el mensaje");

        setMessages((prev) =>
          prev.filter((msg) => !msg.id.startsWith("temp-"))
        );
        return null;
      }
    },
    [user, conversationId, messages]
  );

  const refreshMessages = useCallback(() => {
    if (user && conversationId) {
      setLoading(true);
      ChatGlobalService.fetchMessages(conversationId, user.id);
    }
  }, [user, conversationId]);

  return {
    messages,
    loading,
    error,
    sendMessage,
    refreshMessages,
  };
};

export const useGlobalChat = () => {
  const { user } = useAuthLogic();
  const { conversations, loading, error, markAllAsRead, refreshConversations } =
    useGlobalChatConversations();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [minimizedChats, setMinimizedChats] = useState([]);

  const messagesRef = useRef(new Map());
  const [currentMessages, setCurrentMessages] = useState([]);
  const [allMessages, setAllMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    activeChats.forEach((chat) => {
      if (chat && user) {
        ChatGlobalService.initializeMessagesSubscription(chat.id, user.id);

        const unsubscribe = ChatGlobalService.subscribeToConversationMessages(
          chat.id,
          (updatedMessages) => {
            messagesRef.current.set(chat.id, updatedMessages);

            // Auto mark messages as read if this chat is the selected conversation and is open
            if (
              isChatOpen &&
              selectedConversation &&
              selectedConversation.id === chat.id
            ) {
              // Check if there are new unread messages
              const hasNewMessages = updatedMessages.some(
                (msg) => msg.sender_id !== user.id && !msg.is_read
              );

              // If there are new messages and the chat is active, mark them as read
              if (hasNewMessages) {
                ChatMessageService.markConversationAsRead(chat.id, user.id);
              }
            }

            if (selectedConversation && selectedConversation.id === chat.id) {
              setCurrentMessages(updatedMessages);
            }

            setAllMessages((prev) => ({
              ...prev,
              [chat.id]: updatedMessages,
            }));
          }
        );

        return () => unsubscribe();
      }
    });
  }, [activeChats, user, selectedConversation, isChatOpen]);

  const fetchMessages = useCallback(
    async (conversationId) => {
      if (!conversationId || !user) return [];

      setLoadingMessages(true);
      try {
        await ChatGlobalService.fetchMessages(conversationId, user.id);

        // If this chat is currently open and viewed, mark messages as read
        if (isChatOpen && selectedConversation?.id === conversationId) {
          await ChatMessageService.markConversationAsRead(
            conversationId,
            user.id
          );
        }

        return messagesRef.current.get(conversationId) || [];
      } catch (err) {
        console.error("Error fetching messages:", err);
        return [];
      } finally {
        setLoadingMessages(false);
      }
    },
    [user, isChatOpen, selectedConversation]
  );

  const sendMessage = useCallback(
    async (recipientId, content, conversationId) => {
      if (!user || !recipientId || !content.trim()) {
        toast.error("No se puede enviar un mensaje vacío");
        return null;
      }

      try {
        const targetConversationId = conversationId || selectedConversation?.id;

        if (!targetConversationId) {
          toast.error("No se ha seleccionado una conversación");
          return null;
        }

        const optimisticMessage = ChatMessageService.createOptimisticMessage(
          content,
          user
        );

        const currentMsgs = messagesRef.current.get(targetConversationId) || [];
        const updatedMsgs = [...currentMsgs, optimisticMessage];
        messagesRef.current.set(targetConversationId, updatedMsgs);

        if (
          selectedConversation &&
          selectedConversation.id === targetConversationId
        ) {
          setCurrentMessages(updatedMsgs);
        }

        setAllMessages((prev) => ({
          ...prev,
          [targetConversationId]: updatedMsgs,
        }));

        const result = await ChatMessageService.sendMessage(
          recipientId,
          content,
          user,
          targetConversationId
        );

        refreshConversations();

        return result;
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("No se pudo enviar el mensaje");

        if (conversationId || selectedConversation?.id) {
          const targetConversationId =
            conversationId || selectedConversation.id;
          const currentMsgs =
            messagesRef.current.get(targetConversationId) || [];
          const filteredMsgs = currentMsgs.filter(
            (msg) => !msg.id.startsWith("temp-")
          );
          messagesRef.current.set(targetConversationId, filteredMsgs);

          if (
            selectedConversation &&
            selectedConversation.id === targetConversationId
          ) {
            setCurrentMessages(filteredMsgs);
          }

          setAllMessages((prev) => ({
            ...prev,
            [targetConversationId]: filteredMsgs,
          }));
        }

        return null;
      }
    },
    [user, selectedConversation, refreshConversations]
  );

  const minimizeChat = useCallback(
    (conversationId) => {
      const chat = activeChats.find((c) => c?.id === conversationId);
      if (!chat) return;

      // Opcional: si quieres que el chat minimizado no reciba actualizaciones
      // Descomenta esta línea:
      // ChatGlobalService.cleanupMessageSubscription(conversationId);

      setActiveChats((prev) => prev.filter((c) => c?.id !== conversationId));

      if (!minimizedChats.some((c) => c?.id === conversationId)) {
        setMinimizedChats((prev) => [...prev, chat]);
      }

      if (selectedConversation?.id === conversationId) {
        const remainingChats = activeChats.filter(
          (c) => c?.id !== conversationId
        );
        if (remainingChats.length > 0) {
          setSelectedConversation(remainingChats[0]);
          setCurrentMessages(
            messagesRef.current.get(remainingChats[0].id) || []
          );
        } else {
          setSelectedConversation(null);
          setCurrentMessages([]);
          setIsChatOpen(false);
        }
      }
    },
    [activeChats, minimizedChats, selectedConversation]
  );

  const openChat = useCallback(
    (conversation) => {
      if (!conversation) return;

      setSelectedConversation(conversation);
      setIsChatOpen(true);

      if (!activeChats.some((chat) => chat?.id === conversation.id)) {
        setActiveChats((prev) => [...prev, conversation]);
        fetchMessages(conversation.id);
      } else {
        if (user && conversation.unread_count > 0) {
          ChatMessageService.markConversationAsRead(conversation.id, user.id);
        }
      }

      if (
        activeChats.length >= 2 &&
        !activeChats.some((chat) => chat.id === conversation.id)
      ) {
        const oldestChatId = activeChats[0].id;
        minimizeChat(oldestChatId);
      }

      setMinimizedChats((prev) =>
        prev.filter((chat) => chat?.id !== conversation.id)
      );

      if (user && conversation.unread_count > 0) {
        ChatMessageService.markConversationAsRead(conversation.id, user.id);
      }
    },
    [fetchMessages, activeChats, minimizeChat, user]
  );

  const closeChat = useCallback(
    (conversationId) => {
      const targetId = conversationId || selectedConversation?.id;
      if (!targetId) return;

      ChatGlobalService.cleanupMessageSubscription(targetId);

      setActiveChats((prev) => prev.filter((c) => c?.id !== targetId));
      setMinimizedChats((prev) => prev.filter((c) => c?.id !== targetId));

      if (selectedConversation?.id === targetId) {
        const remainingChats = activeChats.filter((c) => c?.id !== targetId);
        if (remainingChats.length > 0) {
          setSelectedConversation(remainingChats[0]);
          setCurrentMessages(
            messagesRef.current.get(remainingChats[0].id) || []
          );
        } else {
          setSelectedConversation(null);
          setCurrentMessages([]);
          setIsChatOpen(false);
        }
      }
    },
    [selectedConversation, activeChats]
  );

  const closeAllChats = useCallback(() => {
    activeChats.forEach((chat) => {
      if (chat?.id) {
        ChatGlobalService.cleanupMessageSubscription(chat.id);
      }
    });
    minimizedChats.forEach((chat) => {
      if (chat?.id) {
        ChatGlobalService.cleanupMessageSubscription(chat.id);
      }
    });

    setActiveChats([]);
    setMinimizedChats([]);
    setSelectedConversation(null);
    setCurrentMessages([]);
    setIsChatOpen(false);
  }, [activeChats, minimizedChats]);

  return {
    conversations,
    loading,
    error,
    isChatOpen,
    selectedConversation,
    currentMessages,
    loadingMessages,
    activeChats,
    minimizedChats,
    allMessages,
    markAllAsRead,
    sendMessage,
    openChat,
    minimizeChat,
    closeChat,
    closeAllChats,
    fetchMessages,
    refreshConversations,
  };
};
