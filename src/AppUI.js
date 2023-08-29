import React from 'react'
import { TodoList } from './components/TodoList';
import { CreateTodoButton } from './components/CreateTodoButton';
import { TodoItem } from './components/TodoItem';
import { Header } from './components/Header';
import { Progress } from './components/Progress';
import './styles/App.css'
import { TodoCounter } from './components/TodoCounter';

function AppUI({
    completedTodos,
    totalTodos,
    todos,
    completeTodo,
    deleteTodo
}) {
    return (
        <> 
          <div className='containerApp'>
            <Header/>
            <main>
              <TodoList>
                {todos.map(todo => (
                  <TodoItem 
                    key={todo.text} 
                    text={todo.text}
                    completed={todo.completed}
                    onComplete={() => completeTodo(todo.text)}
                    onDelete={() => deleteTodo(todo.text)}
                  />
                ))}
                
              </TodoList>
              <Progress>
                <TodoCounter
                  completed={completedTodos}
                  total={totalTodos}
                />
                <CreateTodoButton />
              </Progress>
            </main>         
          </div>       
        </>
      );
}

export { AppUI };