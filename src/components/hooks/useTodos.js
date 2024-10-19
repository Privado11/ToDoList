import { useEffect, useMemo, useState, useCallback } from "react";
import {
  getTodos,
  getTodoById,
  saveTodo,
  putTodo,
  deleteTodo as removeTodo,
} from "../service/todoService";
import { useToast } from "../context/ToastContext";
import { useAuthLogic } from "./useAuth";

export const useTodos = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const { showToast } = useToast();
  const { user } = useAuthLogic();

  const fetchTodos = useCallback(async () => {
    if (!user) return;

    try {
      const todosData = await getTodos(user.id);
      setTodos(todosData || []);
    } catch (err) {
      console.error("Error fetching todos:", err.message);
      setError("Error fetching todos");
      showToast("Error fetching todos");
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const refreshTodos = async () => {
    await fetchTodos();
  };

  const completedTodos = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos]
  );

  const inProgressTodos = useMemo(
    () => todos.length - completedTodos,
    [todos, completedTodos]
  );

  const fetchTodoById = async (id) => {
    try {
      const todo = await getTodoById(id);
      if (todo && todo.length > 0) {
        setSelectedTodo(todo[0]);
        return todo[0];
      } else {
        showToast("Task not found");
      }
    } catch (error) {
      console.error("Error fetching todo by ID:", error.message);
      showToast("Error fetching task");
    }
  };

  const addTodo = async (newTask) => {
    if (!user) return;
    try {
      const insertedTodo = await saveTodo(newTask, user.id);
      if (insertedTodo) {
        fetchTodos();
        showToast("Task added successfully");
      }
    } catch (error) {
      console.error("Error adding task:", error.message);
      showToast("Error adding task");
    }
  };

  const updateTodo = async (updatedTask) => {
    try {
      const updatedTodo = await putTodo(updatedTask.id, updatedTask);
      if (updatedTodo) {
        await refreshTodos();
        showToast("Task updated successfully");
      }
    } catch (error) {
      console.error("Error updating task:", error.message);
      showToast("Error updating task");
    }
  };

  const deleteTodo = async (id) => {
    try {
      const success = await removeTodo(id);
      if (success) {
        fetchTodos();
        showToast("Task deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting task:", error.message);
      showToast("Error deleting task");
    }
  };

  const completeTodo = async (id) => {
    try {
      const todoIndex = todos.findIndex((todo) => todo.id === id);
      if (todoIndex < 0) return;

      const updatedTodo = {
        ...todos[todoIndex],
        completed: !todos[todoIndex].completed,
      };

      const result = await putTodo(id, updatedTodo);
      if (result) {
        setTodos((prevTodos) =>
          prevTodos.map((todo) =>
            todo.id === id
              ? { ...todo, completed: updatedTodo.completed }
              : todo
          )
        );
        showToast(
          updatedTodo.completed
            ? "Task completed successfully"
            : "Task unmarked as completed"
        );
      }
    } catch (error) {
      console.error("Error completing task:", error.message);
      showToast("Error completing task");
    }
  };

  return {
    todos,
    selectedTodo,
    completedTodos,
    inProgressTodos,
    loading,
    error,
    addTodo,
    updateTodo,
    deleteTodo,
    completeTodo,
    fetchTodoById,
  };
};
