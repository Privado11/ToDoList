import React from "react";
import { AuthProvider } from "./AuthContext";
import { ToastProvider } from "./ToastContext";
import { TaskProvider } from "./TaskContext";
import { UserProvider } from "./UserContext";
import { FriendShipProvider } from "./FriendShipContext";

export const CombinedProviders = ({ children }) => (
  <AuthProvider>
    <UserProvider>
      <ToastProvider>
        <TaskProvider>
          <FriendShipProvider>{children}</FriendShipProvider>
        </TaskProvider>
      </ToastProvider>
    </UserProvider>
  </AuthProvider>
);
