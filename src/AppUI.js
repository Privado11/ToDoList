import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HomePage } from "./view/HomePage";
import { NewTodo } from "./view/NewTodo";
import { Toast } from "./components/Toast";
import OAuthSignInPage from "./components/auth/OAuthSignInPage";
import { useAuth } from "./components/context/AuthContext";

function AppUI() {
  const { user, loading } = useAuth();

   if (loading) {
     return <div>Cargando...</div>; 
   }

  return (
    <>
      <BrowserRouter basename="/ToDoList">
        <Routes>
          <Route
            path="/"
            element={user ? <HomePage user={user} /> : <OAuthSignInPage />}
          />
          <Route path="/login" element={<OAuthSignInPage />} />

          <Route path="/add-task" element={<NewTodo />} />
          <Route path="/edit-task/:id" element={<NewTodo />} />
        </Routes>
        <Toast />
      </BrowserRouter>
    </>
  );
}

export { AppUI };
