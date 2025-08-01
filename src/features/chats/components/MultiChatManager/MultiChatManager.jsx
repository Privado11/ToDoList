import React, { useState, useRef, useEffect } from "react";
import MinimizedChatsContainer from "../MinimizedChatsContainer";
import ActiveChat from "../ActiveChat";
import { useChat, usePopover } from "@/context";
import { useMediaQuery } from "../../hooks";
import MobileChat from "../MobileChat";

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
    resendFailedMessage,
    openChat,
    minimizeChat,
    deleteMessage,
    deleteConversation,
  } = useChat();

  const { openPopover } = usePopover();

  const [messages, setMessages] = useState({});
  const [newMessageAnimation, setNewMessageAnimation] = useState({});
  const [showMobileChat, setShowMobileChat] = useState(false);

  const isMobile = useMediaQuery("(max-width: 767px)");
  const chatContainerRefs = useRef({});

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

  useEffect(() => {
    if (isMobile && selectedConversation) {
      setShowMobileChat(true);
    }
  }, [isMobile, selectedConversation]);

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

  const handleCloseMobileChat = (open) => {
    setShowMobileChat(false);

    if (selectedConversation) {
      closeChat(selectedConversation.id);
    }
    if (open) openPopover("chat");
  };

  const minimizedChatIds = minimizedChats
    .map((chat) => chat?.id)
    .filter(Boolean);

  if (isMobile && showMobileChat && selectedConversation) {
    console.log(isMobile, showMobileChat, selectedConversation);
    const chatMessages = allMessages[selectedConversation.id] || [];
    const currentMessage = messages[selectedConversation.id] || "";

    return (
      <MobileChat
        conversation={selectedConversation}
        messages={chatMessages}
        loadingMessages={loadingMessages}
        message={currentMessage}
        setMessage={(newMessage) =>
          updateMessage(selectedConversation.id, newMessage)
        }
        onSendMessage={handleSendMessage}
        onRetryMessage={resendFailedMessage}
        onClose={handleCloseMobileChat}
        chatContainerRef={(el) =>
          (chatContainerRefs.current[selectedConversation.id] = el)
        }
        onDeleteConversation={deleteConversation}
        onDeleteMessage={deleteMessage}
      />
    );
  }

  return (
    <div className="relative">
      {!isMobile && (
        <MinimizedChatsContainer
          minimizedChatIds={minimizedChatIds}
          conversations={conversations}
          newMessageAnimation={newMessageAnimation}
          onOpenChat={openChat}
          onCloseChat={closeChat}
        />
      )}

      {!isMobile &&
        activeChats.map((chat, index) => {
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
              message={currentMessage}
              setMessage={(newMessage) => updateMessage(chat.id, newMessage)}
              onSendMessage={handleSendMessage}
              onRetryMessage={resendFailedMessage}
              onSelectChat={openChat}
              onMinimize={minimizeChat}
              onClose={closeChat}
              chatContainerRef={(el) =>
                (chatContainerRefs.current[chat.id] = el)
              }
              onDeleteMessage={deleteMessage}
            />
          );
        })}
    </div>
  );
};

export default MultiChatManager;
