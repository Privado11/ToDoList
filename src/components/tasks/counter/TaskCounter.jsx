import React from "react";
import "../../../styles/TaskCounter.css";
import { useTaskContext } from "@/components/context/TaskContext";

function TaskCounter() {
  const { completedTodos, inProgressTodos } = useTaskContext();
  return (
    <div className="TaskCounter">
      <p>{completedTodos} completed</p>
      <p>{inProgressTodos} in progress</p>
    </div>
  );
}

export { TaskCounter };
