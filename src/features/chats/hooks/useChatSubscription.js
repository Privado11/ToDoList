import ChatSubscriptionService from "@/service/message/ChatSubscriptionService";
import { useState, useEffect, useCallback, useRef } from "react";

export const useChatSubscription = (setConversations) => {
  const activeSubscriptionRef = useRef(null);
  const [userId, setUserId] = useState(null);

  const subscribeToConversation = useCallback(
    (id, getConversations) => {
      if (activeSubscriptionRef.current && userId) {
        ChatSubscriptionService.unsubscribeFromConversation();
      }

      setUserId(id);

      const subscription = ChatSubscriptionService.subscribeToConversation(id, {
        onConversationChange: (updatedConversation) => {
          setConversations(updatedConversation);
        },
        getConversations,
      });

      activeSubscriptionRef.current = subscription;
    },
    [setConversations, userId]
  );

  const unsubscribe = useCallback(() => {
    if (activeSubscriptionRef.current && userId) {
      ChatSubscriptionService.unsubscribeFromConversation();
      activeSubscriptionRef.current = null;
      setUserId(null);
    }
  }, [userId]);

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    subscribeToConversation,
    unsubscribe,
  };
};

export const useMessageSubscription = (setCurrentMessages) => {
  const activeSubscriptionRef = useRef(null);
  const [conversationId, setConversationId] = useState(null);

  const subscribeToMessages = useCallback(
    (id, getMessages) => {
      if (activeSubscriptionRef.current && conversationId) {
        // Pass the current conversationId when unsubscribing
        ChatSubscriptionService.unsubscribeFromMessages(conversationId);
      }
      setConversationId(id);

      const subscription = ChatSubscriptionService.subscribeToMessages(id, {
        onMessagesChange: (updatedMessages) => {
          setCurrentMessages(updatedMessages);
        },
        getMessages,
      });

      activeSubscriptionRef.current = subscription;
    },
    [setCurrentMessages, conversationId]
  );

  const unsubscribe = useCallback(() => {
    if (activeSubscriptionRef.current && conversationId) {
      // Pass the conversationId when unsubscribing
      ChatSubscriptionService.unsubscribeFromMessages(conversationId);
      activeSubscriptionRef.current = null;
      setConversationId(null);
    }
  }, [conversationId]);

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    subscribeToMessages,
    unsubscribe,
  };
};