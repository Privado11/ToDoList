import { useAuthLogic } from "@/features/auth";
import { useSharedTasksSubscription } from "@/features/tasks/hooks/useTaskSubscription";
import { SharedTaskService } from "@/service";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export const useSharedTasks = (taskId, fetchTasks) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [taskToShare, setTaskToShare] = useState(null);

  const [loadingStates, setLoadingStates] = useState({
    searchUsers: false,
    fetchSharedTasks: false,
    shareTask: [],
    acceptTask: null,
    rejectTask: null,
    cancelTask: null,
    getFriends: false,
  });

  const { profile: user } = useAuthLogic();

  const { subscribeToSharedTasks, unsubscribe: unsubscribeFromSharedTasks } =
    useSharedTasksSubscription(setSharedTasks);

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

  const fetchSharedTasks = useCallback(async () => {
    if (!taskId || !user?.id) return;

    try {
      setLoading("fetchSharedTasks", true);
      const data = await SharedTaskService.getUsersFromSharedTask(
        taskId,
        user.id
      );
      setSharedTasks(data);

      subscribeToSharedTasks(
        taskId,
        async () =>
          await SharedTaskService.getUsersFromSharedTask(taskId, user.id)
      );
    } catch (err) {
      toast.error("Error loading shared task users", {
        description: "Please try again later",
        action: {
          label: "Retry",
          onClick: () => fetchTasks(),
        },
      });
    } finally {
      setLoading("fetchSharedTasks", false);
    }
  }, [user?.id, taskId, subscribeToSharedTasks, fetchTasks, setLoading]);

  const getUsersFromSharedTask = useCallback(async () => {
    if (!taskId || !user?.id) return;

    try {
      setLoading("fetchSharedTasks", true);
      const data = await SharedTaskService.getUsersFromSharedTask(
        taskId,
        user.id
      );
      setSharedTasks(data);
    } catch (err) {
      toast.error("Error loading shared task users", {
        description: "Please try again later",
        action: {
          label: "Retry",
          onClick: () => getUsersFromSharedTask(),
        },
      });
    } finally {
      setLoading("fetchSharedTasks", false);
    }
  }, [taskId, user?.id, setLoading]);

  useEffect(() => {
    if (taskId && !user?.is_anonymous) {
      getUsersFromSharedTask();
    }
  }, [getUsersFromSharedTask, user?.is_anonymous]);

  useEffect(() => {
    if (taskId && !user?.is_anonymous) {
      fetchSharedTasks();
    }

    return () => {
      if (taskId) {
        unsubscribeFromSharedTasks();
      }
    };
  }, [
    taskId,
    fetchSharedTasks,
    user?.is_anonymous,
    unsubscribeFromSharedTasks,
  ]);

  useEffect(() => {
    if (
      sharedTasks.length === 0 &&
      taskId &&
      !loadingStates.fetchSharedTasks &&
      user?.id
    ) {
      setLoading("fetchSharedTasks", true);
      SharedTaskService.getUsersFromSharedTask(taskId, user.id)
        .then((data) => {
          if (data && data.length > 0) {
            setSharedTasks(data);
          }
        })
        .finally(() => {
          setLoading("fetchSharedTasks", false);
        });
    }
  }, [
    sharedTasks,
    taskId,
    loadingStates.fetchSharedTasks,
    user?.id,
    setLoading,
  ]);

  const shareTask = useCallback(async (recipientIds) => {
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
        description: `"${result.title}" has been shared successfully.`,
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
  }, [user, getEffectiveTaskId, setLoading, selectedUsers]);

  const getAvailableFriendsForTask = useCallback(async () => {
    if (!user?.id) return;

    const effectiveTaskId = getEffectiveTaskId();
    if (!effectiveTaskId) return;

    try {
      setLoading("getFriends", true);
      const data = await SharedTaskService.getAvailableFriendsForTask(
        user.id,
        effectiveTaskId
      );
      return data;
    } catch (err) {
      toast.error("Error fetching friends", {
        description: "Please try again later",
        action: {
          label: "Retry",
          onClick: () => getAvailableFriendsForTask(),
        },
      });
      throw err;
    } finally {
      setLoading("getFriends", false);
    }
  }, [user?.id, getEffectiveTaskId, setLoading]);

  const updateSharedTaskStatus = (invitationId, status) => {
    setSharedTasks((prev) =>
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
      fetchTasks();

      setSharedTasks((prev) =>
        prev.map((task) =>
          task.id === invitationId ? { ...task, ...updatedTask } : task
        )
      );
      return updatedTask;
    } catch (err) {
      await fetchSharedTasks();
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

      setSharedTasks((prev) =>
        prev.map((task) =>
          task.id === invitationId ? { ...task, ...updatedTask } : task
        )
      );

      return updatedTask;
    } catch (err) {
      await fetchSharedTasks();
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
    const previousTasks = [...sharedTasks];

    try {
      setLoading("cancelTask", sharedTaskId);
      setSharedTasks((prev) => prev.filter((task) => task.id !== sharedTaskId));

      await SharedTaskService.cancelShareTask(sharedTaskId);
    } catch (err) {
      setSharedTasks(previousTasks);
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
    const previousTasks = [...sharedTasks];

    try {
      setLoading("cancelTask", sharedTaskId);
      setSharedTasks((prev) => prev.filter((task) => task.id !== sharedTaskId));

      await SharedTaskService.leaveSharedTask(sharedTaskId);
    } catch (err) {
      setSharedTasks(previousTasks);
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
  }

  return {
    query,
    setQuery,
    sharedTasks,
    selectedUsers,
    setSelectedUsers,
    loadingStates,
    isLoading: loadingStates.fetchSharedTasks,
    shareTask,
    acceptTaskShare,
    cancelShareTask,
    refreshSharedTasks: fetchSharedTasks,
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
      sharedTasks.filter(
        (task) => task.status === SharedTaskService.SHARED_TASK_STATUSES.PENDING
      ),
    getAcceptedTasks: () =>
      sharedTasks.filter(
        (task) =>
          task.status === SharedTaskService.SHARED_TASK_STATUSES.ACCEPTED
      ),
    getRejectedTasks: () =>
      sharedTasks.filter(
        (task) =>
          task.status === SharedTaskService.SHARED_TASK_STATUSES.REJECTED
      ),
  };
};
