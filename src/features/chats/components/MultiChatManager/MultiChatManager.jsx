import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContex";
import { useAuthLogic } from "@/features/auth";
import MinimizedChatsContainer from "../MinimizedChatsContainer";
import ActiveChat from "../ActiveChat";

const MultiChatManager = () => {
  const {
    conversations,
    selectedConversation,
    loadingMessages,
    activeChats,
    minimizedChats,
    allMessages,
    closeChat,
    sendMessage,
    openChat,
    minimizeChat,
  } = useChat();
  const { user } = useAuthLogic();

  const [messages, setMessages] = useState({});
  const [newMessageAnimation, setNewMessageAnimation] = useState({});

  const chatContainerRefs = useRef({});

  useEffect (() => {
    console.log(conversations);
  }, [conversations]);

  useEffect(() => {
    conversations.forEach((conv) => {
      if (
        conv.unread_count > 0 &&
        !activeChats.some((chat) => chat?.id === conv.id)
      ) {
        setNewMessageAnimation((prev) => ({
          ...prev,
          [conv.id]: true,
        }));

        setTimeout(() => {
          setNewMessageAnimation((prev) => ({
            ...prev,
            [conv.id]: false,
          }));
        }, 2000);
      }
    });
  }, [conversations, activeChats]);

  const updateMessage = (conversationId, newMessage) => {
    setMessages((prev) => ({
      ...prev,
      [conversationId]: newMessage,
    }));
  };

  const handleSendMessage = (e, conversationId) => {
    e.preventDefault();
    const currentMessage = messages[conversationId] || "";

    if (!currentMessage.trim()) return;

    const conversation = conversations.find(
      (conv) => conv.id === conversationId
    );
    if (conversation) {
      sendMessage(conversation.other_user_id, currentMessage, conversation.id);

      updateMessage(conversationId, "");
    }
  };


  const minimizedChatIds = minimizedChats
    .map((chat) => chat?.id)
    .filter(Boolean);

  return (
    <div className="relative">

      <MinimizedChatsContainer
        minimizedChatIds={minimizedChatIds}
        conversations={conversations}
        newMessageAnimation={newMessageAnimation}
        onOpenChat={openChat}
        onCloseChat={closeChat}
      />

      {activeChats.map((chat, index) => {
        if (!chat) return null;

        const isSelected = selectedConversation?.id === chat.id;
        const chatMessages = allMessages[chat.id] || [];
        const currentMessage = messages[chat.id] || "";

        return (
          <ActiveChat
            key={chat.id}
            conversation={chat}
            messages={chatMessages}
            isSelected={isSelected}
            position={index}
            loadingMessages={loadingMessages && isSelected}
            user={user}
            message={currentMessage}
            setMessage={(newMessage) => updateMessage(chat.id, newMessage)}
            onSendMessage={handleSendMessage}
            onSelectChat={openChat}
            onMinimize={minimizeChat}
            onClose={closeChat}
            chatContainerRef={(el) => (chatContainerRefs.current[chat.id] = el)}
          />
        );
      })}
    </div>
  );
};

export default MultiChatManager;
