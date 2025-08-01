import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { ChatMessageService } from "@/service";
import {
  useChatSubscription,
  useMultiMessageSubscription,
} from "./useChatSubscription";
import { useProfile } from "@/features/users";

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

  const { profile: user } = useProfile();

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

      toast.success("All conversations marked as read", {
        description: "Your inbox is now up to date",
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
    } catch (err) {
      setConversations(originalConversations);
      toast.error("Error marking conversations as read", {
        description: "Please try again later",
        action: {
          label: "Retry",
          onClick: () => markAllAsRead(),
        },
      });
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
        toast.error("Error loading messages", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => fetchMessages(conversationId),
          },
        });
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
        return null;
      }

      try {
        const isVirtual = selectedConversation?.is_virtual;
        const targetConversationId = conversationId || selectedConversation?.id;

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

        if (result && result.success) {
          const messageId = result.message_id;
          const conversationId = result.conversation_id;

          if (isVirtual) {
            setActiveChats((prev) =>
              prev.map((chat) =>
                chat.id === targetConversationId
                  ? { ...chat, id: conversationId, is_virtual: false }
                  : chat
              )
            );

            const msgs = messagesRef.current.get(targetConversationId);
            if (msgs) {
              const updatedMsgs = msgs.map((msg) =>
                msg.id === optimisticMessage.id
                  ? {
                      ...msg,
                      id: messageId,
                      is_optimistic: false,
                      status: "sent",
                    }
                  : msg
              );

              messagesRef.current.delete(targetConversationId);
              messagesRef.current.set(conversationId, msgs);

              setAllMessages((prev) => {
                const { [targetConversationId]: removed, ...rest } = prev;
                return {
                  ...rest,
                  [conversationId]: updatedMsgs,
                };
              });
            }
          }

          return result;
        } else {
          const currentMsgs =
            messagesRef.current.get(targetConversationId) || [];
          const updatedMsgs = currentMsgs.map((msg) =>
            msg.id === optimisticMessage.id
              ? {
                  ...msg,
                  failed: true,
                  error: result?.message || "Failed to send message",
                }
              : msg
          );

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


          return null;
        }
      } catch (error) {
        if (conversationId || selectedConversation?.id) {
          const targetConversationId =
            conversationId || selectedConversation.id;
          const currentMsgs =
            messagesRef.current.get(targetConversationId) || [];

          const updatedMsgs = currentMsgs.map((msg) =>
            msg.id.startsWith("temp-") && msg.content === content
              ? { ...msg, failed: true, error: "Connection error" }
              : msg
          );

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
        }

       

        return null;
      }
    },
    [user, selectedConversation, fetchConversations]
  );

  const resendFailedMessage = useCallback(
    async (messageId) => {
      if (!messageId) return;

      try {
        const targetConversationId = selectedConversation?.id;
        if (targetConversationId) {
          const currentMsgs =
            messagesRef.current.get(targetConversationId) || [];
          const updatedMsgs = currentMsgs.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  status: "sending",
                  failed: false,
                  error: null,
                }
              : msg
          );

          messagesRef.current.set(targetConversationId, updatedMsgs);
          setCurrentMessages(updatedMsgs);
          setAllMessages((prev) => ({
            ...prev,
            [targetConversationId]: updatedMsgs,
          }));
        }

        const result = await ChatMessageService.resendFailedMessage(messageId);

        if (result && result.success) {
          
          return result;
        } else {
          if (targetConversationId) {
            const currentMsgs =
              messagesRef.current.get(targetConversationId) || [];
            const updatedMsgs = currentMsgs.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    failed: true,
                    error: result?.message || "Failed to resend",
                    status: undefined,
                  }
                : msg
            );

            messagesRef.current.set(targetConversationId, updatedMsgs);
            setCurrentMessages(updatedMsgs);
            setAllMessages((prev) => ({
              ...prev,
              [targetConversationId]: updatedMsgs,
            }));
          }

         

          return null;
        }
      } catch (error) {
        const targetConversationId = selectedConversation?.id;
        if (targetConversationId) {
          const currentMsgs =
            messagesRef.current.get(targetConversationId) || [];
          const updatedMsgs = currentMsgs.map((msg) =>
            msg.id === messageId
              ? {
                  ...msg,
                  failed: true,
                  error: "Network or server error",
                  status: undefined,
                }
              : msg
          );

          messagesRef.current.set(targetConversationId, updatedMsgs);
          setCurrentMessages(updatedMsgs);
          setAllMessages((prev) => ({
            ...prev,
            [targetConversationId]: updatedMsgs,
          }));
        }

       

        return null;
      }
    },
    [selectedConversation]
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

  const createVirtualConversation = useCallback((recipientUser) => {
    const recipientUserId = recipientUser?.id || recipientUser?.friend_id;
    return {
      created_at: new Date().toISOString(),
      id: `virtual-${recipientUserId}`,
      is_read: true,
      last_message: null,
      last_message_at: null,
      last_read_at: null,
      other_user_avatar_url: recipientUser?.avatar_url,
      other_user_full_name: recipientUser?.full_name,
      other_user_id: recipientUserId,
      other_user_username: recipientUser?.username,
      unread_count: 0,
      updated_at: null,
      is_virtual: true,
    };
  }, []);

  const openChat = useCallback(
    (conversation, recipientUser) => {
      let currentConversation = conversation;

      if (!currentConversation && recipientUser) {
        const found = conversations.find(
          (conv) =>
            conv.other_user_id === recipientUser.id ||
            conv.other_user_id === recipientUser?.friend_id
        );
        if (found) {
          currentConversation = found;
        } else {
          const virtual = createVirtualConversation(recipientUser);
          setConversations((prev) => [...prev, virtual]);
          currentConversation = virtual;
        }
      }

      if (!currentConversation) return;

      setSelectedConversation(currentConversation);
      setIsChatOpen(true);

      const isChatActive = activeChats.some(
        (chat) => chat?.id === currentConversation.id
      );

      if (!isChatActive) {
        if (activeChats.length >= 2) {
          const oldestChatId = activeChats[0].id;
          minimizeChat(oldestChatId);
        }

        setActiveChats((prev) => [...prev, currentConversation]);
        if (!currentConversation.is_virtual) {
          fetchMessages(currentConversation.id);
        }
      }

      setMinimizedChats((prev) =>
        prev.filter((chat) => chat?.id !== currentConversation.id)
      );

      if (user && currentConversation.unread_count > 0) {
        ChatMessageService.markConversationAsRead(
          currentConversation.id,
          user.id
        );
      }
    },
    [
      fetchMessages,
      activeChats,
      minimizeChat,
      user,
      createVirtualConversation,
      fetchConversations,
      conversations,
      setSelectedConversation,
    ]
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

  const deleteMessage = useCallback(
    async (messageId) => {
      if (!messageId || !user) return;

      const targetConversationId = selectedConversation?.id;
      if (!targetConversationId) return;

      const currentMsgs = messagesRef.current.get(targetConversationId) || [];
      const messageToDelete = currentMsgs.find((msg) => msg.id === messageId);
      const updatedMsgs = currentMsgs.map((msg) =>
        msg.id === messageId ? { ...msg, is_deleted: true } : msg
      );

      messagesRef.current.set(targetConversationId, updatedMsgs);
      setCurrentMessages(updatedMsgs);
      setAllMessages((prev) => ({
        ...prev,
        [targetConversationId]: updatedMsgs,
      }));

      try {
        await ChatMessageService.deleteMessage(messageId, user.id);

        toast.success("Message deleted", {
          description: "The message has been removed",
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });
      } catch (error) {
        const revertedMsgs = currentMsgs.map((msg) =>
          msg.id === messageId ? { ...msg, is_deleted: false } : msg
        );

        messagesRef.current.set(targetConversationId, revertedMsgs);
        setCurrentMessages(revertedMsgs);
        setAllMessages((prev) => ({
          ...prev,
          [targetConversationId]: revertedMsgs,
        }));

        toast.error("Error deleting message", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => deleteMessage(messageId),
          },
        });
      }
    },
    [user, selectedConversation]
  );

  const deleteConversation = useCallback(
    async (conversationId) => {
      if (!conversationId || !user) return;

      const targetId = conversationId || selectedConversation?.id;
      if (!targetId) return;

      const originalConversations = [...conversations];
      const conversationToDelete = conversations.find(
        (conv) => conv.id === targetId
      );

      setConversations((prev) => prev.filter((conv) => conv.id !== targetId));

      try {
        await ChatMessageService.deleteConversation(targetId, user.id);

        if (selectedConversation?.id === targetId) {
          closeChat(targetId);
        }

        setActiveChats((prev) => prev.filter((c) => c?.id !== targetId));
        setMinimizedChats((prev) => prev.filter((c) => c?.id !== targetId));

        messagesRef.current.delete(targetId);
        setAllMessages((prev) => {
          const { [targetId]: removed, ...rest } = prev;
          return rest;
        });

        unsubscribeFromMessages(targetId);

        toast.success("Conversation deleted", {
          description: `Chat with ${
            conversationToDelete?.other_user_full_name || "user"
          } has been removed`,
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });
      } catch (error) {
        setConversations(originalConversations);

        toast.error("Error deleting conversation", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => deleteConversation(conversationId),
          },
        });
      }
    },
    [
      user,
      selectedConversation,
      conversations,
      closeChat,
      unsubscribeFromMessages,
    ]
  );

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
    resendFailedMessage,
    deleteMessage,
    deleteConversation,
    openChat,
    minimizeChat,
    closeChat,
    closeAllChats,
    fetchMessages,
    fetchConversations,
  };
};
