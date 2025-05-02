import { useAuthLogic } from "@/features/auth";
import UserService from "@/service/users";
import { useCallback, useEffect, useState } from "react";

export const useUsers = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuthLogic();

  const completeProfile = useCallback(
    async (fullName, password) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await UserService.completeProfile(
          user.id,
          fullName,
          password
        );
        return data;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const checkFullNameUpdateTime = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await UserService.checkFullNameUpdateTime(userId);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkUsernameUpdateTime = useCallback(async (userId) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await UserService.checkUsernameUpdateTime(userId);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkUsernameAvailability = useCallback(async (username) => {
    if (!username) return;
    setLoading(true);
    setError(null);
    try {
      const data = await UserService.checkUsernameAvailability(username);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUsername = useCallback(async (username) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await UserService.updateUsername(user.id, username);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFullName = useCallback(async (fullName) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await UserService.updateFullName(user.id, fullName);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfilePicture = useCallback(async (file) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await UserService.updateProfilePicture(user.id, file);
      return data;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    completeProfile,
    checkFullNameUpdateTime,
    checkUsernameUpdateTime,
    checkUsernameAvailability,
    updateUsername,
    updateFullName,
    updateProfilePicture,
  };
};
