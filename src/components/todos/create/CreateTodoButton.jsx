import React from "react";
import add from "../../../assets/add.svg";
import { useNavigate } from "react-router-dom";
import "../../../styles/CreateTodoButton.css";

function CreateTodoButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => {
        navigate("/add-task");
      }}
    >
      <img className="addImg" src={add} alt="Icono de añadir tarea." />
      Add new task
    </button>
  );
}

export { CreateTodoButton };
