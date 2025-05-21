import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthContext";
import { TaskProvider } from "./TaskContext";
import { UserProvider } from "./UserContext";
import { FriendShipProvider } from "./FriendShipContext";
import { ChatProvider } from "./ChatContex";
import { NotificationProvider } from "./NotificationContext";
import { PopoverProvider } from "./PopoverContext";

const queryClient = new QueryClient();

export const CombinedProviders = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UserProvider>
        <PopoverProvider>
          <ChatProvider>
            <NotificationProvider>
              <TaskProvider>
                <FriendShipProvider>{children}</FriendShipProvider>
              </TaskProvider>
            </NotificationProvider>
          </ChatProvider>
        </PopoverProvider>
      </UserProvider>
    </AuthProvider>
  </QueryClientProvider>
);
