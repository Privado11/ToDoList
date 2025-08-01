import { AuthService } from "@/service";
import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useAuthLogic = () => {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [passwordRecoveryEmail, setPasswordRecoveryEmail] = useState(false);

  const {
    data: user,
    isLoading: userQueryLoading,
    error: userQueryError,
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
        }
      );
      return () => unsubscribe();
    },
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const authMutation = useMutation({
    mutationFn: async ({ authFunction, params = [] }) => {
      setIsProcessing(true);
      setAuthError(null);
      try {
        return await authFunction(...params);
      } catch (error) {
        console.error(error);
        setAuthError(error.message);
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });

  const signInWithGoogle = useCallback(
    () => authMutation.mutate({ authFunction: AuthService.signInWithGoogle }),
    [authMutation]
  );

  const signInWithFacebook = useCallback(
    () => authMutation.mutate({ authFunction: AuthService.signInWithFacebook }),
    [authMutation]
  );

  const signInAsGuest = useCallback(
    () => authMutation.mutate({ authFunction: AuthService.signInAsGuest }),
    [authMutation]
  );

  const signUpWithEmail = useCallback(
    (email, password) =>
      authMutation.mutate({
        authFunction: AuthService.signUpWithEmail,
        params: [email, password],
      }),
    [authMutation]
  );

  // Changed to use mutateAsync to return a promise
  const signInWithEmail = useCallback(
    (email, password) =>
      authMutation.mutateAsync({
        authFunction: AuthService.signInWithEmail,
        params: [email, password],
      }),
    [authMutation]
  );

  const signInWithMagicLink = useCallback(
    (email) =>
      authMutation.mutateAsync({
        authFunction: AuthService.signInWithMagicLink,
        params: [email],
      }),
    [authMutation]
  );

  const signInWithPhone = useCallback(
    (phone) =>
      authMutation.mutate({
        authFunction: AuthService.signInWithPhone,
        params: [phone],
      }),
    [authMutation]
  );

  const signOut = useCallback(
    () => authMutation.mutate({ authFunction: AuthService.signOut }),
    [authMutation]
  );

  const signOutLocal = useCallback(
    () => authMutation.mutate({ authFunction: AuthService.signOutLocal }),
    [authMutation]
  );

  const checkEmail = useCallback(
    (email) =>
      authMutation.mutateAsync({
        authFunction: AuthService.checkEmail,
        params: [email],
      }),
    [authMutation]
  );

  const resetPassword = useCallback(
    (email) =>
      authMutation.mutateAsync({
        authFunction: AuthService.resetPassword,
        params: [email],
      }),
    [authMutation]
  );

  const updatePassword = useCallback(
    (currentPassword, newPassword) =>
      authMutation.mutateAsync({
        authFunction: (current, newPass) =>
          AuthService.updatePassword(user, current, newPass),
        params: [currentPassword, newPassword],
      }),
    [authMutation, user]
  );

  const resendEmailSignUp = useCallback(
    (email) =>
      authMutation.mutateAsync({
        authFunction: AuthService.resendEmailSignUp,
        params: [email],
      }),
    [authMutation]
  );

  const linkWithEmail = useCallback(
    async (email) => {
      try {
        const result = await authMutation.mutateAsync({
          authFunction: AuthService.linkWithEmail,
          params: [email],
        });

        queryClient.invalidateQueries({ queryKey: ["profile"] });

        return result;
      } catch (error) {
        throw error;
      }
    },
    [authMutation, queryClient]
  );

  const linkWithGoogle = useCallback(
    () => authMutation.mutate({ authFunction: AuthService.linkWithGoogle }),
    [authMutation]
  );

  const linkWithFacebook = useCallback(
    () => authMutation.mutate({ authFunction: AuthService.linkWithFacebook }),
    [authMutation]
  );

  return {
    user,
    loading: userQueryLoading,
    isProcessing,
    authError: authError || userQueryError,
    passwordRecoveryEmail,

    signInWithGoogle,
    signInWithFacebook,
    signInAsGuest,
    signUpWithEmail,
    signInWithEmail,
    signInWithMagicLink,
    signInWithPhone,
    signOut,
    signOutLocal,
    checkEmail,
    resetPassword,
    updatePassword,
    resendEmailSignUp,

    linkWithEmail,
    linkWithGoogle,
    linkWithFacebook,
  };
};
