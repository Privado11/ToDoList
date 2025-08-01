import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./AuthContext";
import { TaskProvider } from "./TaskContext";
import { FriendShipProvider } from "./FriendShipContext";
import { ChatProvider } from "./ChatContext";
import { NotificationProvider } from "./NotificationContext";
import { PopoverProvider } from "./PopoverContext";
import { ProfileProvider } from "./ProfileContext";

const queryClient = new QueryClient();

export const CombinedProviders = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProfileProvider>
        <PopoverProvider>
          <ChatProvider>
            <NotificationProvider>
              <TaskProvider>
                <FriendShipProvider>{children}</FriendShipProvider>
              </TaskProvider>
            </NotificationProvider>
          </ChatProvider>
        </PopoverProvider>
      </ProfileProvider>
    </AuthProvider>
  </QueryClientProvider>
);
