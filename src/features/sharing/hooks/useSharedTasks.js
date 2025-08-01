import { useSharedTasksSubscription } from "@/features/tasks/hooks/useTaskSubscription";
import { useProfile } from "@/features/users";
import { SharedTaskService } from "@/service";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export const useSharedTasks = (taskId) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [usersInSharedTasks, setUsersInSharedTasks] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [taskToShare, setTaskToShare] = useState(null);

  const [loadingStates, setLoadingStates] = useState({
    searchUsers: false,
    fetchUsersInSharedTasks: false,
    shareTask: [],
    acceptTask: null,
    rejectTask: null,
    cancelTask: null,
    getFriends: false,
  });

  const { profile: user } = useProfile();

  const { subscribeToSharedTasks, unsubscribe: unsubscribeFromSharedTasks } =
    useSharedTasksSubscription(setUsersInSharedTasks);

  const getEffectiveTaskId = useCallback(() => {
    return taskToShare || taskId;
  }, [taskToShare, taskId]);

  const setLoading = useCallback((operation, value, id = null) => {
    setLoadingStates((prev) => {
      if (operation === "shareTask") {
        if (Array.isArray(value)) {
          return { ...prev, [operation]: value };
        } else if (value === false) {
          return { ...prev, [operation]: [] };
        }
      }

      return { ...prev, [operation]: id !== null ? id : value };
    });
  }, []);

  useEffect(() => {
    if (taskId && !user.is_anonymous) {
      subscribeToSharedTasks(taskId, () =>
        SharedTaskService.getUsersFromSharedTask(taskId, user.id)
      );
    }

    return () => {
      unsubscribeFromSharedTasks();
    };
  }, [taskId, subscribeToSharedTasks, unsubscribeFromSharedTasks]);

  useEffect(() => {
    setLoading("searchUsers", true);

    const searchUsers = async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      const selectedIds = selectedUsers.map((user) => user.user_id);

      try {
        const effectiveId = getEffectiveTaskId();
        const results = await SharedTaskService.searchUsersForSharedTask(
          query,
          user.id,
          effectiveId,
          selectedIds
        );
        setUsers(results);
      } catch (err) {
      } finally {
        setLoading("searchUsers", false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query, user, getEffectiveTaskId, setLoading, selectedUsers]);

  const fetchUsersInSharedTasks = useCallback(async () => {
    if (!taskId || !user?.id) return;

    try {
      setLoading("fetchUsersInSharedTasks", true);
      const data = await SharedTaskService.getUsersFromSharedTask(
        taskId,
        user.id
      );
      setUsersInSharedTasks(data);
    } catch (err) {
      toast.error("Error loading shared task users", {
        description: "Please try again later",
        action: {
          label: "Retry",
          onClick: () => fetchUsersInSharedTasks(),
        },
      });
    } finally {
      setLoading("fetchUsersInSharedTasks", false);
    }
  }, [user?.id, taskId, setLoading]);

  useEffect(() => {
    if (taskId && user.id) {
      fetchUsersInSharedTasks();
    }
  }, [taskId, fetchUsersInSharedTasks]);

  const shareTask = useCallback(
    async (recipientIds) => {
      if (!user?.id) return;

      const effectiveTaskId = getEffectiveTaskId();

      try {
        setLoading("shareTask", recipientIds);
        const result = await SharedTaskService.shareTask(
          effectiveTaskId,
          user.id,
          recipientIds
        );
        toast.success("Task shared successfully", {
          description: `"${result}" has been shared successfully.`,
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });

        return result;
      } catch (err) {
        toast.error("Error sharing task", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => shareTask(recipientIds),
          },
        });
        throw err;
      } finally {
        setLoading("shareTask", false);
      }
    },
    [user, getEffectiveTaskId, setLoading, selectedUsers]
  );

  const getAvailableFriendsForTask = useCallback(async () => {
    if (!user?.id) return;

    const effectiveTaskId = getEffectiveTaskId();

    try {
      setLoading("getFriends", true);
      const data = await SharedTaskService.getAvailableFriendsForTask(
        user.id,
        effectiveTaskId
      );
      setFriendsList(data);
    } catch (err) {
      throw err;
    } finally {
      setLoading("getFriends", false);
    }
  }, [user?.id, getEffectiveTaskId, setLoading]);

  const updateSharedTaskStatus = (invitationId, status) => {
    setUsersInSharedTasks((prev) =>
      prev.map((task) =>
        task.id === invitationId ? { ...task, status } : task
      )
    );
  };

  const acceptTaskShare = async (invitationId, status) => {
    try {
      setLoading("acceptTask", invitationId);
      updateSharedTaskStatus(invitationId, status);

      const updatedTask = await SharedTaskService.acceptTaskShare(invitationId);

      return updatedTask;
    } catch (err) {
      toast.error("Error accepting task share", {
        description: "Please try again later",
        action: {
          label: "Retry",
          onClick: () => acceptTaskShare(invitationId, status),
        },
      });
      throw err;
    } finally {
      setLoading("acceptTask", null);
    }
  };

  const rejectedTaskShare = async (invitationId, status) => {
    try {
      setLoading("rejectTask", invitationId);
      updateSharedTaskStatus(invitationId, status);

      const updatedTask = await SharedTaskService.rejectedTaskShare(
        invitationId
      );

      setUsersInSharedTasks((prev) =>
        prev.map((task) =>
          task.id === invitationId ? { ...task, ...updatedTask } : task
        )
      );

      return updatedTask;
    } catch (err) {
      await fetchUsersInSharedTasks();
      toast.error("Error rejecting task share", {
        description: "Please try again later",
        action: {
          label: "Retry",
          onClick: () => rejectedTaskShare(invitationId, status),
        },
      });
      throw err;
    } finally {
      setLoading("rejectTask", null);
    }
  };

  const cancelShareTask = async (sharedTaskId) => {
    const previousTasks = [...usersInSharedTasks];

    try {
      setLoading("cancelTask", sharedTaskId);
      setUsersInSharedTasks((prev) =>
        prev.filter((task) => task.id !== sharedTaskId)
      );

      await SharedTaskService.cancelShareTask(sharedTaskId);
    } catch (err) {
      setUsersInSharedTasks(previousTasks);
      toast.error("Error canceling task share", {
        description: "Please try again later",
        action: {
          label: "Retry",
          onClick: () => cancelShareTask(sharedTaskId),
        },
      });
      throw err;
    } finally {
      setLoading("cancelTask", null);
    }
  };

  const leaveSharedTask = async (sharedTaskId) => {
    const previousTasks = [...usersInSharedTasks];

    try {
      setLoading("cancelTask", sharedTaskId);
      setUsersInSharedTasks((prev) =>
        prev.filter((task) => task.id !== sharedTaskId)
      );

      await SharedTaskService.leaveSharedTask(sharedTaskId);
    } catch (err) {
      setUsersInSharedTasks(previousTasks);
      toast.error("Error leaving shared task", {
        description: "Please try again later",
        action: {
          label: "Retry",
          onClick: () => leaveSharedTask(sharedTaskId),
        },
      });
      throw err;
    } finally {
      setLoading("cancelTask", null);
    }
  };

  return {
    query,
    setQuery,
    usersInSharedTasks,
    selectedUsers,
    setSelectedUsers,
    loadingStates,
    isLoading: loadingStates.fetchUsersInSharedTasks,
    shareTask,
    acceptTaskShare,
    cancelShareTask,
    refreshSharedTasks: fetchUsersInSharedTasks,
    rejectedTaskShare,
    leaveSharedTask,
    users,
    setTasksToShare: setTaskToShare,
    taskToShare,
    getAvailableFriendsForTask,
    isTaskBeingSharedWithUser: (recipientId) =>
      Array.isArray(loadingStates.shareTask) &&
      loadingStates.shareTask.includes(recipientId),
    isTaskBeingAccepted: (invitationId) =>
      loadingStates.acceptTask === invitationId,
    isTaskBeingRejected: (invitationId) =>
      loadingStates.rejectTask === invitationId,
    isTaskBeingCanceled: (sharedTaskId) =>
      loadingStates.cancelTask === sharedTaskId,
    isSearchingUsers: loadingStates.searchUsers,
    isSharingTask:
      Array.isArray(loadingStates.shareTask) &&
      loadingStates.shareTask.length > 0,
    isFetchingFriends: loadingStates.getFriends,
    getPendingTasks: () =>
      usersInSharedTasks.filter(
        (task) => task.status === SharedTaskService.SHARED_TASK_STATUSES.PENDING
      ),
    getAcceptedTasks: () =>
      usersInSharedTasks.filter(
        (task) =>
          task.status === SharedTaskService.SHARED_TASK_STATUSES.ACCEPTED
      ),
    getRejectedTasks: () =>
      usersInSharedTasks.filter(
        (task) =>
          task.status === SharedTaskService.SHARED_TASK_STATUSES.REJECTED
      ),
  };
};
