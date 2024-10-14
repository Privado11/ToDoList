import React from "react";
import { AppUI } from "./AppUI";
import { TodoProvider } from "./components/context/TodoContext";
import { ToastProvider } from "./components/context/ToastContext";

function App() {
  return (
    <ToastProvider>
      <TodoProvider>
        <AppUI />
      </TodoProvider>
    </ToastProvider>
  );
}

export default App;
