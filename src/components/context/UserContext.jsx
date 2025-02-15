import React, { createContext, useContext } from "react";
import { useUsers } from "../hooks/users/useUsers";

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
