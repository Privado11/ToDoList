import { useEffect, useMemo, useState, useCallback } from "react";
import TodoService from "../service/todoService";
import { useToast } from "../context/ToastContext";
import { useAuthLogic } from "./useAuth";
import { supabase } from "../service/supabase";

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const { showToast } = useToast();
  const { user } = useAuthLogic();

  const fetchTodos = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const data = await TodoService.getTodos(user.id);
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const completedTodos = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos]
  );

  const inProgressTodos = useMemo(
    () => todos.length - completedTodos,
    [todos, completedTodos]
  );

  const getTodoById = useCallback(async (id) => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const todo = await TodoService.getTodoById(id);
      setSelectedTodo(todo);

      TodoService.subscribeToComments(id, (updatedComments) => {
        setSelectedTodo((prevTodo) => {
          if (!prevTodo) return null;
          return {
            ...prevTodo,
            comments_with_user_names: updatedComments,
          };
        });
      });

      return todo;
    } catch (err) {
      setError(err.message);
      setSelectedTodo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTodoInvitedById = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const todo = await TodoService.getTodoInvitedById(id);
      setSelectedTodo(todo);

      return todo;
    } catch (err) {
      setError(err.message);
      setSelectedTodo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateInvitationStatus = useCallback(async (id, status) => {
    if (!id || !status) return;
    setLoading(true);
    setError(null);
    try {
      const updatedTodo = await TodoService.updateInvitationStatus(id, status);
      setSelectedTodo(updatedTodo);
      return updatedTodo;
    } catch (err) {
      setError(err.message);
      setSelectedTodo(null);
    } finally {
      setLoading(false);
    }
  }, []);


  const clearSelectedTodo = useCallback(() => {
    if (selectedTodo?.id) {
      TodoService.unsubscribeFromComments(selectedTodo.id);
    }
    setSelectedTodo(null);
  }, [selectedTodo?.id]);

  useEffect(() => {
    return () => {
      TodoService.unsubscribeFromAll();
    };
  }, []);

  const createTodo = useCallback(
    async (todoData) => {
      setLoading(true);
      setError(null);
      try {
        const newTodo = await TodoService.saveTodo(todoData, user.id);
        setTodos((prev) => [newTodo, ...prev]);
        return newTodo;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user?.id]
  );

  const createComment = useCallback(
    async (commentData, taskId) => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        const newComment = await TodoService.saveComment(
          commentData,
          taskId,
          user.id
        );

        return newComment;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );
  const updateTodo = useCallback(
    async (id, updates) => {
      setLoading(true);
      setError(null);
      try {
        const updatedTodo = await TodoService.updateTodo(id, updates);
        setTodos((prev) =>
          prev.map((todo) => (todo.id === id ? updatedTodo : todo))
        );
        if (selectedTodo?.id === id) {
          setSelectedTodo(updatedTodo);
        }
        return updatedTodo;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedTodo]
  );

  const deleteTodo = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await TodoService.deleteTodo(id);
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
        if (selectedTodo?.id === id) {
          setSelectedTodo(null);
        }
        return true;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedTodo]
  );

  const completeTodo = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        const todoIndex = todos.findIndex((todo) => todo.id === id);
        if (todoIndex < 0) throw new Error("Task not found");

        const updatedTodo = {
          ...todos[todoIndex],
          completed: !todos[todoIndex].completed,
        };

        const result = await TodoService.putTodo(id, updatedTodo);
        if (result) {
          setTodos((prevTodos) =>
            prevTodos.map((todo) =>
              todo.id === id
                ? { ...todo, completed: updatedTodo.completed }
                : todo
            )
          );
        }
      } catch (err) {
        setError(err.message);
        console.error("Error completing task:", err.message);
      } finally {
        setLoading(false);
      }
    },
    [todos]
  );

  const shareTask = useCallback(
    async (taskId, recipientId, isEmail) => {
      if (!user) return;

      setLoading(true);
      setError(null);
      try {
        const data = await TodoService.sharedTask(
          taskId,
          user.id,
          recipientId,
          isEmail
        );
        return data; 
      } catch (err) {
        setError(err.message);
        console.error("Error sharing task:", err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user] 
  );


  return {
    todos,
    selectedTodo,
    loading,
    error,
    fetchTodos,
    getTodoById,
    createTodo,
    updateTodo,
    deleteTodo,
    clearSelectedTodo,
    completeTodo,
    completedTodos,
    inProgressTodos,
    createComment,
    shareTask,
    getTodoInvitedById,
    updateInvitationStatus
  };
};
