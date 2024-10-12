import React, { useEffect, useState } from 'react';
import { CircularProgressbar } from "react-circular-progressbar";
import { TodoContext } from '../../context/TodoContext';
import "react-circular-progressbar/dist/styles.css";
import '../../../styles/Progress.css';

function Progress({children}) {
  const {
    todos,
    completedTodos,
    inProgressTodos
  } = React.useContext(TodoContext);

  const totalTodos = todos.length;

  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (totalTodos) {
      const per = ((completedTodos * 100) / totalTodos).toFixed(0);
      setPercentage(per);
    } else {
      setPercentage(100);
    }
  }, [percentage, totalTodos, completedTodos, inProgressTodos]);

  return (
    <aside>
      <h1>Progress</h1>
      <div className='containerChildren'>
        {children[0]}
        <div className="progressBar">
          <CircularProgressbar value={percentage} text={`${percentage}%`} />
        </div>
      </div>
      <div className='addTask'>
        {children[1]}
      </div>
    </aside>
  )
}

export {Progress};