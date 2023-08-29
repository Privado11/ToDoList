import React from 'react'
import { useLocalStorage } from './useLocalStorage';

const TodoContext = React.createContext();

function TodoProvider({children}){
    const {
        item: todos, 
        saveItem: saveTodos,
        loading,
        error,
      } = useLocalStorage('TASKLIST_V1', []);

      const [openModal, setOpenModal] = React.useState(true);
    
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

    return(
        <TodoContext.Provider value={{
            completedTodos,
            totalTodos,
            todos,
            completeTodo,
            deleteTodo,
            loading,
            error,
            openModal,
            setOpenModal
        }}>
            {children}
        </TodoContext.Provider>
    )
}


export { TodoContext, TodoProvider };