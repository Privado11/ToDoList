import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuthLogic } from "../../auth/hooks/useAuth";
import TaskService from "@/service/tasks/TaskService";
import { toast } from "sonner";

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuthLogic();

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const data = await TaskService.getTasks(user.id);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getTaskById = useCallback(
    async (id) => {
      if (!id) return;

      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        if (selectedTask?.id !== id) {
          const task = await TaskService.getTaskById(user.id, id);
          console.log(task);
          setSelectedTask(task);
          return task;
        }
        return selectedTask;
      } catch (err) {
        setError(err.message);
        setSelectedTask(null);
      } finally {
        setLoading(false);
      }
    },
    [selectedTask, user]
  );

  const createTask = useCallback(
    async (taskData) => {
      setLoading(true);
      setError(null);
      try {
        const newTask = await TaskService.createTask(taskData, user.id);
        fetchTasks();
        return newTask;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const updateTask = useCallback(
    async (id, updates) => {
      setLoading(true);
      setError(null);
      try {
        const updatedTask = await TaskService.updateTask(id, updates);
        fetchTasks();
        if (selectedTask?.id === id) {
          setSelectedTask(getTaskById(id));
        }
        return updatedTask;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedTask?.id, getTaskById]
  );

  const deleteTask = useCallback(
    async (id) => {
      const taskToDelete = tasks.find((task) => task.id === id);
      if (!taskToDelete) return false;

      const previousTasks = [...tasks];

      setTasks((prev) => prev.filter((task) => task.id !== id));

      if (selectedTask?.id === id) {
        setSelectedTask(null);
      }

      try {
        await TaskService.deleteTask(id);
        return true;
      } catch (err) {
        setTasks(previousTasks);

        if (selectedTask?.id === id) {
          setSelectedTask(taskToDelete);
        }

        toast("Error deleting task", {
          description: err.message || "Please try again later",
          action: {
            label: "Retry",
            onClick: () => deleteTask(id),
          },
        });

        setError(err.message);
        return false;
      }
    },
    [tasks, selectedTask?.id]
  );

  const clearSelectedTask = useCallback(() => {
    if (selectedTask) {
      setSelectedTask(null);
    }
  }, [selectedTask]);

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
          !task?.statuses?.id === 3 && new Date(task.due_date) < new Date()
      ).length,
    [tasks]
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    selectedTask,
    loading,
    error,
    fetchTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    clearSelectedTask,
    completedTasks,
    inProgressTasks,
    overdueTasks,
  };
};
