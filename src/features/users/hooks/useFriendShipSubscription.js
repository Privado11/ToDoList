import { FriendShipSubscriptionService } from "@/service";
import { useState, useEffect, useCallback, useRef } from "react";

export const useFriendshipSubscription = (
  setFriendships,
  setViewedProfileFriends
) => {
  const activeSubscriptionRef = useRef(null);
  const [requestingUserId, setRequestingUserId] = useState(null);

  const subscribeToFriendships = useCallback(
    (userId, requestingUserId, getFriendships, getUserFriendsWithPrivacy) => {
      if (activeSubscriptionRef.current && requestingUserId) {
        FriendShipSubscriptionService.unsubscribeFromFriendships(
          requestingUserId
        );
      }

      setRequestingUserId(requestingUserId);

      const subscription =
        FriendShipSubscriptionService.subscribeToUserFriendships(
          userId,
          requestingUserId,
          {
            onFriendshipsChange: (updatedFriendships) => {
              setFriendships(updatedFriendships);
            },
            getFriendships,
            onFriendsListViewedProfile: (updatedFriendsList) => {
              setViewedProfileFriends(updatedFriendsList);
            },
            getUserFriendsWithPrivacy,
          }
        );

      activeSubscriptionRef.current = subscription;
    },
    [setFriendships, setViewedProfileFriends, requestingUserId]
  );

  const registerOptimisticHandlers = useCallback(
    (onOptimisticUpdate, onOptimisticError) => {
      if (requestingUserId) {
        FriendShipSubscriptionService.registerOptimisticHandlers(
          "friendships",
          requestingUserId,
          {
            onOptimisticUpdate,
            onOptimisticError,
          }
        );
      }
    },
    [requestingUserId]
  );

  const handleOptimisticUpdate = useCallback(
    (optimisticData) => {
      if (requestingUserId) {
        FriendShipSubscriptionService.handleOptimisticUpdate(
          "friendships",
          requestingUserId,
          optimisticData
        );
      }
    },
    [requestingUserId]
  );

  const handleOptimisticError = useCallback(
    (optimisticData, error) => {
      if (requestingUserId) {
        FriendShipSubscriptionService.handleOptimisticError(
          "friendships",
          requestingUserId,
          optimisticData,
          error
        );
      }
    },
    [requestingUserId]
  );

  const unsubscribe = useCallback(() => {
    if (activeSubscriptionRef.current && requestingUserId) {
      FriendShipSubscriptionService.unsubscribeFromFriendships(
        requestingUserId
      );
      activeSubscriptionRef.current = null;
      setRequestingUserId(null);
    }
  }, [requestingUserId]);

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    subscribeToFriendships,
    registerOptimisticHandlers,
    handleOptimisticUpdate,
    handleOptimisticError,
    unsubscribe,
  };
};

export const useFriendRequestSubscription = (
  setFriendRequests,
  setViewedProfileFriends
) => {
  const activeSubscriptionRef = useRef(null);
  const [requestingUserId, setRequestingUserId] = useState(null);

  const subscribeToFriendRequests = useCallback(
    (
      userId,
      requestingUserId,
      getFriendRequests,
      getUserFriendsWithPrivacy
    ) => {
      if (activeSubscriptionRef.current && requestingUserId) {
        FriendShipSubscriptionService.unsubscribeFromFriendRequests(
          requestingUserId
        );
      }

      setRequestingUserId(requestingUserId);

      const subscription =
        FriendShipSubscriptionService.subscribeToUserFriendRequests(userId, {
          onFriendRequestsChange: (updatedFriendRequests) => {
            setFriendRequests(updatedFriendRequests);
          },
          getFriendRequests,
          onFriendsListViewedProfile: (updatedFriendsList) => {
            setViewedProfileFriends(updatedFriendsList);
          },
          getUserFriendsWithPrivacy,
          requestingUserId,
        });

      activeSubscriptionRef.current = subscription;
    },
    [setFriendRequests, setViewedProfileFriends, requestingUserId]
  );

  const registerOptimisticHandlers = useCallback(
    (onOptimisticUpdate, onOptimisticError) => {
      if (requestingUserId) {
        FriendShipSubscriptionService.registerOptimisticHandlers(
          "friendRequests",
          requestingUserId,
          {
            onOptimisticUpdate,
            onOptimisticError,
          }
        );
      }
    },
    [requestingUserId]
  );

  const handleOptimisticUpdate = useCallback(
    (optimisticData) => {
      if (requestingUserId) {
        FriendShipSubscriptionService.handleOptimisticUpdate(
          "friendRequests",
          requestingUserId,
          optimisticData
        );
      }
    },
    [requestingUserId]
  );

  const handleOptimisticError = useCallback(
    (optimisticData, error) => {
      if (requestingUserId) {
        FriendShipSubscriptionService.handleOptimisticError(
          "friendRequests",
          requestingUserId,
          optimisticData,
          error
        );
      }
    },
    [requestingUserId]
  );

  const unsubscribe = useCallback(() => {
    if (activeSubscriptionRef.current && requestingUserId) {
      FriendShipSubscriptionService.unsubscribeFromFriendRequests(
        requestingUserId
      );
      activeSubscriptionRef.current = null;
      setRequestingUserId(null);
    }
  }, [requestingUserId]);

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    subscribeToFriendRequests,
    registerOptimisticHandlers,
    handleOptimisticUpdate,
    handleOptimisticError,
    unsubscribe,
  };
};

