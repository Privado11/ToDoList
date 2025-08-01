import { getAvailableInterests } from "@/service";
import { UserService } from "@/service";
import { useCallback, useState, useEffect, useMemo } from "react";
import { toast } from "sonner";

export const useInterests = (
  user,
  viewedProfile,
  addInterestsToViewedProfile,
  deleteInterestFromViewedProfile
) => {
  const [availableInterests, setAvailableInterests] = useState([]);

  const [error, setError] = useState(null);

  const userInterests = useMemo(() => {
    return viewedProfile?.interests || [];
  }, [viewedProfile?.interests]);

  const [interestLoading, setInterestLoading] = useState({
    fetchAvailableInterests: false,
    addInterests: false,
    removeInterest: false,
  });


  const isLoading = Object.values(interestLoading).some((loading) => loading);

  const setSpecificLoading = useCallback((operation, isLoading) => {
    setInterestLoading((prev) => ({
      ...prev,
      [operation]: isLoading,
    }));
  }, []);

  useEffect(() => {
    const fetchInterests = async () => {
      setSpecificLoading("fetchAvailableInterests", true);
      try {
        const interestsData = await getAvailableInterests(user.id);
        if (interestsData) setAvailableInterests(interestsData);
      } catch (error) {
        console.error("Error fetching available interests:", error);
        setError(error.message);
      } finally {
        setSpecificLoading("fetchAvailableInterests", false);
      }
    };

    if (
      user &&
      user.id &&
      viewedProfile &&
      viewedProfile.id &&
      user.id === viewedProfile.id
    ) {
      fetchInterests();
    }
  }, [user, viewedProfile, setSpecificLoading]);

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

  const addInterests = useCallback(
    async (interests) => {
      if (!user) return;

      const interestIds = interests.map((i) => i.id);

      const result = await executeOperation(
        "addInterests",
        (userId, ids) => UserService.addUserInterests(userId, ids),
        [user.id, interestIds]
      );

      if (result) {
        addInterestsToViewedProfile(interests);
        toast.success("Interests updated successfully");
      } else {
        toast.error("Error updating interests");
      }

      return result;
    },
    [user, executeOperation, addInterestsToViewedProfile]
  );

  const removeInterest = useCallback(
    async (interestId) => {
      if (!user) return;

      const result = await executeOperation(
        "removeInterest",
        (userId, interestId) =>
          UserService.removeUserInterest(userId, interestId),
        [user.id, interestId]
      );

      if (result) {
        deleteInterestFromViewedProfile(interestId);
      }

      return result;
    },
    [user, executeOperation, deleteInterestFromViewedProfile]
  );

  return {
    availableInterests,
    userInterests,
    isLoading,
    interestLoading,
    error,
    addInterests,
    removeInterest,
  };
};
