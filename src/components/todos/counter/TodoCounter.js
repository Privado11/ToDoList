import React from 'react';
import '../../../styles/TodoCounter.css';
import { TodoContext } from '../../context/TodoContext';

function TodoCounter() {
  const {
    completedTodos,
    inProgressTodos,  
  } = React.useContext(TodoContext)
  return (
    <div className='TodoCounter'>
      <p>{completedTodos} completed</p>
        <p>{inProgressTodos} in progress</p>
    </div>
    
  )
}

export { TodoCounter };