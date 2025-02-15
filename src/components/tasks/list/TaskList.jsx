import React from "react";
import { TaskItem } from "../item/TaskItem";
import "../../../styles/TaskList.css";
import Skeleton from "@mui/material/Skeleton";
import { useTaskContext } from "@/components/context/TaskContext";

function TaskList({ tasks, onComplete, onEdit, onDelete }) {
  const { loading } = useTaskContext();

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
        <ul className="TaskList">
          <div className="containerList">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={{
                  ...task,
                  onComplete: () => onComplete(task.id),
                  onEdit: () => onEdit(task.id),
                  onDelete: () => onDelete(task.id),
                }}
              />
            ))}
          </div>
        </ul>
      )}
    </div>
  );
}

export { TaskList };
