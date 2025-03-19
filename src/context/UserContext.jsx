import { useUsers } from "@/features";
import React, { createContext, useContext } from "react";

const userContext = createContext();

export const useUserContext = () => {
  const context = useContext(userContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};

export function UserProvider({ children }) {
  const userLogic = useUsers();

  return (
    <userContext.Provider value={userLogic}>{children}</userContext.Provider>
  );
}
