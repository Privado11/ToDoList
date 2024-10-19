import React, { useContext } from "react";
import { useTodos } from "../hooks/useTodos";
import { useCategories } from "../hooks/useCategories";
import { usePriorities } from "../hooks/usePriorities";

const TodoContext = React.createContext();

const useTodo = () => useContext(TodoContext);

function TodoProvider({ children }) {
  const todosHook = useTodos();
  const categoriesHook = useCategories();
  const prioritiesHook = usePriorities();

  return (
    <TodoContext.Provider
      value={{
        ...todosHook,
        ...categoriesHook,
        ...prioritiesHook,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export { useTodo, TodoProvider };
