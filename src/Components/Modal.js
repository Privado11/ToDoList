import React from 'react'
import { createPortal } from 'react-dom';
import { TodoContext } from './TodoContext';
import closed from '../assets/close.svg';
import '../styles/Modal.css';

function Modal() {
  const {
    setOpenModal,
    addTodo: addTask
  } = React.useContext(TodoContext);
  const [newTask, setNewTask] = React.useState('');

  const onSetTask = (event) => {
    addTask(newTask);
    setOpenModal(false);
  };

  const onSetModal = () => {
    setOpenModal(false);
  };

  const onChange = (event) => {
    setNewTask(event.target.value);
  };



  return createPortal(
    <div className='modal'>
        <div className='tittle'>
            <img 
              onClick = {onSetModal}
              src={closed}/>
            <h1>Add new task</h1>
        </div>
        <div className='text'>
            <input 
              placeholder='Write the new task'
              value={newTask}
              onChange={onChange}
            >
            </input>
            <button onClick = {onSetTask}>Add</button>
        </div>
    </div>,
    document.getElementById('modal')
  );
}

export { Modal };