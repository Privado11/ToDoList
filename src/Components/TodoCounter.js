import '../styles/TodoCounter.css';

function TodoCounter({ total, completed }) {
  return (
    <p className='TodoCounter'>
        {completed} completed. <br/>
        {total} in progress.
    </p>
  )
}

export { TodoCounter };