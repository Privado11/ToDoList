import React from "react";
import add from "../../../assets/add.svg";
import "../../../styles/CreateTodoButton.css";
import { useNavigate } from "react-router-dom";

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
