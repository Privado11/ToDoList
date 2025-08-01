import React, { createContext, useContext } from "react";
import {
  useBadges,
  useFriendShips,
  useInterests,
  useProfile,
  useUserPrivacy,
} from "@/features";

const ProfileContext = createContext(null);

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a ProfileProvider");
  }
  return context;
};

export function ProfileProvider({ children }) {
  const profile = useProfile();
  const privacy = useUserPrivacy();
  const interests = useInterests(
    profile?.profile,
    profile?.viewedProfile,
    profile?.addInterestsToViewedProfile,
    profile?.deleteInterestFromViewedProfile
  );
  const badges = useBadges(profile?.profile, profile?.viewedProfile);
  const friendShips = useFriendShips(
    profile?.profile,
    profile?.viewedProfile,
    profile?.setViewedProfile
  );

  const value = {
    ...profile,
    ...privacy,
    ...interests,
    ...badges,
    ...friendShips,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
