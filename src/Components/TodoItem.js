import '../styles/TodoItem.css';
import checkBox from '../assets/checkbox.svg';
import square from "../assets/square.svg";
import deleteTask from "../assets/closeAlt.svg";

function TodoItem(props) {
    return (
        <li className="TodoItem">
          <spam 
            className={`Icon Icon-check ${props.completed && "Icon-check--active"}`}
            onClick={props.onComplete}
          >
            <img src={props.completed ? checkBox : square}/>
          </spam>
          <p className= {`TodoItem-p ${props.completed && "TodoItem-p--complete"}`}>
            {props.text}
          </p>
          <spam 
            className= "Icon Icon-delete"
            onClick={props.onDelete}
          >
            <img src={ deleteTask }/>
          </spam>
        </li>
    );
  }

export { TodoItem };