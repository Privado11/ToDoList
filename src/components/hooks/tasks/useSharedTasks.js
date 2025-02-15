import { useState, useEffect, useCallback } from "react";
import { useAuthLogic } from "../useAuth";
import SharedTaskService from "@/components/service/tasks/SharedTaskService";
import { useSharedTasksSubscription } from "./useTaskSubscription";

export const useSharedTasks = (taskId, getTaskById) => {
  const [sharedTasks, setSharedTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuthLogic();

  const { subscribeToSharedTasks, unsubscribe: unsubscribeFromSharedTasks } =
    useSharedTasksSubscription(setSharedTasks);

  useEffect(() => {
    if (taskId) {
      subscribeToSharedTasks(taskId, () =>
        SharedTaskService.getUsersFromSharedTask(taskId)
      );
    }

    return () => {
      unsubscribeFromSharedTasks();
    };
  }, [taskId, subscribeToSharedTasks, unsubscribeFromSharedTasks]);

  const fetchSharedTasks = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const data = await SharedTaskService.getSharedTasks(user.id);
      setSharedTasks(data);

      if (taskId) {
        subscribeToSharedTasks(
          taskId,
          SharedTaskService.getUsersFromSharedTask(taskId)
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

  const shareTask = async (recipientId, isEmail = false) => {
    if (!user?.id) return;

    try {
      setError(null);
      const result = await SharedTaskService.shareTask(
        taskId,
        user.id,
        recipientId,
        isEmail,
        getTaskById
      );
      await fetchSharedTasks();
      return result;
    } catch (err) {
      setError("Unable to share task at this moment. Please try again later.");
      throw err;
    }
  };

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

  // Limpiar error después de 5 segundos
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
