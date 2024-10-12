import React from "react";
import { useLocalStorage } from "../service/useLocalStorage";

const TodoContext = React.createContext();

function TodoProvider({ children }) {
  const {
    item: todos,
    saveItem: saveTodos,
    loading,
    error,
  } = useLocalStorage("TASKLIST_V1", []);


  const completedTodos = todos.filter((todo) => !!todo.completed).length;
  const inProgressTodos = todos.length - completedTodos;

  const addTodo = (newTask) => {
    const newTodos = [...todos];
    newTodos.push({
      ...newTask,
    });
    saveTodos(newTodos);
  };

  const updateTodo = (updatedTask) => {
    const newTodos = todos.map((todo) =>
      todo.id === updatedTask.id ? updatedTask : todo
    );
    saveTodos(newTodos);
  };

  const completeTodo = (id) => {
    const todoIndex = todos.findIndex((todo) => todo.id === id);
    const newTodos = [...todos];
    newTodos[todoIndex].completed = !newTodos[todoIndex].completed;
    saveTodos(newTodos);
  };

  const deleteTodo = (id) => {
    const newTodos = todos.filter((todo) => todo.id !== id);
    saveTodos(newTodos);
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
