import React from "react";
import { useNavigate } from "react-router-dom";
import { TodoList } from "../components/todos/list/TodoList";
import { CreateTodoButton } from "../components/todos/create/CreateTodoButton";
import { Header } from "../components/todos/header/Header";
import { Progress } from "../components/todos/progress/Progress";
import { TodoCounter } from "../components/todos/counter/TodoCounter";
import { TodosLoading } from "../components/todos/loading/TodosLoading";
import { TodosError } from "../components/todos/error/TodosError";
import { EmptyTodos } from "../components/todos/empty/EmptyTodos";
import { useTodo } from "../components/context/TodoContext";
import { useAuthLogic } from "../components/hooks/useAuth"; // Asegúrate de importar el hook de autenticación
import "../styles/App.css";

function HomePage({ user }) {
  const { todos, completeTodo, deleteTodo, loading, error } = useTodo();
  const { signOut } = useAuthLogic(); // Obtiene la función de cierre de sesión
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(); // Llama a la función de cierre de sesión
      navigate("/login"); // Redirige a la página de inicio de sesión después de cerrar sesión
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
    }
  };

  return (
    <>
      <div className="containerApp">
        <Header user={user} />
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
        <main>
          <TodoList
            todos={todos}
            onComplete={completeTodo}
            onEdit={(id) => navigate(`/edit-task/${id}`)}
            onDelete={deleteTodo}
          >
            {loading && <TodosLoading />}
            {!loading && todos.length === 0 && <EmptyTodos />}
          </TodoList>
          <Progress>
            <TodoCounter />
            <CreateTodoButton />
          </Progress>
        </main>
      </div>
    </>
  );
}

export { HomePage };
