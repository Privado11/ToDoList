import '../../../styles/TodoList.css';
import { TodoItem } from '../item/TodoItem';

function TodoList({ todos, onComplete, onEdit, onDelete } ) {
  return (
    <div className='containerTask'>
      <h1>Tasks</h1>
      <ul className='TodoList'>
        <div className='containerList'>
        {todos.map(todo => (
        <TodoItem
          key={todo.id}
          todo={{
            ...todo,
            onComplete: () => onComplete(todo.id), 
            onEdit: () => onEdit(todo.id),
            onDelete: () => onDelete(todo.id),
          }}
        />
      ))}
        </div>
      </ul>
    </div>
    
  )
}

export { TodoList };