import add from "../assets/add.svg";
import '../Styles/CreateTodoButton.css';

function CreateTodoButton() {
  return (
    <button>
      <img className="addImg" src={ add }/>
      Create new task
      </button>
  )
}

export { CreateTodoButton };