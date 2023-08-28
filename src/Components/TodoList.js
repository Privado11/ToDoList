import '../Styles/TodoList.css';

function TodoList({ children} ) {
  return (
    <div>
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