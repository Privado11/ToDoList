import React from 'react';
import { TodoList } from './Components/TodoList';
import { CreateTodoButton } from './Components/CreateTodoButton';
import { TodoItem } from './Components/TodoItem';
import { Header } from './Components/Header';
import { Progress } from './Components/Progress';
import './Styles/App.css'


const defaultTodos = [
  { text: 'Cortar cebolla', completed: true },
  { text: 'Tomar el curso de React.js', completed: false },
  { text: 'Llorar con la Llorona', completed: false },
  { text: 'LALALALALA', completed: false },
]

function App() {
  return (
    <> 
      <div className='containerApp'>
        <Header/>
        <main>
          <div className='containerTask'>
            <TodoList>
              {defaultTodos.map(todo => (
                <TodoItem 
                  key={todo.text} 
                  text={todo.text}
                  completed={todo.completed}
                />
              ))}
            </TodoList>
          </div>
          <aside className='containerProgress'>
            <Progress />
            <CreateTodoButton />
          </aside>
        </main>         
      </div>       
    </>
  );
}


export default App;
