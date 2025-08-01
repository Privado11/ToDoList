import { useState, useEffect, useMemo, useCallback } from "react";
import TaskService from "@/service/tasks/TaskService";
import { toast } from "sonner";
import { useTaskSubscription } from "./useTaskSubscription";
import { useProfile } from "@/features/users";

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingTask, setIsLoadingTask] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { profile: user } = useProfile();

  const { subscribeToUserTasks, unsubscribe: unsubscribeFromTasks } =
    useTaskSubscription(setTasks);

  useEffect(() => {
    if (user && !user.is_anonymous) {
      subscribeToUserTasks(user.id, () => TaskService.getTasks(user.id));
    }

    return () => {
      unsubscribeFromTasks();
    };
  }, [user, subscribeToUserTasks, unsubscribeFromTasks]);

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    setIsLoadingList(true);
    try {
      const data = await TaskService.getTasks(user.id);
      setTasks(data);
    } catch (err) {
      toast.error("Error loading tasks", {
        description: "Please try again later",
        action: {
          label: "Retry",
          onClick: () => fetchTasks(),
        },
      });
    } finally {
      setIsLoadingList(false);
    }
  }, [user]);

  const getTaskById = useCallback(
    async (id) => {
      if (!id || !user) return;
      if (selectedTask?.id === id) return selectedTask;

      setIsLoadingTask(true);
      try {
        const task = await TaskService.getTaskById(user.id, id);
        setSelectedTask(task);
        return task;
      } catch (err) {
        setSelectedTask(null);
        toast.error("Error loading task details", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => getTaskById(id),
          },
        });
      } finally {
        setIsLoadingTask(false);
      }
    },
    [selectedTask, user]
  );

  const createTask = useCallback(
    async (taskData) => {
      setIsCreating(true);
      try {
        const newTask = await TaskService.createTask(taskData, user.id);

        setTasks((prevTasks) => [newTask, ...prevTasks]);
        toast.success("Task created successfully", {
          description: `"${taskData.title}" has been added to your tasks`,
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });
        return newTask;
      } catch (err) {
        toast.error("Error creating task", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => createTask(taskData),
          },
        });
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    [user?.id]
  );

  const updateTask = useCallback(
    async (id, updates, mode = "simple") => {
      setIsUpdating(true);

      try {
        const updatedTask = await TaskService.updateTask(id, updates, mode);

        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === id ? updatedTask : task))
        );

        if (selectedTask?.id === id) {
          setSelectedTask(updatedTask);
        }

        if (updates.statuses?.id === 3) {
          toast.success("Task completed!", {
            description: `"${updatedTask.title}" marked as completed`,
            action: {
              label: "Dismiss",
              onClick: () => toast.dismiss(),
            },
          });
        } else {
          toast.success("Task updated", {
            description: `"${updatedTask.title}" has been updated`,
            action: {
              label: "Dismiss",
              onClick: () => toast.dismiss(),
            },
          });
        }

        return updatedTask;
      } catch (err) {
        toast.error("Error updating task", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => updateTask(id, updates, mode),
          },
        });
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    [selectedTask?.id]
  );

  const updateTaskStatus = useCallback(
    async (id) => {
      if (!id || !user) return;

      const currentTask = tasks.find((task) => task.id === id);
      if (!currentTask) return;

      const isCompleted = currentTask.statuses.name === "Completed";

      const optimisticTask = {
        ...currentTask,
        status_id: isCompleted ? 1 : 3,
        statuses: {
          id: isCompleted ? 1 : 3,
          name: isCompleted ? "Pending" : "Completed",
        },
        updated_at: new Date().toISOString(),
      };

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === id ? optimisticTask : task))
      );

      toast.success(`Task ${isCompleted ? "reopened" : "completed"}!`, {
        description: `"${currentTask.title}" marked as ${
          isCompleted ? "pending" : "completed"
        }`,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });

      try {
        const response = await TaskService.updateTaskStatus(id, user.id);

        if (response && !response.success) {
          throw new Error(response.message || "Failed to complete task");
        }

        const confirmedTask = {
          ...optimisticTask,
          title: response?.task_title || optimisticTask.title,
        };

        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === id ? confirmedTask : task))
        );

        return confirmedTask;
      } catch (err) {
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === id ? currentTask : task))
        );

        toast.dismiss();
        toast.error("Error completing task", {
          description: "Task reverted. Please try again.",
          action: {
            label: "Retry",
            onClick: () => updateTaskStatus(id),
          },
        });

        throw err;
      }
    },
    [tasks, user?.id]
  );

  const deleteTask = useCallback(
    async (id) => {
      const taskToDelete = tasks.find((task) => task.id === id);
      if (!taskToDelete) return false;

      const previousTasks = [...tasks];

      setIsDeleting(true);

      setTasks((prev) => prev.filter((task) => task.id !== id));

      if (selectedTask?.id === id) {
        setSelectedTask(null);
      }

      try {
        await TaskService.deleteTask(id);
        toast.success("Task deleted", {
          description: `"${taskToDelete.title}" has been removed`,
          action: {
            label: "Dismiss",
            onClick: () => toast.dismiss(),
          },
        });
        return true;
      } catch (err) {
        setTasks(previousTasks);

        if (selectedTask?.id === id) {
          setSelectedTask(taskToDelete);
        }

        toast.error("Error deleting task", {
          description: "Please try again later",
          action: {
            label: "Retry",
            onClick: () => deleteTask(id),
          },
        });
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [tasks, selectedTask?.id]
  );


  const completedTasks = useMemo(
    () => tasks.filter((task) => task?.statuses?.id === 3).length,
    [tasks]
  );

  const inProgressTasks = useMemo(
    () => tasks.length - completedTasks,
    [tasks, completedTasks]
  );

  const overdueTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task?.statuses?.id !== 3 && new Date(task.due_date) < new Date()
      ).length,
    [tasks]
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    selectedTask,
    setSelectedTask,

    isLoadingList,
    isLoadingTask,
    isCreating,
    isUpdating,
    isDeleting,

    fetchTasks,
    getTaskById,
    createTask,
    updateTaskStatus,
    updateTask,
    deleteTask,
    completedTasks,
    inProgressTasks,
    overdueTasks,
  };
};
