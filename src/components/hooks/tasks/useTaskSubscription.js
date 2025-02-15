import SubscriptionService from "@/components/service/tasks/SubscriptionService";
import { useRef, useCallback, useEffect } from "react";

export const useTaskSubscription = (setSelectedTask) => {
  const activeSubscriptionRef = useRef(null);

  const subscribeToTask = useCallback(
    (taskId, getTaskById) => {
      if (activeSubscriptionRef.current) {
        SubscriptionService.unsubscribeFromAll();
      }

      const subscription = SubscriptionService.subscribeToTask(taskId, {
        onCommentsChange: (updatedComments) => {
          setSelectedTask((prevTask) =>
            prevTask
              ? {
                  ...prevTask,
                  comments: updatedComments,
                }
              : null
          );
        },
        onSharedTasksChange: (updatedSharedTasks) => {
          setSelectedTask((prevTask) =>
            prevTask
              ? {
                  ...prevTask,
                  shared_tasks: updatedSharedTasks,
                }
              : null
          );
        },
        getTaskById,
      });

      activeSubscriptionRef.current = subscription;
    },
    [setSelectedTask]
  );

  const unsubscribe = useCallback(() => {
    if (activeSubscriptionRef.current) {
      SubscriptionService.unsubscribeFromAll();
      activeSubscriptionRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return { subscribeToTask, unsubscribe };
};

export const useCommentsSubscription = (setComments) => {
  const activeSubscriptionRef = useRef(null);

  const subscribeToComments = useCallback(
    (taskId, getComments) => {
      if (activeSubscriptionRef.current) {
        SubscriptionService.unsubscribeFromComments();
      }

      const subscription = SubscriptionService.subscribeToComments(taskId, {
        onCommentsChange: (updatedComments) => {
          setComments(updatedComments);
        },
        getComments,
      });

      activeSubscriptionRef.current = subscription;
    },
    [setComments]
  );

  const unsubscribe = useCallback(() => {
    if (activeSubscriptionRef.current) {
      SubscriptionService.unsubscribeFromComments();
      activeSubscriptionRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    subscribeToComments,
    unsubscribe,
  };
};

export const useSharedTasksSubscription = (setSharedTasks) => {
  const activeSubscriptionRef = useRef(null);

  const subscribeToSharedTasks = useCallback(
    (taskId, getUsersFromSharedTask) => {
      if (activeSubscriptionRef.current) {
        SubscriptionService.unsubscribeFromSharedTasks();
      }

      const subscription = SubscriptionService.subscribeToSharedTasks(taskId, {
        onSharedTasksChange: (updateUsersFromSharedTask) => {
          setSharedTasks(updateUsersFromSharedTask);
        },
        getUsersFromSharedTask,
      });

      activeSubscriptionRef.current = subscription;
    },
    [setSharedTasks]
  );

  const unsubscribe = useCallback(() => {
    if (activeSubscriptionRef.current) {
      SubscriptionService.unsubscribeFromSharedTasks();
      activeSubscriptionRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return {
    subscribeToSharedTasks,
    unsubscribe,
  };
};


