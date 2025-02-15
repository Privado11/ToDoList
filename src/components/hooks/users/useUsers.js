import { useCallback, useState } from "react";
import { useAuthLogic } from "../useAuth";
import UserService from "@/components/service/users/UserService";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuthLogic();

  const fetchUsers = useCallback(
    async (query) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await UserService.searchUsers(query, user.id);
        setUsers(data);
      } catch (err) {
        setError("Error fetching users");
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const getBlockedUsers = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const data = await UserService.getBlockedUsers(user.id);
      setBlockedUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getUserById = useCallback(
    async (userId) => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        if (selectedUser?.id !== userId) {
          const data = await UserService.getUserById(userId);
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

  const getUserByUsername = useCallback(
    async (username) => {
      if (!username) return;
      setLoading(true);
      setError(null);
      try {
        const data = await UserService.getUserByUsername(username);
        setSelectedUser(data);
        return data;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [selectedUser]
  );


  const completeProfile = useCallback(
    async (fullName, password) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await UserService.completeProfile(
          user.id,
          fullName,
          password
        );
        setSelectedUser(data);
        return data;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [selectedUser]
  );

  const blockUser = useCallback(
    async (userId) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const blockedUser = await UserService.blockUser(user.id, userId);
        setBlockedUsers((prev) => [blockedUser, ...prev]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const unblockUser = useCallback(
    async (userId) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        await UserService.unblockUser(user.id, userId);
        setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const checkFullNameUpdateTime = useCallback(
    async (userId) => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await UserService.checkFullNameUpdateTime(userId);
        return data;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const checkUsernameUpdateTime = useCallback(
    async (userId) => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await UserService.checkUsernameUpdateTime(userId);
        return data;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const checkUsernameAvailability = useCallback(
    async (username) => {
      if (!username) return;
      setLoading(true);
      setError(null);
      try {
        const data = await UserService.checkUsernameAvailability(username);
        return data;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateUsername = useCallback(
    async (username) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await UserService.updateUsername(user.id, username);
        return data;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateFullName = useCallback(
    async (fullName) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await UserService.updateFullName(user.id, fullName);
        return data;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const updateProfilePicture = useCallback(
    async (file) => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        const data = await UserService.updateProfilePicture(user.id, file);
        return data;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    users,
    selectedUser,
    blockedUsers,
    loading,
    error,
    fetchUsers,
    getBlockedUsers,
    getUserById,
    getUserByUsername,
    completeProfile,
    blockUser,
    unblockUser,
    checkFullNameUpdateTime,
    checkUsernameUpdateTime,
    checkUsernameAvailability,
    updateUsername,
    updateFullName,
    updateProfilePicture,
  };
};
