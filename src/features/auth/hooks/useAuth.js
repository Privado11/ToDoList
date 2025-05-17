import { AuthService } from "@/service";
import { useCallback, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useAuthLogic = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const currentProfileIdRef = useRef(null);
  const [passwordRecoveryEmail, setPasswordRecoveryEmail] = useState(false);

 
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        return await AuthService.getUser();
      } catch (error) {
        console.error("Error verifying user:", error);
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      try {
        currentProfileIdRef.current = user.id;
        return await AuthService.getProfile(user.id);
      } catch (error) {
        console.error("Error loading profile:", error);
        currentProfileIdRef.current = null;
        return null;
      }
    },
    enabled: !!user, 
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: false,
  });

  
  useQuery({
    queryKey: ["authListener"],
    queryFn: async () => {
      const { unsubscribe } = AuthService.onAuthStateChange(
        async ({ event, user }) => {
        
          queryClient.setQueryData(["currentUser"], user);

          if (event === "PASSWORD_RECOVERY") {
            setPasswordRecoveryEmail(true);
            return;
          }
          setPasswordRecoveryEmail(false);

          if (user) {
            if (currentProfileIdRef.current !== user.id) {
              try {
                const profileData = await AuthService.getProfile(user.id);
                
                queryClient.setQueryData(["profile", user.id], profileData);
                currentProfileIdRef.current = user.id;
              } catch (profileError) {
                console.error("Error loading profile:", profileError);
                currentProfileIdRef.current = null;
              }
            }
          } else {
            
            queryClient.setQueryData(
              ["profile", currentProfileIdRef.current],
              null
            );
            currentProfileIdRef.current = null;
          }
        }
      );

      
      return () => unsubscribe();
    },
    staleTime: Number.POSITIVE_INFINITY, 
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const isProfileComplete = useCallback(() => {
    if (!user) return false;

    const isAnonymous = user.is_anonymous;

    if (isAnonymous) return true;

    const fullName = user.user_metadata?.full_name;

    if (!fullName || fullName.trim() === "") return false;

    return user.user_metadata?.email_verified === true;
  }, [user]);


  const authMutation = useMutation({
    mutationFn: async ({ authFunction, params = [] }) => {
      setIsProcessing(true);
      setError(null);
      try {
        return await authFunction(...params);
      } catch (error) {
        console.error(error);
        setError(error.message);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
  
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

 
  const avatarMutation = useMutation({
    mutationFn: async ({ action, file = null }) => {
      setIsProcessing(true);
      setError(null);
      try {
        if (action === "upload" && file) {
          return await AuthService.updateAvatar(user?.id, file);
        } else if (action === "delete") {
          await AuthService.deleteAvatar(user?.id);
          return null;
        }
      } catch (error) {
        console.error(error);
        setError(error.message);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: (avatarUrl) => {
  
      queryClient.setQueryData(["profile", user?.id], (oldData) => {
        if (!oldData) return null;
        return {
          ...oldData,
          avatar_url: avatarUrl,
        };
      });
    },
  });


  const completeProfileMutation = useMutation({
    mutationFn: async ({ fullName, password, avatarFile }) => {
      setIsProcessing(true);
      setError(null);
      try {
        return await AuthService.completeProfile(
          fullName,
          password,
          user?.id,
          avatarFile
        );
      } catch (error) {
        console.error(error);
        setError(error.message);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: (result, { avatarFile }) => {

      queryClient.invalidateQueries({ queryKey: ["currentUser"] });

      if (avatarFile) {
        queryClient.setQueryData(["profile", user?.id], (oldData) => {
          if (!oldData) return null;
          return {
            ...oldData,
            avatar_url: result.user.user_metadata.avatar_url,
          };
        });
      }
    },
  });

  return {
    user,
    profile,
    isProfileComplete,
    loading: userLoading || profileLoading,
    isProcessing,
    error: error || userError || profileError,
    passwordRecoveryEmail,

    signInWithGoogle: () =>
      authMutation.mutate({ authFunction: AuthService.signInWithGoogle }),

    signInWithFacebook: () =>
      authMutation.mutate({ authFunction: AuthService.signInWithFacebook }),

    signInAsGuest: () =>
      authMutation.mutate({ authFunction: AuthService.signInAsGuest }),

    signUpWithEmail: (email, password) =>
      authMutation.mutate({
        authFunction: AuthService.signUpWithEmail,
        params: [email, password],
      }),

    resendEmailSignUp: (email) =>
      authMutation.mutate({
        authFunction: AuthService.resendEmailSignUp,
        params: [email],
      }),

    signInWithPhone: (phone) =>
      authMutation.mutate({
        authFunction: AuthService.signInWithPhone,
        params: [phone],
      }),

    signOut: () => authMutation.mutate({ authFunction: AuthService.signOut }),

    signInWithEmail: (email, password) =>
      authMutation.mutate({
        authFunction: AuthService.signInWithEmail,
        params: [email, password],
      }),

    signInWithMagicLink: (email) =>
      authMutation.mutate({
        authFunction: AuthService.signInWithMagicLink,
        params: [email],
      }),

    resetPassword: (email) =>
      authMutation.mutate({
        authFunction: AuthService.resetPassword,
        params: [email],
      }),

    completeProfile: (fullName, password, avatarFile) =>
      completeProfileMutation.mutate({ fullName, password, avatarFile }),

    updatePassword: (password) =>
      authMutation.mutate({
        authFunction: AuthService.updatePassword,
        params: [password],
      }),

    checkEmail: (email) =>
      authMutation.mutateAsync({
        authFunction: AuthService.checkEmail,
        params: [email],
      }),

    uploadAvatar: (file) => avatarMutation.mutate({ action: "upload", file }),

    deleteAvatar: () => avatarMutation.mutate({ action: "delete" }),
  };
};
