import React from "react";
import { createPortal } from "react-dom";
import { TodoContext } from "./TodoContext";
import closed from "../assets/close.svg";
import "../styles/Modal.css";

function Modal() {
  const {
    setOpenModal,
    addTodo: addTask,
    todos,
  } = React.useContext(TodoContext);
  const [newTask, setNewTask] = React.useState("");
  const [alert, setAlert] = React.useState(false);

  const onSetTask = () => {
    if (todos.some((todo) => todo.text === newTask)) {
      onSetAlert();
      return;
    }
    addTask(newTask);
    setOpenModal(false);
  };

  const onSetModal = () => {
    setOpenModal(false);
  };

  const onChange = (event) => {
    setNewTask(event.target.value);
  };

  const onSetAlert = () => {
    setAlert(true);
  };

  return createPortal(
    <div className="modal">
      <div className="tittle">
        <img alt="icono cerrar" onClick={onSetModal} src={closed} />
        <h1>Add new task</h1>
      </div>
      <div className="text">
        <input
          placeholder="Write the new task"
          value={newTask}
          onChange={onChange}
        ></input>
        {alert && <p className="alert">Task already exists!</p>}
        <button onClick={onSetTask}>Add</button>
      </div>
    </div>,
    document.getElementById("modal")
  );
}

export { Modal };
