import '../../../styles/TodoList.css';

function TodoList({ children} ) {
  return (
    <div className='containerTask'>
      <h1>Tasks</h1>
      <ul className='TodoList'>
        <div className='containerList'>
          {children}
        </div>
      </ul>
    </div>
    
  )
}

export { TodoList };