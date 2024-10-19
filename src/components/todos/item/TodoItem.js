import { useEffect, useState } from "react";
import checkBox from "../../../assets/checkbox.svg";
import square from "../../../assets/square.svg";
import deleteTask from "../../../assets/closeAlt.svg";
import editTask from "../../../assets/edit.svg";
import { TodoDetailModal } from "../detail/TodoDetailModal";
import { Alert } from "../../Alert";
import "../../../styles/TodoItem.css";

function TodoItem({ todo }) {
  
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formattedDate = new Date(todo.creation_date).toLocaleDateString(
    "en-EN",
    options
  );
  const [openModal, setOpenModal] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleDeleteClick = () => {
    setOpenAlert(true);
  };

  const handleConfirmDelete = () => {
    todo.onDelete();
    setOpenAlert(false);
  };

  const handleCancelDelete = () => {
    setOpenAlert(false);
  };

  return (
    <>
      <li className="TodoItem">
        <span
          className={`Icon Icon-check ${
            todo.completed && "Icon-check--active"
          }`}
          onClick={todo.onComplete}
        >
          <img alt="icono completar" src={todo.completed ? checkBox : square} />
        </span>

        <div className="TodoItem-content" onClick={handleOpenModal}>
          <p
            className={`TodoItem-title ${
              todo.completed && "TodoItem-p--complete"
            }`}
          >
            {todo.title}
          </p>
          <p className="TodoItem-description">
            {todo.description ? todo.description : "No description"}
          </p>
          <p className="TodoItem-date">{formattedDate}</p>
        </div>

        <span className="Icon Icon-edit" onClick={todo.onEdit}>
          <img alt="icono editar" src={editTask} />
        </span>

        <span className="Icon Icon-delete" onClick={handleDeleteClick}>
          <img alt="icono borrar" src={deleteTask} />
        </span>
      </li>

      <TodoDetailModal
        isOpen={openModal}
        onRequestClose={handleCloseModal}
        todo={todo}
      />

      <Alert
        isOpen={openAlert}
        handleCancelDelete={handleCancelDelete}
        handleConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}

export { TodoItem };
