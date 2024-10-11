import React from "react";
import { TodoList } from "../components/todos/list/TodoList";
import { CreateTodoButton } from "../components/todos/create/CreateTodoButton";
import { TodoItem } from "../components/todos/item/TodoItem";
import { Header } from "../components/todos/header/Header";
import { Progress } from "../components/todos/progress/Progress";
import { TodoCounter } from "../components/todos/counter/TodoCounter";
import { TodosLoading } from "../components/todos/loading/TodosLoading";
import { TodosError } from "../components/todos/error/TodosError";
import { EmptyTodos } from "../components/todos/empty/EmptyTodos";
import { TodoContext } from "../components/context/TodoContext";
import "../styles/App.css";

function HomePage() {
  const { todos, completeTodo, deleteTodo, loading, error, setOpenModal } =
    React.useContext(TodoContext);

  return (
    <>
      <div className="containerApp">
        <Header />
        <main>
          <TodoList>
            {loading && <TodosLoading />}
            {error && <TodosError />}
            {!loading && todos.length === 0 && <EmptyTodos />}
            {todos.map((todo) => (
              <TodoItem
                key={todo.text}
                text={todo.text}
                completed={todo.completed}
                onComplete={() => completeTodo(todo.text)}
                onEdit={() => setOpenModal({ open: true, text: todo.text })}
                onDelete={() => deleteTodo(todo.text)}
              />
            ))}
          </TodoList>
          <Progress setOpenModal={setOpenModal}>
            <TodoCounter />
            <CreateTodoButton setOpenModal={setOpenModal} />
          </Progress>
        </main>
      </div>
    </>
  );
}

export { HomePage };
