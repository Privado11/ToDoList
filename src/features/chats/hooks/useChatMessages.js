import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ChatMessageService } from "@/service";
import { useAuthLogic } from "@/features/auth";
import {
  useChatSubscription,
  useMessageSubscription,
} from "./useChatSubscription";

export const useChatMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const { user } = useAuthLogic();

  const {
    subscribeToConversation,
    unsubscribe: unsubscribeFromConversation
  } = useChatSubscription(setConversations);

  const { subscribeToMessages, unsubscribe: unsubscribeFromMessages } =
    useMessageSubscription(setCurrentMessages);

  useEffect(() => {
    if (!user) return;

    subscribeToConversation(user.id, () =>
      ChatMessageService.getConversations(user.id)
    );

    return () => {
      unsubscribeFromConversation();
    };
  }, [user, subscribeToConversation, unsubscribeFromConversation]);

  useEffect(() => {
    if (selectedConversation) {
      subscribeToMessages(selectedConversation.id, () =>
        ChatMessageService.getConversationMessages(
          selectedConversation.id,
          user.id
        )
      );
    }

    return () => {
      unsubscribeFromMessages();
    };
  }, [
    selectedConversation,
    user,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const data = await ChatMessageService.getConversations(user.id);
      setConversations(data);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, fetchConversations]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    const originalConversations = [...conversations];

    try {
      setConversations((prev) =>
        prev.map((conversation) => ({ ...conversation, is_read: true }))
      );

      await ChatMessageService.markAllConversationsAsRead(user.id);
      toast.success("All conversations marked as read");
    } catch (err) {
      setConversations(originalConversations);
      toast.error("Error marking all conversations as read");
      console.error("Error marking all conversations as read:", err);
    }
  }, [user, conversations]);

  const fetchMessages = useCallback(
    async (conversationId) => {
      if (!conversationId || !user) return;

      setLoadingMessages(true);
      try {
        const messages = await ChatMessageService.getConversationMessages(
          conversationId,
          user.id
        );

        setCurrentMessages(messages);
        return messages;
      } catch (err) {
        setError(err.message);
        return [];
      } finally {
        setLoadingMessages(false);
      }
    },
    [user]
  );

  const sendMessage = useCallback(
    async (recipientId, content) => {
      if (!user || !recipientId || !content.trim()) {
        toast.error("No se puede enviar un mensaje vacío");
        return null;
      }

      try {
        let conversationId = selectedConversation?.id;

        const optimisticMessage = ChatMessageService.createOptimisticMessage(
          content,
          user
        );

        setCurrentMessages((prev) => [...prev, optimisticMessage]);

        const result = await ChatMessageService.sendMessage(
          recipientId,
          content,
          user,
          conversationId
        );

        await fetchConversations();

        return result;
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("The message could not be sent");
        setCurrentMessages((prev) =>
          prev.filter((msg) => msg.id !== optimisticMessage.id)
        );

        return null;
      }
    },
    [user, selectedConversation, fetchConversations]
  );

  const openChat = useCallback(
    (conversation) => {
      setSelectedConversation(conversation);
      setIsChatOpen(true);
      fetchMessages(conversation.id);
    },
    [fetchMessages]
  );

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
    if (selectedConversation) {
      // Pass the specific conversation ID when unsubscribing
      unsubscribeFromMessages(selectedConversation.id);
    }
    setSelectedConversation(null);
    setCurrentMessages([]);
  }, [unsubscribeFromMessages, selectedConversation]);

  return {
    conversations,
    loading,
    error,
    isChatOpen,
    selectedConversation,
    currentMessages,
    loadingMessages,
    markAllAsRead,
    sendMessage,
    openChat,
    closeChat,
    fetchMessages,
    fetchConversations,
  };
};
