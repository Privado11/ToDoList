import React, { createContext, useContext } from "react";
import { useAuthLogic } from "../hooks/useAuth";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const auth = useAuthLogic(); 

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
