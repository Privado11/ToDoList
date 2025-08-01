import { useNotifications } from "@/features/notifications";
import React, { createContext, useContext, useCallback } from "react";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const notificationLogic = useNotifications();

  return (
    <NotificationContext.Provider value={notificationLogic}>{children}</NotificationContext.Provider>
  );
};
