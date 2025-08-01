import { SubscriptionService } from "@/service";
import { useRef, useCallback, useEffect, useState } from "react";

export const useTaskSubscription = (setTasks) => {
  const activeSubscriptionRef = useRef(null);
  const [userId, setUserId] = useState(null);

  const subscribeToUserTasks = useCallback(
    (id, getTasks) => {
      if (activeSubscriptionRef.current) {
        SubscriptionService.unsubscribeFromAll();
      }

      setUserId(id);

      const subscription = SubscriptionService.subscribeToUserTasks(id, {
        onTasksChange: (updateTasks) => {
          setTasks(updateTasks);
        },
        getTasks,
      });

      activeSubscriptionRef.current = subscription;
    },
    [setTasks, userId]
  );

  const unsubscribe = useCallback(() => {
    if (activeSubscriptionRef.current && userId) {
      SubscriptionService.unsubscribeFromTasks(userId);
      activeSubscriptionRef.current = null;
      setUserId(null);
    }
  }, [userId]);

  useEffect(() => {
    return () => {
      unsubscribe();
    };
  }, [unsubscribe]);

  return { subscribeToUserTasks, unsubscribe };
};

export const useCommentsSubscription = (setComments) => {
  const activeSubscriptionRef = useRef(null);
  const [taskId, setTaskId] = useState(null);

  const subscribeToComments = useCallback(
    (id, getComments) => {
      if (activeSubscriptionRef.current && taskId) {
        SubscriptionService.unsubscribeFromComments(taskId);
      }

      setTaskId(id);

      const subscription = SubscriptionService.subscribeToComments(id, {
        onCommentsChange: (updatedComments) => {
          setComments(updatedComments);
        },
        getComments,
      });

      activeSubscriptionRef.current = subscription;
    },
    [setComments, taskId]
  );

  const unsubscribe = useCallback(() => {
    if (activeSubscriptionRef.current && taskId) {
      SubscriptionService.unsubscribeFromComments(taskId);
      activeSubscriptionRef.current = null;
      setTaskId(null);
    }
  }, [taskId]);

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
  const [taskId, setTaskId] = useState(null);

  const subscribeToSharedTasks = useCallback(
    (id, getUsersFromSharedTask) => {
      if (activeSubscriptionRef.current && taskId) {
        SubscriptionService.unsubscribeFromSharedTasks(taskId);
      }

      setTaskId(id);

      if (typeof getUsersFromSharedTask !== "function") {
        console.error("getUsersFromSharedTask debe ser una función");
        return null;
      }

      const subscription = SubscriptionService.subscribeToSharedTasks(id, {
        onSharedTasksChange: (updateUsersFromSharedTask) => {
          setSharedTasks(updateUsersFromSharedTask);
        },
        getUsersFromSharedTask,
      });

      activeSubscriptionRef.current = subscription;
      return subscription;
    },
    [setSharedTasks, taskId]
  );

  const unsubscribe = useCallback(() => {
    if (activeSubscriptionRef.current && taskId) {
      SubscriptionService.unsubscribeFromSharedTasks(taskId);
      activeSubscriptionRef.current = null;
      setTaskId(null);
    }
  }, [taskId]);

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
