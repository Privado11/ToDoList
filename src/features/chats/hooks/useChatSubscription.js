import { ChatSubscriptionService } from "@/service";
import { useState, useEffect, useCallback, useRef } from "react";

export const useChatSubscription = (setConversations) => {
  const activeSubscriptionRef = useRef(null);
  const [userId, setUserId] = useState(null);

  const subscribeToConversation = useCallback(
    (id, getConversations) => {
      if (activeSubscriptionRef.current && userId) {
        ChatSubscriptionService.unsubscribeFromConversation(userId);
      }

      setUserId(id);

      const subscription = ChatSubscriptionService.subscribeToUserConversations(
        id,
        {
          onConversationsChange: (updatedConversations) => {
            setConversations(updatedConversations);
          },
          getConversations,
        }
      );

      activeSubscriptionRef.current = subscription;
    },
    [setConversations, userId]
  );

  const unsubscribe = useCallback(() => {
    if (activeSubscriptionRef.current && userId) {
      ChatSubscriptionService.unsubscribeFromConversation(userId);
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

export const useMultiMessageSubscription = () => {
  const activeSubscriptionsRef = useRef(new Map());

  const subscribeToMessages = useCallback(
    (conversationId, getMessages, onMessagesChange) => {
      if (activeSubscriptionsRef.current.has(conversationId)) {
        return;
      }

      const subscription = ChatSubscriptionService.subscribeToMessages(
        conversationId,
        {
          onMessagesChange: (updatedMessages) => {
            onMessagesChange(conversationId, updatedMessages);
          },
          getMessages: () => getMessages(conversationId),
        }
      );

      activeSubscriptionsRef.current.set(conversationId, subscription);
    },
    []
  );

  const unsubscribeFromMessages = useCallback((conversationId) => {
    if (activeSubscriptionsRef.current.has(conversationId)) {
      ChatSubscriptionService.unsubscribeFromMessages(conversationId);
      activeSubscriptionsRef.current.delete(conversationId);
    }
  }, []);

  const unsubscribeFromAllMessages = useCallback(() => {
    activeSubscriptionsRef.current.forEach((_, conversationId) => {
      ChatSubscriptionService.unsubscribeFromMessages(conversationId);
    });
    activeSubscriptionsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      unsubscribeFromAllMessages();
    };
  }, [unsubscribeFromAllMessages]);

  return {
    subscribeToMessages,
    unsubscribeFromMessages,
    unsubscribeFromAllMessages,
  };
};
