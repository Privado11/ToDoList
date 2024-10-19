import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MinHeightTextarea } from "../components/MinHeightTextarea";
import { BasicDateTimePicker } from "../components/BasicDateTimePicker";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useTodo } from "../components/context/TodoContext";
import "../styles/NewTodo.css";

function NewTodo() {
  const { addTodo: addTask, todos, updateTodo, categories } = useTodo();
  let navigate = useNavigate();
  const { id } = useParams();
  const [customCategory, setCustomCategory] = useState("");

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    category_id: null,
    due_date: null,
    priority_id: null,
    comments: "",
  });

  useEffect(() => {
    if (id) {
      setNewTask(todos.find((todo) => todo.id === parseInt(id)));
    }
  }, [id, todos]);

  const onInputChange = (e) => {
    setNewTask({ ...newTask, [e.target.name]: e.target.value });
  };

  const onPriorityChange = (e) => {
    const selectedPriority = e.target.value;
    let priorityId;

    switch (selectedPriority) {
      case "Low":
        priorityId = 1; 
        break;
      case "Medium":
        priorityId = 2; 
        break;
      case "High":
        priorityId = 3; 
        break;
      default:
        priorityId = null;
    }

    setNewTask({ ...newTask, priority_id: priorityId });
  };

  const onCategoryChange = (event, value) => {
    setNewTask({ ...newTask, category_id: value.id });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (newTask.title.trim() === "") {
      alert("Task title is required!");
      return;
    }

    if (customCategory) {
      newTask.category_id = customCategory;
    }

    if (id) {
      updateTodo(newTask);
    } else {
      addTask(newTask);
    }
    navigate("/");
  };

  return (
    <div className="container">
      <div className="container-text text-center">
        <h1>{id ? "Edit Task" : "Add New Task"}</h1>
      </div>
      <form onSubmit={onSubmit}>
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
            onChange={onInputChange}
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
            onChange={onInputChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="category_id" className="form-label">
            category_id
          </label>
          <Autocomplete
            className="form-control"
            disablePortal
            options={categories}
            getOptionLabel={(option) => option.name || "Unknown"}
            value={
              categories.find((cat) => cat.id === newTask.category_id) || null
            } 
            renderInput={(params) => <TextField {...params} />}
            onChange={onCategoryChange}
          />
          {newTask.category_id === "Other (please specify)" && (
            <input
              type="text"
              className="form-control mt-2"
              placeholder="Enter custom category_id"
              onChange={(e) => setCustomCategory(e.target.value)}
            />
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="due_date" className="form-label">
            Due Date
          </label>
          <BasicDateTimePicker
            className="form-control"
            id="due_date"
            name="due_date"
            value={newTask.due_date}
            onChange={onInputChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="priority_id" className="form-label">
            priority_id
          </label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                value="Low"
                name="priority_id"
                checked={newTask.priority_id === 1}
                onChange={onPriorityChange}
              />{" "}
              Low
            </label>
            <label>
              <input
                type="radio"
                value="Medium"
                name="priority_id"
                checked={newTask.priority_id === 2}
                onChange={onPriorityChange}
              />{" "}
              Medium
            </label>
            <label>
              <input
                type="radio"
                value="High"
                name="priority_id"
                checked={newTask.priority_id === 3}
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
        <div className="text-center" style={{ marginTop: "2rem", gap: "2rem" }}>
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
