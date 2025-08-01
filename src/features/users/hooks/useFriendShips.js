import { useCallback, useState, useEffect } from "react";
import { FriendShipService } from "@/service";
import { useCombinedFriendshipSubscription } from "./useFriendShipSubscription";
import { toast } from "sonner";

export const useFriendShips = (user, viewedProfile, updateViewedProfile) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [error, setError] = useState(null);

  const [friendshipLoading, setFriendshipLoading] = useState({
    searchUsers: false,
    getFriendShipsViewedProfile: false,
    getPendingRequests: false,
    getBlockedUsers: false,
    blockUser: false,
    unblockUser: false,
    addFriend: false,
    removeFriend: false,
    acceptFriendRequest: false,
    rejectFriendRequest: false,
    cancelledFriendRequest: false,
    deleteFriendship: false,
  });

  const setSpecificLoading = useCallback((operation, isLoading) => {
    setFriendshipLoading((prev) => ({
      ...prev,
      [operation]: isLoading,
    }));
  }, []);

  const {
    friendships: friendsList,
    friendRequests: pendingRequests,
    viewedProfileFriends,
    isLoading: subscriptionLoading,
    initializeFriendshipData,
    handleFriendshipOptimisticUpdate,
    handleFriendshipOptimisticError,
    handleFriendRequestOptimisticUpdate,
    handleFriendRequestOptimisticError,
    unsubscribeFromAll,
  } = useCombinedFriendshipSubscription();

  const executeOperation = useCallback(
    async (operation, friendshipFunction, params = []) => {
      setSpecificLoading(operation, true);
      setError(null);
      try {
        return await friendshipFunction(...params);
      } catch (error) {
        console.error(error);
        setError(error.message);
        throw error;
      } finally {
        setSpecificLoading(operation, false);
      }
    },
    [setSpecificLoading]
  );

  useEffect(() => {
    if (user && user.is_anonymous) return;

    if (user?.id && viewedProfile?.id) {
      initializeFriendshipData(
        viewedProfile.id,
        user.id,
        () => FriendShipService.getFriendshipsByUserId(user.id),
        () => FriendShipService.getPendingFriendRequests(user.id),
        () =>
          FriendShipService.getUserFriendsWithPrivacy(viewedProfile.id, user.id)
      );
    }

    return () => {
      unsubscribeFromAll();
    };
  }, [
    viewedProfile?.id,
    user?.id,
    initializeFriendshipData,
    unsubscribeFromAll,
  ]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      const result = await executeOperation(
        "searchUsers",
        (query, userId) => FriendShipService.searchUsers(query, userId),
        [query, user.id]
      );

      setUsers(result);
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query, user, executeOperation]);

  const getFriendShipsViewedProfile = useCallback(async () => {
    if (!viewedProfile) return;

    const result = await executeOperation(
      "getFriendShipsViewedProfile",
      (viewedProfileId, userId) =>
        FriendShipService.getUserFriendsWithPrivacy(viewedProfileId, userId),
      [viewedProfile.id, user?.id]
    );

    return result;
  }, [viewedProfile, user, executeOperation]);

  const getPendingRequests = useCallback(async () => {
    if (!viewedProfile) return;

    const result = await executeOperation(
      "getPendingRequests",
      (viewedProfileId) =>
        FriendShipService.getPendingFriendRequests(viewedProfileId),
      [viewedProfile.id]
    );

    return result;
  }, [viewedProfile, executeOperation]);

  const getBlockedUsers = useCallback(async () => {
    if (!user) return;

    const result = await executeOperation(
      "getBlockedUsers",
      (userId) => FriendShipService.getBlockedUsers(userId),
      [user.id]
    );

    setBlockedUsers(result);
  }, [user, executeOperation]);

  const blockUser = useCallback(
    async (blockedId) => {
      if (!user) return;

      const result = await executeOperation(
        "blockUser",
        (userId, blockedId) => FriendShipService.blockUser(userId, blockedId),
        [user.id, blockedId]
      );

      if (result) {
        toast.success("User blocked", {
          description: "User has been blocked successfully",
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });
      } else {
        toast.error("Error blocking user", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => blockUser(blockedId),
          },
        });
      }

      return result;
    },
    [user, executeOperation]
  );

  const unblockUser = useCallback(
    async (id) => {
      if (!user) return;

      const previousBlockedUsers = [...blockedUsers];
      setBlockedUsers((prev) => prev.filter((block) => block.id !== id));

      try {
        const result = await executeOperation(
          "unblockUser",
          (id) => FriendShipService.unblockUser(id),
          [id]
        );

        if (result) {
          toast.success("User unblocked", {
            description: "User has been unblocked successfully",
            action: {
              label: "Dismiss",
              onClick: () => toast.dismiss(),
            },
          });
        }

        return result;
      } catch (err) {
        setBlockedUsers(previousBlockedUsers);

        toast.error("Error unblocking user", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => unblockUser(id),
          },
        });

        throw err;
      }
    },
    [user, blockedUsers, executeOperation]
  );

  const addFriend = useCallback(
    async (friendId) => {
      if (!user) return;

      const optimisticData = {
        friend_id: friendId,
        user_id: user.id,
        status: "pending",
        i_sent_request: true,
      };

      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === friendId
            ? {
                ...u,
                has_pending_request: true,
                i_sent_request: true,
              }
            : u
        )
      );

      if (viewedProfile && viewedProfile.id === friendId) {
        updateViewedProfile((prev) => ({
          ...prev,
          has_pending_request: true,
          i_sent_request: true,
        }));
      }

      try {
        const request_id = await executeOperation(
          "addFriend",
          (friendId, userId) =>
            FriendShipService.requestFriendship(friendId, userId),
          [friendId, user.id]
        );

        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === friendId
              ? {
                  ...u,
                  friend_request_id: request_id,
                }
              : u
          )
        );

        if (viewedProfile && viewedProfile.id === friendId) {
          updateViewedProfile((prev) => ({
            ...prev,
            friend_request_id: request_id,
          }));
        }

        handleFriendRequestOptimisticUpdate(optimisticData);

        toast.success("Friend request sent", {
          description: "Friend request has been sent successfully",
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });

        return request_id;
      } catch (err) {
        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === friendId
              ? {
                  ...u,
                  has_pending_request: false,
                  i_sent_request: false,
                }
              : u
          )
        );

        if (viewedProfile && viewedProfile.id === friendId) {
          updateViewedProfile((prev) => ({
            ...prev,
            has_pending_request: false,
            i_sent_request: false,
          }));
        }

        handleFriendRequestOptimisticError(optimisticData, err);

        toast.error("Error sending friend request", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => addFriend(friendId),
          },
        });

        throw err;
      }
    },
    [
      user,
      updateViewedProfile,
      handleFriendRequestOptimisticUpdate,
      handleFriendRequestOptimisticError,
      executeOperation,
    ]
  );

  const removeFriend = useCallback(
    async (friendId) => {
      if (!user) return;

      const optimisticData = {
        friend_id: friendId,
        user_id: user.id,
        action: "remove",
      };

      if (viewedProfile && viewedProfile.id === friendId) {
        updateViewedProfile((prev) => ({
          ...prev,
          is_friend: false,
        }));
      }

      try {
        const result = await executeOperation(
          "removeFriend",
          (friendId) => FriendShipService.deleteFriendship(friendId),
          [friendId]
        );

        handleFriendshipOptimisticUpdate(optimisticData);

        toast.success("Friend removed", {
          description: "Friend has been removed successfully",
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });

        return result;
      } catch (err) {
        if (viewedProfile && viewedProfile.id === friendId) {
          updateViewedProfile((prev) => ({
            ...prev,
            is_friend: true,
          }));
        }

        handleFriendshipOptimisticError(optimisticData, err);

        toast.error("Error removing friend", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => removeFriend(friendId),
          },
        });

        throw err;
      }
    },
    [
      user,
      updateViewedProfile,
      handleFriendshipOptimisticUpdate,
      handleFriendshipOptimisticError,
      executeOperation,
    ]
  );

  const acceptFriendRequest = useCallback(
    async (friendRequestId) => {
      if (!user) return;

      const optimisticData = {
        friend_request_id: friendRequestId,
        user_id: user.id,
        action: "accept",
      };

      setUsers((prev) =>
        prev.map((u) =>
          u.friend_request_id === friendRequestId
            ? {
                ...u,
                has_pending_request: false,
                i_sent_request: false,
                is_friend: true,
              }
            : u
        )
      );

      if (
        viewedProfile &&
        viewedProfile.friend_request_id === friendRequestId
      ) {
        updateViewedProfile((prev) => ({
          ...prev,
          has_pending_request: false,
          i_sent_request: false,
          is_friend: true,
        }));
      }

      try {
        const result = await executeOperation(
          "acceptFriendRequest",
          (friendRequestId) =>
            FriendShipService.acceptFriendRequest(friendRequestId),
          [friendRequestId]
        );

        handleFriendRequestOptimisticUpdate(optimisticData);

        toast.success("Friend request accepted", {
          description: "Friend request has been accepted successfully",
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });

        return result;
      } catch (err) {
        setUsers((prev) =>
          prev.map((u) =>
            u.friend_request_id === friendRequestId
              ? {
                  ...u,
                  has_pending_request: true,
                  i_sent_request: false,
                  is_friend: false,
                }
              : u
          )
        );

        if (
          viewedProfile &&
          viewedProfile.friend_request_id === friendRequestId
        ) {
          updateViewedProfile((prev) => ({
            ...prev,
            has_pending_request: true,
            i_sent_request: false,
            is_friend: false,
          }));
        }

        handleFriendRequestOptimisticError(optimisticData, err);

        toast.error("Error accepting friend request", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => acceptFriendRequest(friendRequestId),
          },
        });

        throw err;
      }
    },
    [
      user,
      updateViewedProfile,
      handleFriendRequestOptimisticUpdate,
      handleFriendRequestOptimisticError,
      executeOperation,
    ]
  );

  const rejectFriendRequest = useCallback(
    async (friendRequestId) => {
      if (!user) return;

      const optimisticData = {
        friend_request_id: friendRequestId,
        user_id: user.id,
        action: "reject",
      };

      const previousUsers = [...users];

      setUsers((prev) =>
        prev.map((u) =>
          u.friend_request_id === friendRequestId
            ? {
                ...u,
                has_pending_request: false,
                i_sent_request: false,
                friend_request_id: null,
              }
            : u
        )
      );

      if (
        viewedProfile &&
        viewedProfile.friend_request_id === friendRequestId
      ) {
        updateViewedProfile((prev) => ({
          ...prev,
          has_pending_request: false,
          i_sent_request: false,
          friend_request_id: null,
        }));
      }

      try {
        const result = await executeOperation(
          "rejectFriendRequest",
          (friendRequestId) =>
            FriendShipService.rejectFriendRequest(friendRequestId),
          [friendRequestId]
        );

        handleFriendRequestOptimisticUpdate(optimisticData);

        toast.success("Friend request rejected", {
          description: "Friend request has been rejected successfully",
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });

        return result;
      } catch (err) {
        setUsers(previousUsers);
        handleFriendRequestOptimisticError(optimisticData, err);

        toast.error("Error rejecting friend request", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => rejectFriendRequest(friendRequestId),
          },
        });

        throw err;
      }
    },
    [
      user,
      users,
      updateViewedProfile,
      handleFriendRequestOptimisticUpdate,
      handleFriendRequestOptimisticError,
      executeOperation,
    ]
  );

  const cancelledFriendRequest = useCallback(
    async (friendRequestId) => {
      if (!user) return;

      const optimisticData = {
        friend_request_id: friendRequestId,
        user_id: user.id,
        action: "cancel",
      };

      const previousUsers = [...users];

      setUsers((prev) =>
        prev.map((u) =>
          u.friend_request_id === friendRequestId
            ? {
                ...u,
                has_pending_request: false,
                i_sent_request: false,
                pending_request_id: null,
              }
            : u
        )
      );

      if (
        viewedProfile &&
        friendRequestId === viewedProfile?.friend_request_id
      ) {
        updateViewedProfile((prev) => ({
          ...prev,
          has_pending_request: false,
          i_sent_request: false,
          friend_request_id: null,
        }));
      }

      try {
        const result = await executeOperation(
          "cancelledFriendRequest",
          (friendRequestId) =>
            FriendShipService.cancelFriendRequest(friendRequestId),
          [friendRequestId]
        );

        handleFriendRequestOptimisticUpdate(optimisticData);

        toast.success("Friend request cancelled", {
          description: "Friend request has been cancelled successfully",
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });

        return result;
      } catch (err) {
        setUsers(previousUsers);
        handleFriendRequestOptimisticError(optimisticData, err);

        toast.error("Error cancelling friend request", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => cancelledFriendRequest(friendRequestId),
          },
        });

        throw err;
      }
    },
    [
      user,
      users,
      updateViewedProfile,
      handleFriendRequestOptimisticUpdate,
      handleFriendRequestOptimisticError,
      executeOperation,
    ]
  );

  const deleteFriendship = useCallback(
    async (friendshipId) => {
      if (!user) return;

      const optimisticData = {
        friendship_id: friendshipId,
        user_id: user.id,
        action: "delete",
      };

      try {
        const result = await executeOperation(
          "deleteFriendship",
          (friendshipId) => FriendShipService.deleteFriendship(friendshipId),
          [friendshipId]
        );

        handleFriendshipOptimisticUpdate(optimisticData);

        toast.success("Friendship deleted", {
          description: "Friendship has been deleted successfully",
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });

        return result;
      } catch (err) {
        handleFriendshipOptimisticError(optimisticData, err);

        toast.error("Error deleting friendship", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => deleteFriendship(friendshipId),
          },
        });

        throw err;
      }
    },
    [
      user,
      handleFriendshipOptimisticUpdate,
      handleFriendshipOptimisticError,
      executeOperation,
    ]
  );

  return {
    query,
    setQuery,
    users,
    blockedUsers,
    friendsList,
    viewedProfileFriends,
    pendingRequests,
    friendshipLoading,
    loading: subscriptionLoading,
    error,
    getBlockedUsers,
    blockUser,
    unblockUser,
    getFriendShipsViewedProfile,
    getPendingRequests,
    addFriend,
    removeFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelledFriendRequest,
    deleteFriendship,
  };
};
