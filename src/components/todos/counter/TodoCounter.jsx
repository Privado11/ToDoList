import React from 'react';
import { useTodo } from '../../context/TodoContext';
import "../../../styles/TodoCounter.css";

function TodoCounter() {
  const {
    completedTodos,
    inProgressTodos,  
  } = useTodo();
  return (
    <div className='TodoCounter'>
      <p>{completedTodos} completed</p>
        <p>{inProgressTodos} in progress</p>
    </div>
    
  )
}

export { TodoCounter };