import { useAuthLogic } from "@/features/auth";
import FriendShipService from "@/service/friend/FriendShipService";
import { useCallback, useState, useEffect } from "react";


export const useFriendShips = () => {
  const [friendsList, setFriendsList] = useState([]);
  const [pendingFriendRequests, setPendingFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuthLogic();

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

  useEffect(() => {
    if (user) fetchFriendShips();
  }, [user, fetchFriendShips]);

  const addFriend = useCallback(
    async (friendId) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const friend = await FriendShipService.requestFriendship(
          friendId,
          user.id
        );
        setPendingFriendRequests((prevRequests) => [...prevRequests, friend]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const removeFriend = useCallback(
    async (friendId) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const friend = await FriendShipService.removeFriend(user.id, friendId);
        setFriendsList((prevFriends) =>
          prevFriends.filter((f) => f.id !== friend.id)
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const acceptFriendRequest = useCallback(
    async (friendRequestId) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const friend = await FriendShipService.acceptFriendRequest(
          friendRequestId
        );
        setFriendsList((prevFriends) => [...prevFriends, friend]);
        setPendingFriendRequests((prevRequests) =>
          prevRequests.filter((f) => f.id !== friend.id)
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
      setLoading(true);
      setError(null);
      try {
        await FriendShipService.rejectFriendRequest(friendRequestId);
        setPendingFriendRequests((prevRequests) =>
          prevRequests.filter((f) => f.id !== friendRequestId)
        );
      } catch (err) {
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
      setLoading(true);
      setError(null);
      try {
        await FriendShipService.cancelledFriendRequest(friendRequestId);
        setPendingFriendRequests((prevRequests) =>
          prevRequests.filter((f) => f.id !== friendRequestId)
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const delete_friendship = useCallback(
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
    friendsList,
    pendingFriendRequests,
    loading,
    error,
    addFriend,
    removeFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelledFriendRequest,
    delete_friendship,
  };
};
