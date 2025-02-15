import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuthLogic } from "../useAuth";
import TaskService from "@/components/service/tasks/TaskService";

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuthLogic();

  useEffect(() => {
    console.log("Tasks:", selectedTask);
  }, [selectedTask]);

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

      setLoading(true);
      setError(null);
      try {
        if (selectedTask?.id !== id) {
          const task = await TaskService.getTaskById(id);
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
    [selectedTask]
  );

  const createTask = useCallback(
    async (taskData) => {
      setLoading(true);
      setError(null);
      try {
        const newTask = await TaskService.createTask(taskData, user.id);
        setTasks((prev) => [newTask, ...prev]);
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
        setTasks((prev) =>
          prev.map((task) => (task.id === id ? updatedTask : task))
        );
        if (selectedTask?.id === id) {
          setSelectedTask(updatedTask);
        }
        return updatedTask;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedTask?.id]
  );

  const deleteTask = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await TaskService.deleteTask(id);
        setTasks((prev) => prev.filter((task) => task.id !== id));
        if (selectedTask?.id === id) {
          setSelectedTask(null);
        }
        return true;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedTask?.id]
  );


  const clearSelectedTask = useCallback(() => {
    if (selectedTask) {
      setSelectedTask(null);
    }
  }, []);

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.completed).length,
    [tasks]
  );

  const inProgressTasks = useMemo(
    () => tasks.length - completedTasks,
    [tasks, completedTasks]
  );

  const overdueTasks = useMemo(
    () =>
      tasks.filter((task) => !task.completed && new Date(task.due_date) < new Date()).length,
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
