import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { ChatMessageService } from "@/service";
import { useAuthLogic } from "@/features/auth";
import {
  useChatSubscription,
  useMultiMessageSubscription,
} from "./useChatSubscription";
import { MinimizedChat } from "../components";

export const useChatMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anonymousMessage, setAnonymousMessage] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [minimizedChats, setMinimizedChats] = useState([]);
  const messagesRef = useRef(new Map());
  const [currentMessages, setCurrentMessages] = useState([]);
  const [allMessages, setAllMessages] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);

  const { profile: user } = useAuthLogic();

  const { subscribeToConversation, unsubscribe: unsubscribeFromConversation } =
    useChatSubscription(setConversations);

  const {
    subscribeToMessages,
    unsubscribeFromMessages,
    unsubscribeFromAllMessages,
  } = useMultiMessageSubscription();

  useEffect(() => {
    if (user?.is_anonymous) {
      setConversations([]);
      setAnonymousMessage(
        "Chats are only available for registered users.\nCreate a full account to access this feature."
      );
      setLoading(false);
      return;
    }

    setAnonymousMessage(null);

    if (!user) {
      setLoading(false);
      return;
    }
    

    subscribeToConversation(user.id, () =>
      ChatMessageService.getConversations(user.id)
    );

    return () => {
      unsubscribeFromConversation();
    };
  }, [user, subscribeToConversation, unsubscribeFromConversation]);

  const handleMessagesChange = useCallback(
    (conversationId, updatedMessages) => {
      messagesRef.current.set(conversationId, updatedMessages);

      if (selectedConversation && selectedConversation.id === conversationId) {
        setCurrentMessages(updatedMessages);
      }

      setAllMessages((prevAllMessages) => ({
        ...prevAllMessages,
        [conversationId]: updatedMessages,
      }));
    },
    [selectedConversation]
  );

  useEffect(() => {
    if (!user || user.is_anonymous) return;

    activeChats.forEach((chat) => {
      if (chat) {
        subscribeToMessages(
          chat.id,
          (conversationId) =>
            ChatMessageService.getConversationMessages(conversationId, user.id),
          handleMessagesChange
        );
      }
    });

    return () => {
      unsubscribeFromAllMessages();
    };
  }, [user, activeChats, subscribeToMessages, handleMessagesChange]);

  const fetchConversations = useCallback(async () => {
    if (!user || user.is_anonymous) {
      setLoading(false);
      return;
    }

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
    if (user && !user.is_anonymous) {
      fetchConversations();
    } else {
      setLoading(false);
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
      if (!conversationId || !user) return [];

      setLoadingMessages(true);
      try {
        const messages = await ChatMessageService.getConversationMessages(
          conversationId,
          user.id
        );

        messagesRef.current.set(conversationId, messages);

        if (
          selectedConversation &&
          selectedConversation.id === conversationId
        ) {
          setCurrentMessages(messages);
        }

        setAllMessages((prevAllMessages) => ({
          ...prevAllMessages,
          [conversationId]: messages,
        }));

        return messages;
      } catch (err) {
        setError(err.message);
        return [];
      } finally {
        setLoadingMessages(false);
      }
    },
    [user, selectedConversation]
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

        setAllMessages((prevAllMessages) => ({
          ...prevAllMessages,
          [targetConversationId]: updatedMsgs,
        }));

        const result = await ChatMessageService.sendMessage(
          recipientId,
          content,
          user,
          targetConversationId
        );

        await fetchConversations();

        return result;
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("The message could not be sent");

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

          setAllMessages((prevAllMessages) => ({
            ...prevAllMessages,
            [targetConversationId]: filteredMsgs,
          }));
        }

        return null;
      }
    },
    [user, selectedConversation, fetchConversations]
  );


  const minimizeChat = useCallback(
    (conversationId) => {
      const chat = activeChats.find((c) => c?.id === conversationId);
      if (!chat) return;

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
    [fetchMessages, activeChats, MinimizedChat, user]
  );

  const closeChat = useCallback(
    (conversationId) => {
      const targetId = conversationId || selectedConversation?.id;
      if (!targetId) return;

      setActiveChats((prev) => prev.filter((c) => c?.id !== targetId));

      setMinimizedChats((prev) => prev.filter((c) => c?.id !== targetId));

      unsubscribeFromMessages(targetId);

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
    [selectedConversation, activeChats, unsubscribeFromMessages]
  );

  const closeAllChats = useCallback(() => {
    setActiveChats([]);
    setMinimizedChats([]);
    setSelectedConversation(null);
    setCurrentMessages([]);
    setIsChatOpen(false);
    unsubscribeFromAllMessages();
  }, [unsubscribeFromAllMessages]);

  return {
    conversations,
    loading,
    error,
    anonymousMessage,
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
    fetchConversations,
  };
};
