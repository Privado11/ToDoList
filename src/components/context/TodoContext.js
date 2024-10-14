import React from "react";
import { useLocalStorage } from "../service/useLocalStorage";
import { useToast } from "./ToastContext";

const TodoContext = React.createContext();

function TodoProvider({ children }) {
  const {
    item: todos,
    saveItem: saveTodos,
    loading,
    error,
  } = useLocalStorage("TASKLIST_V1", []);
  const { showToast } = useToast();


  const completedTodos = todos.filter((todo) => !!todo.completed).length;
  const inProgressTodos = todos.length - completedTodos;

  const addTodo = (newTask) => {
    const newTodos = [...todos];
    newTodos.push({
      ...newTask,
    });
    saveTodos(newTodos);
    showToast("Task added successfully");
  };

  const updateTodo = (updatedTask) => {
    const newTodos = todos.map((todo) =>
      todo.id === updatedTask.id ? updatedTask : todo
    );
    saveTodos(newTodos);
    showToast("Task updated successfully");
  };

  const completeTodo = (id) => {
    const todoIndex = todos.findIndex((todo) => todo.id === id);
    const newTodos = [...todos];

  
    const isCompleted = newTodos[todoIndex].completed;

    newTodos[todoIndex].completed = !isCompleted;
    saveTodos(newTodos);
    
    if (isCompleted) {
      showToast("Task unmarked as completed");
    } else {
      showToast("Task completed successfully");
    }
  };


  const deleteTodo = (id) => {
    const newTodos = todos.filter((todo) => todo.id !== id);
    saveTodos(newTodos);
    showToast("Task deleted successfully");
  };

  return (
    <TodoContext.Provider
      value={{
        completedTodos,
        inProgressTodos,
        todos,
        completeTodo,
        deleteTodo,
        loading,
        error,
        addTodo,
        updateTodo,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export { TodoContext, TodoProvider };
