import React from "react";
import { createPortal } from "react-dom";
import "../../../styles/TodoDetailModal.css";

function TodoDetailModal({ isOpen, onRequestClose, todo }) {
  if (!isOpen) return null;

  const handleComplete = () => {
    if (todo.onComplete) {
      todo.onComplete(); 
    }
    onRequestClose(); 
  };

  return createPortal(
    <div
      className="modal fade show"
      style={{ display: "block" }}
      id="staticBackdrop"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-15" id="staticBackdropLabel">
              {todo.title || "Untitled Task"}
            </h1>
            <button
              type="button"
              className="btn-close"
              onClick={onRequestClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p>
              <strong>Description:</strong>{" "}
              {todo.description || "No description provided."}
            </p>
            <p>
              <strong>Creation Date:</strong>{" "}
              {new Date(todo.creationDate).toLocaleDateString("en-EN", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })}
            </p>
            <p>
              <strong>Due Date:</strong>{" "}
              {todo.dueDate
                ? new Date(todo.dueDate).toLocaleString("en-EN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })
                : "No due date set."}
            </p>
            <p>
              <strong>Category:</strong>{" "}
              {todo.category || "No category assigned."}
            </p>
            <p>
              <strong>Priority:</strong> {todo.priority || "No priority set."}
            </p>
            <p>
              <strong>Comments:</strong> {todo.comments || "No comments."}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {todo.completed ? "Completada" : "Pendiente"}
            </p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onRequestClose}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleComplete}
            >
              Completed
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("modal")
  );
}

export { TodoDetailModal };
