import { AuthService } from "@/service";
import { useEffect, useState, useCallback, useRef } from "react";

export const useAuthLogic = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const currentProfileIdRef = useRef(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await AuthService.getUser();
        setUser(user);

        if (user && currentProfileIdRef.current !== user.id) {
          try {
            const profileData = await AuthService.getProfile(user.id);
            setProfile(profileData);
            currentProfileIdRef.current = user.id;
          } catch (profileError) {
            console.error("Error loading profile:", profileError);
            setProfile(null);
            currentProfileIdRef.current = null;
          }
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        setUser(null);
        setProfile(null);
        currentProfileIdRef.current = null;
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    const { unsubscribe } = AuthService.onAuthStateChange(
      async ({ event, user }) => {
        setUser(user);

        if (user) {
          if (currentProfileIdRef.current !== user.id) {
            try {
              const profileData = await AuthService.getProfile(user.id);
              setProfile(profileData);
              currentProfileIdRef.current = user.id;
            } catch (profileError) {
              console.error("Error loading profile:", profileError);
              setProfile(null);
              currentProfileIdRef.current = null;
            }
          }
        } else {
          setProfile(null);
          currentProfileIdRef.current = null;
        }

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const isProfileComplete = () => {
    return profile.is_complete;
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
    profile,
    isProfileComplete,
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
    checkEmail: (email) => handleAuth(() => AuthService.checkEmail(email)),
  };
};
