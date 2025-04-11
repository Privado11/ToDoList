import AuthService from "@/service/auth";
import { useEffect, useState, useCallback } from "react";


export const useAuthLogic = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await AuthService.getUser();
        setUser(user || null);
        if(user){
          const profile = await AuthService.getProfile(user.id);
          setProfile(profile);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { unsubscribe } = AuthService.onAuthStateChange(async ({ user }) => {
        setUser(user);
        try {
          if (user) {
            const profile = await AuthService.getProfile(user.id);
            setProfile(profile);
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          setProfile(null); 
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const isProfileComplete = () => {
    return profile?.is_complete;
  };

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
    loading,
    isProcessing,
    error,
    profile,
    isProfileComplete,
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
