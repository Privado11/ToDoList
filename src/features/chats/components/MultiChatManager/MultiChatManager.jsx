import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/context/ChatContex";
import { useAuthLogic } from "@/features/auth";
import NewChatButton from "../NewChatButton";
import ContactSelector from "../ContactSelector";
import MinimizedChatsContainer from "../MinimizedChatsContainer";
import ActiveChat from "../ActiveChat";


const MultiChatManager = () => {
  const {
    conversations,
    selectedConversation,
    currentMessages,
    loadingMessages,
    activeChats,
    minimizedChats,
    allMessages,
    closeChat,
    sendMessage,
    openChat,
    minimizeChat,
    fetchConversations,
  } = useChat();
  const { user } = useAuthLogic();

  const [message, setMessage] = useState("");
  const [showNewChatButton, setShowNewChatButton] = useState(true);
  const [newMessageAnimation, setNewMessageAnimation] = useState({});

  const chatContainerRefs = useRef({});

  useEffect(() => {
    if (currentMessages?.length > 0 && selectedConversation) {
      const ref = chatContainerRefs.current[selectedConversation.id];
      if (ref) {
        ref.scrollTop = ref.scrollHeight;
      }
    }
  }, [currentMessages, selectedConversation]);


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


  const handleSendMessage = (e, conversationId) => {
    e.preventDefault();
    if (!message.trim()) return;

    const conversation = conversations.find(
      (conv) => conv.id === conversationId
    );
    if (conversation) {
      sendMessage(conversation.other_user_id, message, conversation.id);
      setMessage("");
    }
  };

 
  const handleSelectContact = (conversation) => {
    openChat(conversation);
    setShowNewChatButton(true);
  };

  
  const minimizedChatIds = minimizedChats
    .map((chat) => chat?.id)
    .filter(Boolean);

  return (
    <div className="relative">
      {showNewChatButton ? (
        <NewChatButton onClick={() => setShowNewChatButton(false)} />
      ) : (
        <ContactSelector
          conversations={conversations}
          onSelectContact={handleSelectContact}
          onClose={() => setShowNewChatButton(true)}
        />
      )}

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
        const messages = allMessages[chat.id] || [];

        return (
          <ActiveChat
            key={chat.id}
            conversation={chat}
            messages={messages}
            isSelected={isSelected}
            position={index}
            loadingMessages={loadingMessages && isSelected}
            user={user}
            message={isSelected ? message : ""}
            setMessage={setMessage}
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
