import React from "react";
import { useNavigate } from "react-router-dom";
import { TodoList } from "../components/todos/list/TodoList";
import { CreateTodoButton } from "../components/todos/create/CreateTodoButton";
import { Header } from "../components/todos/header/Header";
import { Progress } from "../components/todos/progress/Progress";
import { TodoCounter } from "../components/todos/counter/TodoCounter";
import { TodosLoading } from "../components/todos/loading/TodosLoading";
import { EmptyTodos } from "../components/todos/empty/EmptyTodos";
import { useTodo } from "../components/context/TodoContext";

import "../styles/App.css";

function HomePage({ user }) {
  const { todos, completeTodo, deleteTodo, loading} = useTodo();

  const navigate = useNavigate();

  return (
    <>
      <div className="containerApp">
        <Header user={user} />
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
