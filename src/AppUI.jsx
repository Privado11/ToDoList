import React, { useEffect } from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { HomePage } from "./view/HomePage";
import { NewTodo } from "./view/NewTodo";
import { Toast } from "./components/Toast";
import OAuthSignInPage from "./components/auth/sign-in/OAuthSignInPage";
import { SignUp } from "./components/auth/sign-up/SignUp";
import { PasswordReset } from "./components/auth/PasswordReset";
import { CompleteProfile } from "./components/auth/sign-up/CompleteProfile";
import { useAuth } from "./components/context/AuthContext";
import { ResetPassword } from "./components/auth/ResetPassword";
import { TodoDetail } from "./view/TodoDetail";
import { SharedTaskInvitationView } from "./view/SharedTaskInvitationView.jsx";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>; 
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicRoute = () => {
  const { user } = useAuth();

  return user ? <Navigate to="/" replace /> : <Outlet />;
};


function AppUI() {
  const { user, loading } = useAuth();


  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <>
      <Routes>
        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/add-task" element={<NewTodo />} />
          <Route path="/edit-task/:id" element={<NewTodo />} />
          <Route path="/update-password" element={<ResetPassword />} />
          <Route path="/task-detail/:id" element={<TodoDetail />} />
          <Route
            path="/invitation/:token"
            element={<SharedTaskInvitationView />}
          />
        </Route>

        {/* Rutas públicas */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<OAuthSignInPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/password-reset" element={<PasswordReset />} />
        </Route>

        {/* Redirección para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toast />
    </>
  );
}

export { AppUI };