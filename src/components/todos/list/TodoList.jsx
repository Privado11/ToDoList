import React from "react";
import { TodoItem } from "../item/TodoItem";
import "../../../styles/TodoList.css";
import Skeleton from "@mui/material/Skeleton";
import { useTodo } from "../../context/TodoContext";

function TodoList({ todos, onComplete, onEdit, onDelete }) {
  const { loading } = useTodo();

  return (
    <div className="containerTask">
      <h1>Tasks</h1>
      {loading ? (
        <div className="skeletonContainer" style={{ margin: "0 1rem 1rem 0" }}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              width="100%"
              height={67}
              style={{
                borderRadius: "1.5rem",
                marginBottom: "10px",
                marginRight: "1rem",
              }}
            />
          ))}
        </div>
      ) : (
        <ul className="TodoList">
          <div className="containerList">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={{
                  ...todo,
                  onComplete: () => onComplete(todo.id),
                  onEdit: () => onEdit(todo.id),
                  onDelete: () => onDelete(todo.id),
                }}
              />
            ))}
          </div>
        </ul>
      )}
    </div>
  );
}

export { TodoList };
