import React from "react";
import { AuthProvider } from "./AuthContext";
import { ToastProvider } from "./ToastContext";
import { TaskProvider } from "./TaskContext";
import { UserProvider } from "./UserContext";
import { FriendShipProvider } from "./FriendShipContext";
import { ChatProvider } from "./ChatContex";

export const CombinedProviders = ({ children }) => (
  <AuthProvider>
    <UserProvider>
      <ChatProvider>
        <ToastProvider>
          <TaskProvider>
            <FriendShipProvider>{children}</FriendShipProvider>
          </TaskProvider>
        </ToastProvider>
      </ChatProvider>
    </UserProvider>
  </AuthProvider>
);
