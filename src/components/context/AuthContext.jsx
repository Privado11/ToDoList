import React, { createContext, useContext } from "react";
import { useAuthLogic } from "../hooks/useAuth";

const defaultAuthContext = {
  user: null,
  isVerified: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  signInWithFacebook: async () => {},
  signInAsGuest: async () => {},
  signUpWithEmail: async () => {},
  signOut: async () => {},
  signInWithEmail: async () => {},
  signInWithMagicLink: async () => {},
  resetPassword: async () => {},
  completeProfile: async () => {},
  updatePassword: async () => {},
};

export const AuthContext = createContext(defaultAuthContext);

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
};

export const AuthProvider = ({ children }) => {
  const auth = useAuthLogic();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};