export const useCombinedFriendshipSubscription = () => {
  const [friendships, setFriendships] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [viewedProfileFriends, setViewedProfileFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    subscribeToFriendships,
    registerOptimisticHandlers: registerFriendshipHandlers,
    handleOptimisticUpdate: handleFriendshipOptimisticUpdate,
    handleOptimisticError: handleFriendshipOptimisticError,
    unsubscribe: unsubscribeFromFriendships,
  } = useFriendshipSubscription(setFriendships, setViewedProfileFriends);

  const {
    subscribeToFriendRequests,
    registerOptimisticHandlers: registerFriendRequestHandlers,
    handleOptimisticUpdate: handleFriendRequestOptimisticUpdate,
    handleOptimisticError: handleFriendRequestOptimisticError,
    unsubscribe: unsubscribeFromFriendRequests,
  } = useFriendRequestSubscription(setFriendRequests, setViewedProfileFriends);

  const initializeFriendshipData = useCallback(
    async (
      userId,
      requestingUserId,
      getFriendships,
      getFriendRequests,
      getUserFriendsWithPrivacy
    ) => {
      console.log(
        "Initializing friendship data for userId:",
        userId,
        "requestingUserId:",
        requestingUserId
      );
      setIsLoading(true);
      try {
        const [
          initialFriendships,
          initialFriendRequests,
          initialViewedProfileFriends,
        ] = await Promise.all([
          getFriendships(requestingUserId),
          getFriendRequests(requestingUserId),
          getUserFriendsWithPrivacy(userId, requestingUserId),
        ]);

        setFriendships(initialFriendships);
        setFriendRequests(initialFriendRequests);
        setViewedProfileFriends(initialViewedProfileFriends);

        subscribeToFriendships(
          userId,
          requestingUserId,
          getFriendships,
          getUserFriendsWithPrivacy
        );
        subscribeToFriendRequests(
          userId,
          requestingUserId,
          getFriendRequests,
          getUserFriendsWithPrivacy
        );
      } catch (error) {
        console.error("Error initializing friendship data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [subscribeToFriendships, subscribeToFriendRequests]
  );

  const unsubscribeFromAll = useCallback(() => {
    unsubscribeFromFriendships();
    unsubscribeFromFriendRequests();
    setViewedProfileFriends([]);
  }, [unsubscribeFromFriendships, unsubscribeFromFriendRequests]);

  useEffect(() => {
    return () => {
      unsubscribeFromAll();
    };
  }, [unsubscribeFromAll]);

  return {
    friendships,
    friendRequests,
    viewedProfileFriends,
    isLoading,
    initializeFriendshipData,
    registerFriendshipHandlers,
    registerFriendRequestHandlers,
    handleFriendshipOptimisticUpdate,
    handleFriendshipOptimisticError,
    handleFriendRequestOptimisticUpdate,
    handleFriendRequestOptimisticError,
    unsubscribeFromAll,
  };
};
