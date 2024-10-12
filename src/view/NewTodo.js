import React, { useContext, useEffect, useState } from "react";
import { TodoContext } from "../components/context/TodoContext";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/NewTodo.css";
import MinHeightTextarea from "../components/MinHeightTextarea";
import BasicDateTimePicker from "../components/BasicDateTimePicker";
import { DateTime } from "luxon";

function NewTodo() {
  const { addTodo: addTask, todos, updateTodo } = useContext(TodoContext);
  let navigate = useNavigate();
  const { id } = useParams();

  const [newTask, setNewTask] = useState({
    id: todos.length + 1,
    title: "",
    description: "",
    category: "",
    creationDate: DateTime.local().toISO(), 
    dueDate: null,
    priority: "",
    comments: "",
    completed: false,
  });

  useEffect(() => {
    if (id) {
      setNewTask(todos.find((todo) => todo.id === parseInt(id)));
    }
  }, [id]);

  const onInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const onPriorityChange = (e) => {
    setNewTask({ ...newTask, priority: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (newTask.title.trim() === "") {
      alert("Task title is required!");
      return;
    }

    if (id) {
      updateTodo(newTask);
    } else {
      addTask(newTask);
    }
    navigate("/");
  };

  return (
    <div className="container" style={{display: "flex", flexDirection: "column" }}>
      <div className="container text-center">
        <h1>{id ? "Edit Task" : "Add New Task"}</h1>
      </div>
      <form onSubmit={(e) => onSubmit(e)}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Title
          </label>
          <input  
            type="text"
            className="form-control"
            id="title"
            name="title"
            required={true}
            value={newTask.title}
            onChange={(e) => onInputChange(e)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <MinHeightTextarea
            className="form-control"
            id="description"
            name="description"
            value={newTask.description}
            onChange={(e) => onInputChange(e)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="category" className="form-label">
            Category
          </label>
          <input
            type="text"
            className="form-control"
            id="category"
            name="category"
            value={newTask.category}
            onChange={onInputChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="dueDate" className="form-label">
            Due Date
          </label>
          <BasicDateTimePicker
            className="form-control"
            id="dueDate"
            name="dueDate"
            value={newTask.dueDate}
            onChange={onInputChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="priority" className="form-label">
            Priority
          </label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="Low"
                name="priority"
                checked={newTask.priority === "Low"}
                onChange={onPriorityChange}
              />{" "}
              Low
            </label>
            <label>
              <input
                type="radio"
                value="Medium"
                name="priority"
                checked={newTask.priority === "Medium"}
                onChange={onPriorityChange}
              />{" "}
              Medium
            </label>
            <label>
              <input
                type="radio"
                value="High"
                name="priority"
                checked={newTask.priority === "High"}
                onChange={onPriorityChange}
              />{" "}
              High
            </label>
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="comments" className="form-label">
            Comments
          </label>
          <MinHeightTextarea
            className="form-control"
            id="comments"
            name="comments"
            value={newTask.comments}
            onChange={onInputChange}
          />
        </div>
        <div className="text-center" style={{marginTop: "2rem", gap: "2rem"}}>
          <button type="submit" className="btn btn-success btn-sm me-3">
            {id ? "Update Task" : "Add Task"}
          </button>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => navigate("/")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export { NewTodo };
