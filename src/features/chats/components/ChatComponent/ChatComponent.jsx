import React, { useState, useRef, useEffect } from "react";


import {
  ChatHeader,
  MessageInput,
  MessageList,
  NewMessageNotification,
} from "..";
import ChatToggleButton from "../ChatToggleButton";
import { groupMessagesByDate } from "../../utils/messageUtils";
import { Card, CardContent } from "@/components/ui/card";
import { useChat } from "@/context/ChatContex";
import { useAuthLogic } from "@/features/auth";

const ChatComponent = () => {
  const {
    isChatOpen,
    loadingMessages,
    selectedConversation,
    currentMessages,
    closeChat,
    sendMessage,
  } = useChat();
  const { user } = useAuthLogic();
  const [message, setMessage] = useState("");
  const [newMessageAnimation, setNewMessageAnimation] = useState(false);

  const chatContainerRef = useRef(null);

   useEffect(() => {
     if (
       isChatOpen &&
       chatContainerRef.current &&
       currentMessages?.length > 0
     ) {
       chatContainerRef.current.scrollTop =
         chatContainerRef.current.scrollHeight;
     }
   }, [isChatOpen, currentMessages]);

   useEffect(() => {
     if (selectedConversation?.unread_count > 0 && !isChatOpen) {
       setNewMessageAnimation(true);
       setTimeout(() => setNewMessageAnimation(false), 2000);
     }
   }, [selectedConversation, isChatOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedConversation) return;

    sendMessage(selectedConversation?.other_user_id, message);
    setMessage("");
  };

  const toggleChat = () => {
    closeChat(!isChatOpen);
  };

  const groupedMessages = groupMessagesByDate(currentMessages);

  return (
    <div className="relative">
      <ChatToggleButton
        isChatOpen={isChatOpen}
        toggleChat={toggleChat}
        unreadCount={selectedConversation?.unread_count}
        newMessageAnimation={newMessageAnimation}
      />

      {newMessageAnimation && !isChatOpen && <NewMessageNotification />}

      {isChatOpen && selectedConversation && (
        <Card className="fixed bottom-20 right-6 w-80 sm:w-96 shadow-xl z-40 border-none">
          <ChatHeader conversation={selectedConversation} />
          <CardContent className="p-0">
            <div className="flex flex-col h-96 overflow-hidden">
              <MessageList
                messages={currentMessages}
                loadingMessages={loadingMessages}
                groupedMessages={groupedMessages}
                user={user}
                chatContainerRef={chatContainerRef}
              />
              <MessageInput
                message={message}
                setMessage={setMessage}
                handleSendMessage={handleSendMessage}
                loadingMessages={loadingMessages}
                selectedConversation={selectedConversation}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <style jsx global>{`
        @keyframes fade-in-out {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ChatComponent;
