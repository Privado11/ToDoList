import { useAuthLogic } from "@/features/auth";
import { UserService } from "@/service";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export const useUserPrivacy = () => {
  const [privacy, setPrivacyState] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuthLogic();

  const executeOperation = useCallback(async (operation, params = []) => {
    setIsLoading(true);
    setError(null);
    try {
      return await operation(...params);
    } catch (error) {
      console.error(error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPrivacy = useCallback(async () => {
    if (!user) return null;

    const result = await executeOperation(
      (userId) => UserService.getUserPrivacySettings(userId),
      [user.id]
    );

    setPrivacyState(result);
    return result;
  }, [user, executeOperation]);

  const updatePrivacy = useCallback(
    async (privacySettings) => {
      if (!user) return;

      const result = await executeOperation(
        (userId, privacySettings) =>
          UserService.updateUserPrivacySettings(userId, privacySettings),
        [user.id, privacySettings]
      );

      setPrivacyState(result);

      if (result) {
        toast.success("Privacy settings updated successfully");
      } else {
        toast.error("Error updating privacy settings");
      }

      return result;
    },
    [user, executeOperation]
  );

  return {
    privacy,
    isLoading,
    error,
    getPrivacy,
    updatePrivacy,
  };
};
