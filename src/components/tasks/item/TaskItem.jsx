import React from "react";
import { useState } from "react";
import checkBox from "../../../assets/checkbox.svg";
import square from "../../../assets/square.svg";
import deleteTask from "../../../assets/closeAlt.svg";
import editTask from "../../../assets/edit.svg";
import { Alert } from "../../Alert";
import "../../../styles/TaskItem.css";
import { useNavigate } from "react-router-dom";

function TaskItem({ task }) {
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const formattedDate = new Date(task.creation_date).toLocaleDateString(
    "en-EN",
    options
  );
  const [openAlert, setOpenAlert] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = () => {
   navigate(`/task-detail/${task.id}`);
  };


  const handleDeleteClick = () => {
    setOpenAlert(true);
  };

  const handleConfirmDelete = () => {
    task.onDelete();
    setOpenAlert(false);
  };

  const handleCancelDelete = () => {
    setOpenAlert(false);
  };

  return (
    <>
      <li className="TaskItem">
        <span
          className={`Icon Icon-check ${
            task.completed && "Icon-check--active"
          }`}
          onClick={task.onComplete}
        >
          <img alt="icono completar" src={task.completed ? checkBox : square} />
        </span>

        <div className="TaskItem-content" onClick={handleOpenModal}>
          <p
            className={`TaskItem-title ${
              task.completed && "TaskItem-p--complete"
            }`}
          >
            {task.title}
          </p>
          <p className="TaskItem-description">
            {task.description ? task.description : "No description"}
          </p>
          <p className="TaskItem-date">{formattedDate}</p>
        </div>

        <span className="Icon Icon-edit" onClick={task.onEdit}>
          <img alt="icono editar" src={editTask} />
        </span>

        <span className="Icon Icon-delete" onClick={handleDeleteClick}>
          <img alt="icono borrar" src={deleteTask} />
        </span>
      </li>

      <Alert
        isOpen={openAlert}
        handleCancelDelete={handleCancelDelete}
        handleConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}

export { TaskItem };
