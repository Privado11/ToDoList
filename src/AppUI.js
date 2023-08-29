import React from 'react'
import { TodoList } from './components/TodoList';
import { CreateTodoButton } from './components/CreateTodoButton';
import { TodoItem } from './components/TodoItem';
import { Header } from './components/Header';
import { Progress } from './components/Progress';
import './styles/App.css'
import { TodoCounter } from './components/TodoCounter';
import { TodosLoading } from './components/TodosLoading';
import { TodosError } from './components/TodosError';
import { EmptyTodos } from './components/EmptyTodos';
import { Modal } from './components/Modal';
import { TodoContext } from './components/TodoContext';


function AppUI() {
  const {
      todos,
      completeTodo,
      deleteTodo,
      loading,
      error,
      openModal,
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
              <Progress>
                <TodoCounter />
                <CreateTodoButton />
              </Progress>
              {openModal && (
                <Modal>
                  Agregar ToDos
                </Modal>
              )}
            </main>         
          </div>       
        </>
      );
}

export { AppUI };