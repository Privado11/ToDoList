import React from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./context/AuthContext";
import {
  CompleteProfilePage,
  DashboardPage,
  NewTaskPage,
  OAuthSignInPage,
  PasswordReset,
  ResetPassword,
  SharedTaskInvitationPage,
  SignUp,
  TaskDetailPage,
} from "./features";
import { Dashboard } from "./view/Dashboard";

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

          <Route path="/" element={<DashboardPage />} />
          <Route path="/h" element={<Dashboard />} />
          <Route path="/add-task" element={<NewTaskPage />} />
          <Route path="/edit-task/:id" element={<NewTaskPage />} />
          <Route path="/update-password" element={<ResetPassword />} />
          <Route path="/task-detail/:id" element={<TaskDetailPage />} />
          <Route
            path="/invitation/:token"
            element={<SharedTaskInvitationPage />}
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
