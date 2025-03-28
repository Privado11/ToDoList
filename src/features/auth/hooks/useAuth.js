import AuthService from "@/service/auth";
import { useEffect, useState, useCallback } from "react";


export const useAuthLogic = () => {
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await AuthService.getUser();
        setUser(user);

        console.log("User1",user);
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

  const handleAuth = useCallback(async (authFunction, ...params) => {
    setIsProcessing(true);
    try {
      setError(null);
      const result = await authFunction(...params);
      return result;
    } catch (error) {
      console.error(error);
      setError(error.message);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return {
    user,
    isVerified,
    loading,
    isProcessing,
    error,
    signInWithGoogle: () => handleAuth(() => AuthService.signInWithGoogle()),
    signInWithFacebook: () =>
      handleAuth(() => AuthService.signInWithFacebook()),
    signInAsGuest: () => handleAuth(() => AuthService.signInAsGuest()),
    signUpWithEmail: (email, password) =>
      handleAuth(() => AuthService.signUpWithEmail(email, password)),
    signInWithPhone: (phone) =>
      handleAuth(() => AuthService.signInWithPhone(phone)),
    signOut: () => handleAuth(() => AuthService.signOut()),
    signInWithEmail: (email, password) =>
      handleAuth(() => AuthService.signInWithEmail(email, password)),
    signInWithMagicLink: (email) =>
      handleAuth(() => AuthService.signInWithMagicLink(email)),
    resetPassword: (email) =>
      handleAuth(() => AuthService.resetPassword(email)),
    completeProfile: (fullName, password) =>
      handleAuth(() =>
        AuthService.completeProfile(fullName, password, user?.id)
      ),
    updatePassword: (password) =>
      handleAuth(() => AuthService.updatePassword(password)),
  };
};
