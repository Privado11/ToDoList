import {useChatMessages } from "@/features";
import React, { createContext, useContext } from "react";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const chatLogic = useChatMessages();

  return (
    <ChatContext.Provider value={chatLogic}>{children}</ChatContext.Provider>
  );
};
