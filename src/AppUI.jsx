import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { HomePage } from "./view/HomePage";
import { NewTodo } from "./view/NewTodo";
import { Toast } from "./components/Toast";
import OAuthSignInPage from "./components/auth/sign-in/OAuthSignInPage";
import { useAuth } from "./components/context/AuthContext";
import { SignUp } from "./components/auth/sign-up/SignUp";

function AppUI() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }


  return (
    <>
      <Routes>
        <Route
          path="/"
          element={user ? <HomePage user={user} /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<OAuthSignInPage />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/add-task" element={<NewTodo />} />
        <Route path="/edit-task/:id" element={<NewTodo />} />
      </Routes>
      <Toast />
    </>
  );
}

export { AppUI };
