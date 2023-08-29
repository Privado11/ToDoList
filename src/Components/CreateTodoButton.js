import add from "../assets/add.svg";
import '../styles/CreateTodoButton.css';

function CreateTodoButton() {
  return (
    <button>
      <img className="addImg" src={ add }/>
        Add new task
      </button>
  )
}

export { CreateTodoButton };