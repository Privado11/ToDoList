import { useEffect, useState } from "react";
import AuthService from "../service/authService";

export const useAuthLogic = () => {
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await AuthService.getUser();
        setUser(user);
        setIsVerified(user?.user_metadata?.email_verified ?? false);
      } catch (error) {
        setUser(null);
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { unsubscribe } = AuthService.onAuthStateChange(
      ({ user, isVerified }) => {
        setUser(user);
        setIsVerified(isVerified);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAuth = async (authFunction, ...params) => {
    try {
      setError(null);
      await authFunction(...params);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    user,
    isVerified,
    loading,
    error,
    signInWithGoogle: () => handleAuth(AuthService.signInWithGoogle),
    signInWithFacebook: () => handleAuth(AuthService.signInWithFacebook),
    signInAsGuest: () => handleAuth(AuthService.signInAsGuest),
    signUpWithEmail: (email) => handleAuth(AuthService.signUpWithEmail, email),
    signOut: () => handleAuth(AuthService.signOut),
    signInWithEmail: (email, password) =>
      handleAuth(AuthService.signInWithEmail, email, password),
    signInWithMagicLink: (email) =>
      handleAuth(AuthService.signInWithMagicLink, email),
    resetPassword: (email) => handleAuth(AuthService.resetPassword, email),
    completeProfile: (fullName, password) =>
      handleAuth(AuthService.completeProfile, fullName, password),
    updatePassword: (password) =>
      handleAuth(AuthService.updatePassword, password),
  };
};
