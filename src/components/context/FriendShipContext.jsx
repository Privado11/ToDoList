import React, { createContext, useContext } from "react";
import { useFriendShips } from "../hooks/friend/useFriendShips";

const FriendShipContext = createContext();

export const useFriendShipContext = () => {
  const context = useContext(FriendShipContext);
  if (!context) {
    throw new Error(
      "useFriendShipContext must be used within a FriendShipProvider"
    );
  }
  return context;
};

export const FriendShipProvider = ({ children }) => {
  const friendShipLogic = useFriendShips();

  return (
    <FriendShipContext.Provider value={friendShipLogic}>
      {children}
    </FriendShipContext.Provider>
  );
};
