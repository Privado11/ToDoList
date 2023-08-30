import add from "../assets/add.svg";
import '../styles/CreateTodoButton.css';

function CreateTodoButton({ setOpenModal }) {
  return (
    <button 
    onClick = {
      () => {
        setOpenModal(state => !state)
      }
    }>
      <img className="addImg" src={ add }/>
        Add new task
      </button>
  )
}

export { CreateTodoButton };