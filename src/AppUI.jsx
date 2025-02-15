import React, { useEffect } from "react";
import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { HomePage } from "./view/HomePage";
import { NewTask } from "./view/NewTask";
import { Toast } from "./components/Toast";
import OAuthSignInPage from "./components/auth/sign-in/OAuthSignInPage";
import { SignUp } from "./components/auth/sign-up/SignUp";
import { PasswordReset } from "./components/auth/PasswordReset";
import { CompleteProfile } from "./view/CompleteProfile";
import { useAuth } from "./components/context/AuthContext";
import { ResetPassword } from "./components/auth/ResetPassword";
import { TaskDetail } from "./view/TaskDetail";
import { SharedTaskInvitationView } from "./view/SharedTaskInvitationView.jsx";
import { Dashboard } from "./view/Dashboard";
import { Das } from "./view/Das";

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
          <Route path="/complete-profile" element={<CompleteProfile />} />
          {/* <Route path="/" element={<HomePage user={user} />} /> */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/h" element={<Das />} />
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

      <Toast />
    </>
  );
}

export { AppUI };
