import "../styles/TodoItem.css";
import checkBox from "../assets/checkbox.svg";
import square from "../assets/square.svg";
import deleteTask from "../assets/closeAlt.svg";

function TodoItem(props) {
  return (
    <li className="TodoItem">
      <span
        className={`Icon Icon-check ${props.completed && "Icon-check--active"}`}
        onClick={props.onComplete}
      >
        <img alt="icono completar" src={props.completed ? checkBox : square} />
      </span>
      <p className={`TodoItem-p ${props.completed && "TodoItem-p--complete"}`}>
        {props.text}
      </p>
      <span className="Icon Icon-delete" onClick={props.onDelete}>
        <img alt="icono borrar" src={deleteTask} />
      </span>
    </li>
  );
}

export { TodoItem };
