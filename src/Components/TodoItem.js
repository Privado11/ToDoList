import '../Styles/TodoItem.css';
import square from "../assets/square.svg";
import deleteTask from "../assets/closeAlt.svg";

function TodoItem(props) {
    return (
        <li className="TodoItem">
          <spam className={`Icon Icon-check ${props.completed && "Icon-check--active"}`}>
            <img src={square}/>
          </spam>
          <p className= {`TodoItem-p ${props.completed && "TodoItem-p--complete"}`}>
            {props.text}
          </p>
          <spam className= "Icon Icon-delete">
            <img src={ deleteTask }/>
          </spam>
        </li>
    );
  }

export { TodoItem };