import React, { useContext} from "react";
import { useNavigate } from "react-router-dom"; 
import { TodoList } from "../components/todos/list/TodoList";
import { CreateTodoButton } from "../components/todos/create/CreateTodoButton";
import { Header } from "../components/todos/header/Header";
import { Progress } from "../components/todos/progress/Progress";
import { TodoCounter } from "../components/todos/counter/TodoCounter";
import { TodosLoading } from "../components/todos/loading/TodosLoading";
import { TodosError } from "../components/todos/error/TodosError";
import { EmptyTodos } from "../components/todos/empty/EmptyTodos";
import { TodoContext } from "../components/context/TodoContext";
import "../styles/App.css";

function HomePage() {
  const { todos, completeTodo, deleteTodo, loading, error } =
    useContext(TodoContext);
  const navigate = useNavigate();
  


  return (
    <>
      <div className="containerApp">
        <Header />
        <main>
          <TodoList
            todos={todos}
            onComplete={completeTodo}
            onEdit={(id) => navigate(`/edit-task/${id}`)}
            onDelete={deleteTodo}
          >
            {loading && <TodosLoading />}
            {error && <TodosError />}
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
