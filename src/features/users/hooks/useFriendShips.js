import { useAuthLogic } from "@/features/auth";
import FriendShipService from "@/service/friend/FriendShipService";
import { useCallback, useState, useEffect } from "react";

export const useFriendShips = () => {
  const [friendsList, setFriendsList] = useState([]);
  const [pendingFriendRequests, setPendingFriendRequests] = useState([]);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { profile: user } = useAuthLogic();

  const fetchFriendShips = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await FriendShipService.getFriendshipsByUserId(user.id);
      setFriendsList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchPendingFriendRequests = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await FriendShipService.getPendingFriendRequestsByUserId(
        user.id
      );
      setPendingFriendRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchFriendShips();
      fetchPendingFriendRequests();
    }
  }, [user, fetchFriendShips, fetchPendingFriendRequests]);

  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await await FriendShipService.searchUsers(
          query,
          user.id
        );
        setUsers(results);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query, user]);

  const getUserById = useCallback(
    async (userId) => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        if (selectedUser?.id !== userId) {
          const data = await FriendShipService.getUserById(userId);
          setSelectedUser(data);
          return data;
        }
      } catch (err) {
        setError(err.message);
        selectedUser(null);
      } finally {
        setLoading(false);
      }
    },
    [selectedUser]
  );

  const getBlockedUsers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await FriendShipService.getBlockedUsers(user.id);
      setBlockedUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const blockUser = useCallback(
    async (blockedId, reason) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        await FriendShipService.blockUser(user.id, blockedId, reason);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const unblockUser = useCallback(
    async (id) => {
      if (!user) return;

      const previousBlockedUsers = [...blockedUsers];
      setBlockedUsers((prev) => prev.filter((block) => block.id !== id));

      try {
        await FriendShipService.unblockUser(id);
      } catch (err) {
        setBlockedUsers(previousBlockedUsers);
        setError(err.message);
      }
    },
    [user]
  );

  const addFriend = useCallback(
    async (friendId) => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        const request_id = await FriendShipService.requestFriendship(
          friendId,
          user.id
        );

        setUsers((prev) =>
          prev.map((u) =>
            u.user_id === friendId
              ? {
                  ...u,
                  has_pending_request: true,
                  i_sent_request: true,
                  friend_request_id: request_id,
                }
              : u
          )
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const removeFriend = useCallback(
    async (friendshipId) => {
      if (!user) return;

      const previousFriendsList = [...friendsList];

      setFriendsList((prev) =>
        prev.filter((f) => f.friendship_id !== friendshipId)
      );

      try {
        await FriendShipService.deleteFriendship(friendshipId);
      } catch (err) {
        setFriendsList(previousFriendsList);
        setError(err.message);
      }
    },
    [user, friendsList]
  );

  const acceptFriendRequest = useCallback(
    async (friendRequestId) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        await FriendShipService.acceptFriendRequest(friendRequestId);

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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const rejectFriendRequest = useCallback(
    async (friendRequestId) => {
      if (!user) return;

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

      try {
        await FriendShipService.rejectFriendRequest(friendRequestId);
        // setPendingFriendRequests((prevRequests) =>
        //   prevRequests.filter((f) => f.id !== friendRequestId)
        // );
      } catch (err) {
         setUsers(previousUsers);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const cancelledFriendRequest = useCallback(
    async (friendRequestId) => {
      if (!user) return;

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
      try {
        await FriendShipService.cancelFriendRequest(friendRequestId);
        setPendingFriendRequests((prevRequests) =>
          prevRequests.filter((f) => f.id !== friendRequestId)
        );
      } catch (err) {
        setUsers(previousUsers);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const deleteFriendship = useCallback(
    async (friendshipId) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        await FriendShipService.deleteFriendship(friendshipId);
        setFriendsList((prevFriends) =>
          prevFriends.filter((f) => f.id !== friendshipId)
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    query,
    setQuery,
    users,
    selectedUser,
    blockedUsers,
    friendsList,
    pendingFriendRequests,
    loading,
    error,
    getBlockedUsers,
    getUserById,
    blockUser,
    unblockUser,
    fetchFriendShips,
    addFriend,
    removeFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelledFriendRequest,
    deleteFriendship,
  };
};
