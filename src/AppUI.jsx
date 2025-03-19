import React from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { NewTask } from "./view/NewTask";
import { TaskDetail } from "./view/TaskDetail";
import { SharedTaskInvitationView } from "./view/SharedTaskInvitationView.jsx";

import { Das } from "./view/Das";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./context/AuthContext";
import { CompleteProfilePage, OAuthSignInPage, PasswordReset, ResetPassword, SignUp } from "./features";


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
          <Route path="/complete-profile" element={<CompleteProfilePage />} />

          <Route path="/" element={<Das />} />
          <Route path="/add-task" element={<NewTask />} />
          <Route path="/edit-task/:id" element={<NewTask />} />
          <Route path="/update-password" element={<ResetPassword />} />
          <Route path="/task-detail/:id" element={<TaskDetail />} />
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

      <Toaster />
    </>
  );
}

export { AppUI };
