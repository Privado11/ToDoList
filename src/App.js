import React from 'react';
import { AppUI } from './AppUI';
import { useLocalStorage  } from './components/useLocalStorage';


function App() {  
  const [todos, saveTodos] = useLocalStorage('TASKLIST_V1', []);

  const completedTodos = todos.filter(todo => !!todo.completed).length;
 const totalTodos = todos.length - completedTodos;

  const completeTodo = (text) => {
    const todoIndex = todos.findIndex((todo) => todo.text === text);
    const newTodos = [...todos];
    newTodos[todoIndex].completed =!newTodos[todoIndex].completed;
    saveTodos(newTodos);
  };

  const deleteTodo = (text) => {
    const newTodos = todos.filter((todo) => todo.text != text);
    saveTodos(newTodos);
  };

  return (
    <AppUI
      completedTodos = {completedTodos}
      totalTodos = {totalTodos}
      todos = {todos}
      completeTodo = {completeTodo}
      deleteTodo = {deleteTodo}
    />
  );
}


export default App;
