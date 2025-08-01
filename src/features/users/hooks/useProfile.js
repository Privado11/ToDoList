import { AuthService, TaskService, UserService } from "@/service";
import { useCallback, useState, useRef, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthLogic } from "@/features/auth";

export const useProfile = () => {
  const queryClient = useQueryClient();
  const [userError, setUserError] = useState(null);
  const tempUrlsRef = useRef(new Set());
  const [viewedProfile, setViewedProfile] = useState(null);
  const currentProfileIdRef = useRef(null);
  const [timeMsgFullName, setTimeMsgFullName] = useState("");
  const [timeMsgUsername, setTimeMsgUsername] = useState("");
  const { user } = useAuthLogic();

  const [profileLoading, setProfileLoading] = useState({
    completeProfile: false,
    checkFullNameUpdateTime: false,
    checkUsernameUpdateTime: false,
    checkUsernameAvailability: false,
    updateProfile: false,
    updateProfilePicture: false,
    deleteOldAvatar: false,
    saveUserLanguage: false,
    getUserById: false,
    getUserByusername: false,
    getTasksChartData: false,
    getUserTasksWithPrivacy: false,
    updateFullName: false,
  });

  const setSpecificLoading = useCallback((operation, isLoading) => {
    setProfileLoading((prev) => ({
      ...prev,
      [operation]: isLoading,
    }));
  }, []);

  const {
    data: profile,
    isLoading,
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

  const executeOperation = useCallback(
    async (operation, userFunction, params = []) => {
      setSpecificLoading(operation, true);
      setUserError(null);
      try {
        return await userFunction(...params);
      } catch (error) {
        console.error(error);
        setUserError(error.message);
        throw error;
      } finally {
        setSpecificLoading(operation, false);
      }
    },
    [setSpecificLoading]
  );

  const getUserById = useCallback(
    async (userId) => {
      if (!userId) return null;

      const result = await executeOperation(
        "getUserById",
        (userId) => UserService.getUserById(userId),
        [userId]
      );

      return result;
    },
    [executeOperation]
  );

  const getUserByUsername = useCallback(
    async (username) => {
      if (!user || !username) return null;

      const result = await executeOperation(
        "getUserByusername",
        (userId, username) => UserService.getUserByUsername(userId, username),
        [user.id, username]
      );

      if (result) {
        setViewedProfile(result);
      }

      return result;
    },
    [user, executeOperation]
  );

  const updateFullName = useCallback(
    async (fullName) => {
      if (!user) return;

      const result = await executeOperation(
        "updateFullName",
        (userId, fullName) => UserService.updateFullName(userId, fullName),
        [user.id, fullName]
      );
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      if (result) {
        toast.success("Full name updated successfully", {
          description: `Your full name has been changed to "${fullName}"`,
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });
      } else {
        toast.error("Error updating full name", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => updateFullName(fullName),
          },
        });
      }
      return result;
    },
    [user, executeOperation, queryClient]
  );

  const saveUserLanguage = useCallback(
    async (language) => {
      if (!user) return;

      const result = await executeOperation(
        "saveUserLanguage",
        (userId, language) => UserService.saveUserLanguage(userId, language),
        [user.id, language]
      );

      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      if (result) {
        toast.success("Language updated successfully", {
          description: `Language has been changed to "${language}"`,
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });
      } else {
        toast.error("Error updating language", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => saveUserLanguage(language),
          },
        });
      }

      return result;
    },
    [user, executeOperation, queryClient]
  );

  const formatTimeMessage = useCallback((timeRemaining, fieldType) => {
    const { days, hours, minutes } = timeRemaining;
    let timeMessage = `Next ${fieldType} update available in: `;

    if (days > 0) timeMessage += `${days} day${days > 1 ? "s" : ""} `;
    if (hours > 0) timeMessage += `${hours} hour${hours > 1 ? "s" : ""} `;
    if (minutes > 0)
      timeMessage += `${minutes} minute${minutes > 1 ? "s" : ""}`;

    return timeMessage.trim();
  }, []);

  const checkFullNameUpdateTime = useCallback(
    async (userId) => {
      if (!userId) return;
      const canUpdateFullName = await executeOperation(
        "checkFullNameUpdateTime",
        (userId) => UserService.checkFullNameUpdateTime(userId),
        [user.id]
      );

      if (!canUpdateFullName?.canUpdate) {
        setTimeMsgFullName(
          formatTimeMessage(canUpdateFullName.timeRemaining, "full name")
        );
      } else {
        setTimeMsgFullName("");
      }
    },
    [user, executeOperation, formatTimeMessage]
  );

  const checkUsernameUpdateTime = useCallback(
    async (userId) => {
      if (!userId) return;
      const canUpdateUsername = await executeOperation(
        "checkUsernameUpdateTime",
        (userId) => UserService.checkUsernameUpdateTime(userId),
        [user.id]
      );

      if (!canUpdateUsername?.canUpdate) {
        setTimeMsgUsername(
          formatTimeMessage(canUpdateUsername.timeRemaining, "username")
        );
      } else {
        setTimeMsgUsername("");
      }
    },
    [user, executeOperation, formatTimeMessage]
  );

  const checkUsernameAvailability = useCallback(
    async (username) => {
      return executeOperation(
        "checkUsernameAvailability",
        (username) => UserService.checkUsernameAvailability(username),
        [username]
      );
    },
    [executeOperation]
  );

  const getUserTasksWithPrivacy = useCallback(async () => {
    if (!viewedProfile) return null;
    return executeOperation(
      "getUserTasksWithPrivacy",
      (viewedProfileId, requestingUserId) =>
        TaskService.getUserTasksWithPrivacy(viewedProfileId, requestingUserId),
      [viewedProfile.id, profile?.id]
    );
  }, [viewedProfile, profile, executeOperation]);

  const getTasksChartData = useCallback(async () => {
    if (!viewedProfile) return;
    return executeOperation(
      "getTasksChartData",
      (viewedProfileId, requestingUserId) =>
        TaskService.getTasksChartData(viewedProfileId, requestingUserId),
      [viewedProfile.id, profile?.id]
    );
  }, [viewedProfile, profile, executeOperation]);

  const updateProfile = useCallback(
    async (formData) => {
      if (!user) return;

      setSpecificLoading("updateProfile", true);
      setUserError(null);

      try {
        const results = {};
        const errors = [];

        const rawUsername = formData.username?.trim();
        const newUsername = rawUsername?.startsWith("@")
          ? rawUsername
          : `@${rawUsername}`;
        const newFullName = formData.fullName?.trim();
        const newDescription = formData.description?.trim();
        const newLocation = formData?.location;

        if (newUsername && newUsername !== profile.username) {
          try {
            const usernameResult = await UserService.updateUsername(
              user.id,
              newUsername
            );
            results.username = usernameResult;
          } catch (err) {
            errors.push({ field: "username", message: err.message });
          }
        }

        if (newFullName && newFullName !== profile.full_name) {
          try {
            const fullNameResult = await UserService.updateFullName(
              user.id,
              newFullName
            );
            results.fullName = fullNameResult;
          } catch (err) {
            errors.push({ field: "fullName", message: err.message });
          }
        }

        if (newDescription && newDescription !== profile.description) {
          try {
            const descriptionResult = await UserService.updateDescription(
              user.id,
              newDescription
            );
            results.description = descriptionResult;
          } catch (err) {
            errors.push({ field: "description", message: err.message });
          }
        }

        const hasLocationChanged =
          newLocation?.city !== profile.city ||
          newLocation?.state !== profile.state ||
          newLocation?.country !== profile.country;

        if (newLocation && hasLocationChanged) {
          try {
            const locationResult = await UserService.updateLocation(
              user.id,
              newLocation
            );
            results.location = locationResult;
          } catch (err) {
            errors.push({ field: "location", message: err.message });
          }
        }

        if (errors.length > 0) {
          const errorMessage = `Update errors: ${errors
            .map((e) => `${e.field}: ${e.message}`)
            .join(", ")}`;

          toast.error("Error updating profile", {
            description: "Please try again later",
            action: {
              label: "Retry",
              onClick: () => updateProfile(formData),
            },
          });
          throw new Error(errorMessage);
        }

        const updatedFields = Object.keys(results);
        if (updatedFields.length > 0) {
          toast.success("Profile updated successfully", {
            description: `Updated: ${updatedFields.join(", ")}`,
            action: {
              label: "Dismiss",
              onClick: () => toast.dismiss(),
            },
          });
        } else {
          toast.info("No changes made to profile", {
            action: {
              label: "Dismiss",
              onClick: () => toast.dismiss(),
            },
          });
        }

        queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        queryClient.invalidateQueries({ queryKey: ["profile"] });

        return results;
      } catch (err) {
        if (!err.message.includes("Update errors")) {
          toast.error("Unexpected error occurred", {
            description: "Please try again later",
            action: {
              label: "Retry",
              onClick: () => updateProfile(formData),
            },
          });
        }

        setUserError(err.message);
        throw err;
      } finally {
        setSpecificLoading("updateProfile", false);
      }
    },
    [user, queryClient, profile, setSpecificLoading]
  );

  const updateProfilePicture = useCallback(
    async (file) => {
      if (!profile) return null;

      setSpecificLoading("updateProfilePicture", true);
      setUserError(null);

      const tempUrl = URL.createObjectURL(file);
      tempUrlsRef.current.add(tempUrl);

      try {
        queryClient.setQueryData(["profile", user?.id], (old) => ({
          ...old,
          avatar_url: tempUrl,
          _isUploading: true,
        }));

        const newImageUrl = await UserService.uploadProfilePicture(
          profile,
          file
        );

        queryClient.setQueryData(["profile", user?.id], (old) => ({
          ...old,
          avatar_url: newImageUrl,
          _isUploading: false,
        }));

        setTimeout(() => {
          if (tempUrlsRef.current.has(tempUrl)) {
            URL.revokeObjectURL(tempUrl);
            tempUrlsRef.current.delete(tempUrl);
          }
        }, 500);

        toast.success("Profile picture updated", {
          description: "Your profile image was successfully updated.",
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });

        return newImageUrl;
      } catch (error) {
        queryClient.setQueryData(["profile", user?.id], (old) => ({
          ...old,
          avatar_url: profile.avatar_url,
          _isUploading: false,
        }));

        if (tempUrlsRef.current.has(tempUrl)) {
          URL.revokeObjectURL(tempUrl);
          tempUrlsRef.current.delete(tempUrl);
        }

        setUserError(error.message);
        toast.error("Failed to update profile picture", {
          description:
            "An unexpected error occurred while updating your picture.",
          action: {
            label: "Retry",
            onClick: () => updateProfilePicture(file),
          },
        });

        throw error;
      } finally {
        setSpecificLoading("updateProfilePicture", false);
      }
    },
    [profile, queryClient, user?.id, setSpecificLoading]
  );

  const completeProfile = useCallback(
    async (fullName, password, file = null) => {
      if (!user) return;

      const result = await executeOperation(
        "completeProfile",
        (userId, fullName, password) =>
          UserService.completeProfile(userId, fullName, password),
        [user.id, fullName, password]
      );

      if (file) {
        try {
          await updateProfilePicture(file);
        } catch (error) {
          console.log(
            "Profile completed but failed to update profile picture:",
            error
          );
          toast.warning("Profile saved, but failed to update picture.");
        }
      }

      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      return result;
    },
    [user, executeOperation, updateProfilePicture, queryClient]
  );

  const deleteOldAvatar = useCallback(async () => {
    if (!profile) return null;

    const result = await executeOperation(
      "deleteOldAvatar",
      (profile) => UserService.deleteOldAvatar(profile),
      [profile]
    );
    if (result) {
      toast.success("Profile picture removed", {
        description: "Your profile image has been deleted.",
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
    } else {
      toast.error("Failed to remove profile picture", {
        description:
          "An unexpected error occurred while deleting your picture.",
        action: {
          label: "Retry",
          onClick: () => deleteOldAvatar(),
        },
      });
    }

    queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });

    return result;
  }, [profile, executeOperation, queryClient]);

  const addInterestsToViewedProfile = useCallback(
    (interests) => {
      if (!viewedProfile) return;

      setViewedProfile((prev) => ({
        ...prev,
        interests: [...(prev.interests || []), ...interests],
      }));
    },
    [viewedProfile]
  );

  const deleteInterestFromViewedProfile = useCallback(
    (interestId) => {
      if (!viewedProfile) return;

      setViewedProfile((prev) => ({
        ...prev,
        interests: prev.interests.filter((i) => i.id !== interestId),
      }));
    },
    [viewedProfile]
  );

  const isProfileComplete = useCallback(() => {
    if (!profile) return false;
    const isAnonymous = profile.is_anonymous;
    if (isAnonymous) return true;
    const fullName = profile.full_name;
    if (!fullName || fullName.trim() === "") return false;
    return profile.is_complete === true;
  }, [profile]);

  return {
    profile,
    isLoading,
    profileLoading,
    error: userError || profileError,
    timeMsgFullName,
    timeMsgUsername,
    isProfileComplete,

    // Profile functions
    completeProfile,
    saveUserLanguage,
    checkFullNameUpdateTime,
    checkUsernameUpdateTime,
    checkUsernameAvailability,
    updateProfile,
    updateProfilePicture,
    deleteOldAvatar,
    updateFullName,

    // Friend profile function
    viewedProfile,
    setViewedProfile,
    addInterestsToViewedProfile,
    deleteInterestFromViewedProfile,
    getUserById,
    getUserByUsername,
    getTasksChartData,
    getUserTasksWithPrivacy,
  };
};
