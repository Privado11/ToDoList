import { useAuthLogic } from "@/features/auth";
import { useSharedTasksSubscription } from "@/features/tasks/hooks/useTaskSubscription";
import { SharedTaskService } from "@/service";
import { useState, useEffect, useCallback } from "react";


export const useSharedTasks = (taskId, getTaskById) => {
  const [users, setUsers] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuthLogic();

  const { subscribeToSharedTasks, unsubscribe: unsubscribeFromSharedTasks } =
    useSharedTasksSubscription(setSharedTasks);

  
  useEffect(() => {
    if (sharedTasks.length === 0 && taskId && !isLoading) {
      SharedTaskService.getUsersFromSharedTask(taskId).then((data) => {
        if (data && data.length > 0) {
          console.log("Setting shared tasks from task id:", data);
          setSharedTasks(data);
        }
      });
    }
  }, [sharedTasks, taskId, isLoading]);

  const fetchUsers = useCallback(
    async (query) => {
      if (!user) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await SharedTaskService.searchUsersForSharedTask(
          query,
          user.id,
          taskId
        );
        setUsers(data);
      } catch (err) {
        setError("Error fetching users");
        console.error(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [user, taskId]
  );

  const fetchSharedTasks = useCallback(async () => {

    try {
      setIsLoading(true);
      const data = await SharedTaskService.getUsersFromSharedTask(taskId);
      setSharedTasks(data);

      if (taskId) {
        subscribeToSharedTasks(
          taskId,
          async () => await SharedTaskService.getUsersFromSharedTask(taskId)
        );
      }
      setError(null);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Error fetching shared tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, taskId, subscribeToSharedTasks]);

  const getUsersFromSharedTask = useCallback(async () => {
    if (!taskId) return;

    try {
      setIsLoading(true);
      const data = await SharedTaskService.getUsersFromSharedTask(taskId);
      setSharedTasks(data);
      setError(null);
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.error("Error fetching shared tasks:", err);
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    getUsersFromSharedTask();
  }, [getUsersFromSharedTask]);

    useEffect(() => {
      if (taskId) {
        fetchSharedTasks();
      }
    }, [taskId, fetchSharedTasks]);

  const shareTask = async (recipientId) => {
    if (!user?.id) return;

    console.log("Sharing task with user:", taskId);

    try {
      setError(null);
     
      const result = await SharedTaskService.shareTask(
        taskId,
        user.id,
        recipientId, 
        getTaskById
      );
      await fetchSharedTasks();
      return result;
    } catch (err) {
      setError("Unable to share task at this moment. Please try again later.");
      throw err;
    }
  };

 const getAvailableFriendsForTask = useCallback(async () => {
   if (!user) return;

   try {
     setIsLoading(true);
     const data = await SharedTaskService.getAvailableFriendsForTask(
       user.id,
       taskId
     );
     setError(null);
     return data;
   } catch (err) {
     setError("Error fetching friends");
     console.error(err.message);
   } finally {
     setIsLoading(false);
   }
 }, [user, taskId]);
  const updateSharedTaskStatus = (invitationId, status) => {
    setSharedTasks((prev) =>
      prev.map((task) =>
        task.id === invitationId ? { ...task, status } : task
      )
    );
  };

  const acceptTaskShare = async (invitationId, status) => {
    try {
      setError(null);
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
      setError("Something went wrong. Please try again.");
      throw err;
    }
  };

  const rejectedTaskShare = async (invitationId, status) => {
    try {
      setError(null);
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
      setError("Something went wrong. Please try again.");
      throw err;
    }
  };

  const cancelShareTask = async (sharedTaskId) => {
    const previousTasks = [...sharedTasks];

    try {
      setError(null);
      setSharedTasks((prev) => prev.filter((task) => task.id !== sharedTaskId));

      await SharedTaskService.cancelShareTask(sharedTaskId);
    } catch (err) {
      setSharedTasks(previousTasks);
      setError("Something went wrong. Please try again.");
      throw err;
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return {
    sharedTasks,
    isLoading,
    error,
    shareTask,
    acceptTaskShare,
    cancelShareTask,
    refreshSharedTasks: fetchSharedTasks,
    rejectedTaskShare,
    users,
    fetchUsers,
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
