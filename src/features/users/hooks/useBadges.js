import { UserService } from "@/service";
import { useCallback, useState } from "react";

export const useBadges = (profile, user) => {
  const [badges, setBadges] = useState([]);
  const [pendingBadges, setPendingBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);

  const [error, setError] = useState(null);

  const [badgesLoading, setBadgesLoading] = useState({
    getBadges: false,
  });

  const setSpecificLoading = useCallback((operation, isLoading) => {
    setBadgesLoading((prev) => ({
      ...prev,
      [operation]: isLoading,
    }));
  }, []);

  const executeOperation = useCallback(
    async (operationName, operation, params = []) => {
      setSpecificLoading(operationName, true);
      setError(null);
      try {
        return await operation(...params);
      } catch (error) {
        console.error(error);
        setError(error.message);
        throw error;
      } finally {
        setSpecificLoading(operationName, false);
      }
    },
    [setSpecificLoading]
  );

  const getAllBadgesUser = useCallback(async () => {
    if (!user) return;

    const result = await executeOperation(
      "getBadges",
      (userId, profileId) => UserService.getAllBadgesUser(userId, profileId),
      [user.id, profile?.id]
    );

  
    setBadges(result?.all_badges || []);
    setPendingBadges(result?.pending_badges || []);
    setEarnedBadges(result?.earned_badges || []);
    return result;
  }, [user, profile, executeOperation]);

  return {
    badges,
    error,
    pendingBadges,
    earnedBadges,
    badgesLoading,
    getAllBadgesUser,
  };
};
