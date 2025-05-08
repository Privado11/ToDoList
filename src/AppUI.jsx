import { Route, Routes, Navigate, Outlet} from "react-router-dom";
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
import { CompleteProfileRoute, ProfileVerificationRoute, ProtectedRoute, PublicRoute } from "./routes/RouteGuards";


function AppUI() {
  return (
    <>
      <Routes>
        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          {/* Ruta de complete-profile con protección especial */}
          <Route element={<CompleteProfileRoute />}>
            <Route path="/complete-profile" element={<CompleteProfilePage />} />
          </Route>

          {/* Rutas que requieren perfil completo */}
          <Route element={<ProfileVerificationRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/add-task" element={<NewTaskPage />} />
            <Route path="/edit-task/:id" element={<NewTaskPage />} />
            <Route path="/task-detail/:id" element={<TaskDetailPage />} />
            <Route
              path="/invitation/:token"
              element={<SharedTaskInvitationPage />}
            />
          </Route>

          {/* Estas rutas están protegidas pero no requieren perfil completo */}
          <Route path="/update-password" element={<ResetPassword />} />
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
