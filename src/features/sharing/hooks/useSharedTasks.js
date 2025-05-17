import { useAuthLogic } from "@/features/auth";
import { useSharedTasksSubscription } from "@/features/tasks/hooks/useTaskSubscription";
import { SharedTaskService } from "@/service";
import { useState, useEffect, useCallback } from "react";

export const useSharedTasks = (taskId, getTaskById, fetchTasks) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [taskToShare, setTaskToShare] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sharedTaskError, setSharedTaskError] = useState(null);

  const { profile: user } = useAuthLogic();

  const { subscribeToSharedTasks, unsubscribe: unsubscribeFromSharedTasks } =
    useSharedTasksSubscription(setSharedTasks);

  
  const getEffectiveTaskId = useCallback(() => {
    
    return taskToShare || taskId;
  }, [taskToShare, taskId]);

 
  useEffect(() => {
    const searchUsers = async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      setIsLoading(true);
      setSharedTaskError(null);

      try {
        
        const effectiveId = getEffectiveTaskId();
        const results = await SharedTaskService.searchUsersForSharedTask(
          query,
          user.id,
          effectiveId
        );
        setUsers(results);
      } catch (err) {
        console.sharedTaskError("Error searching users:", err);
        setSharedTaskError(
          err instanceof Error ? err : new Error("Unknown sharedTaskError occurred")
        );
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query, user, getEffectiveTaskId]);

  
  const fetchSharedTasks = useCallback(async () => {
    if (!taskId || !user?.id) return;

    try {
      setIsLoading(true);
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

      setSharedTaskError(null);
    } catch (err) {
      setSharedTaskError("Something went wrong. Please try again.");
      console.sharedTaskError("Error fetching shared tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, taskId, subscribeToSharedTasks]);

 
  const getUsersFromSharedTask = useCallback(async () => {
    if (!taskId || !user?.id) return;

    try {
      setIsLoading(true);
      const data = await SharedTaskService.getUsersFromSharedTask(
        taskId,
        user.id
      );
      setSharedTasks(data);
      setSharedTaskError(null);
    } catch (err) {
      setSharedTaskError("Something went wrong. Please try again.");
      console.sharedTaskError("Error fetching shared tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [taskId, user?.id]);

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
    if (sharedTasks.length === 0 && taskId && !isLoading && user?.id) {
      SharedTaskService.getUsersFromSharedTask(taskId, user.id).then((data) => {
        if (data && data.length > 0) {
          console.log("Setting shared tasks from task id:", data);
          setSharedTasks(data);
        }
      });
    }
  }, [sharedTasks, taskId, isLoading, user?.id]);


  const shareTask = async (recipientId) => {
    if (!user?.id) return;

    const effectiveTaskId = getEffectiveTaskId();
    console.log("Sharing task with user:", effectiveTaskId);

    try {
      setSharedTaskError(null);

      const result = await SharedTaskService.shareTask(
        effectiveTaskId,
        user.id,
        recipientId,
        getTaskById
      );

      await fetchSharedTasks();
      return result;
    } catch (err) {
      setSharedTaskError("Unable to share task at this moment. Please try again later.");
      throw err;
    }
  };


  const getAvailableFriendsForTask = useCallback(async () => {
    if (!user?.id) return;

    const effectiveTaskId = getEffectiveTaskId();
    if (!effectiveTaskId) return;

    try {
      setIsLoading(true);
      const data = await SharedTaskService.getAvailableFriendsForTask(
        user.id,
        effectiveTaskId
      );
      setSharedTaskError(null);
      return data;
    } catch (err) {
      setSharedTaskError("Error fetching friends");
      console.sharedTaskError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, getEffectiveTaskId]);


  const updateSharedTaskStatus = (invitationId, status) => {
    setSharedTasks((prev) =>
      prev.map((task) =>
        task.id === invitationId ? { ...task, status } : task
      )
    );
  };


  const acceptTaskShare = async (invitationId, status) => {
    try {
      setSharedTaskError(null);
      updateSharedTaskStatus(invitationId, status);

      const updatedTask = await SharedTaskService.acceptTaskShare(invitationId);

      setSharedTasks((prev) =>
        prev.map((task) =>
          task.id === invitationId ? { ...task, ...updatedTask } : task
        )
      );
      return updatedTask;
    } catch (err) {
      await fetchSharedTasks();
      setSharedTaskError("Something went wrong. Please try again.");
      throw err;
    } finally {
      await fetchTasks(user.id);
    }
  };


  const rejectedTaskShare = async (invitationId, status) => {
    try {
      setSharedTaskError(null);
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
      setSharedTaskError("Something went wrong. Please try again.");
      throw err;
    }
  };

 
  const cancelShareTask = async (sharedTaskId) => {
    const previousTasks = [...sharedTasks];

    try {
      setSharedTaskError(null);
      setSharedTasks((prev) => prev.filter((task) => task.id !== sharedTaskId));

      await SharedTaskService.cancelShareTask(sharedTaskId);
    } catch (err) {
      setSharedTasks(previousTasks);
      setSharedTaskError("Something went wrong. Please try again.");
      throw err;
    }
  };

  useEffect(() => {
    if (sharedTaskError) {
      const timer = setTimeout(() => {
        setSharedTaskError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sharedTaskError]);

  return {
    query,
    setQuery,
    sharedTasks,
    isLoading,
    sharedTaskError,
    shareTask,
    acceptTaskShare,
    cancelShareTask,
    refreshSharedTasks: fetchSharedTasks,
    rejectedTaskShare,
    users,
    setTasksToShare: setTaskToShare, 
    taskToShare,
    getAvailableFriendsForTask,
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
