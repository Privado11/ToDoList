import React from 'react';
import '../styles/TodoCounter.css';
import { TodoContext } from './TodoContext';

function TodoCounter() {
  const {
    completedTodos,
    totalTodos,  
  } = React.useContext(TodoContext)
  return (
    <p className='TodoCounter'>
        {completedTodos} completed. <br/>
        {totalTodos} in progress.
    </p>
  )
}

export { TodoCounter };