import React from 'react'
import { TodoList } from './components/TodoList';
import { CreateTodoButton } from './components/CreateTodoButton';
import { TodoItem } from './components/TodoItem';
import { Header } from './components/Header';
import { Progress } from './components/Progress';
import { TodoCounter } from './components/TodoCounter';
import { TodosLoading } from './components/TodosLoading';
import { TodosError } from './components/TodosError';
import { EmptyTodos } from './components/EmptyTodos';
import { TodoContext } from './components/TodoContext';
import './styles/App.css'


function AppUI() {
  const {
      todos,
      completeTodo,
      deleteTodo,
      loading,
      error,
      setOpenModal
  } = React.useContext(TodoContext);

    return (
        <> 
          <div className='containerApp'>
            <Header/>
            <main>
              <TodoList>
                {loading && <TodosLoading/>}
                {error && <TodosError/>}
                {(!loading && todos.length === 0) && <EmptyTodos/>}
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
              <Progress
                setOpenModal = {setOpenModal}
              >
                <TodoCounter />
                <CreateTodoButton 
                  setOpenModal = {setOpenModal}
                />
              </Progress>
            </main>         
          </div>       
        </>
      );
}

export { AppUI };