import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import {
  CompleteProfilePage,
  DashboardPage,
  NewTaskPage,
  OAuthSignInPage,
  PasswordReset,
  ProfilePage,
  ResetPassword,
  SettingsPage,
  SharedTaskInvitationPage,
  SignUp,
  TaskDetailPage,
} from "./features";
import {
  CompleteProfileRoute,
  ProfileVerificationRoute,
  ProtectedRoute,
  PublicRoute,
  UpdatePasswordRoute,
} from "./routes/RouteGuards";
import { MainLayout, SimpleLayout } from "./components/layout/Layouts";

function AppUI() {
  return (
    <>
      <Routes>
        <Route element={<UpdatePasswordRoute />}>
          <Route path="/update-password" element={<ResetPassword />} />
        </Route>

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          {/* Ruta de complete-profile con protección especial */}
          <Route element={<CompleteProfileRoute />}>
            <Route path="/complete-profile" element={<CompleteProfilePage />} />
          </Route>

          {/* Rutas que requieren perfil completo */}
          <Route element={<ProfileVerificationRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>

            <Route element={<SimpleLayout />}>
              <Route path="/add-task" element={<NewTaskPage />} />
              <Route path="/edit-task/:id" element={<NewTaskPage />} />
              <Route path="/task-detail/:id" element={<TaskDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/:username" element={<ProfilePage />} />

              <Route
                path="/invitation/:token"
                element={<SharedTaskInvitationPage />}
              />
            </Route>
          </Route>
        </Route>

        {/* Rutas públicas */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<OAuthSignInPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/password-reset" element={<PasswordReset />} />
        </Route>

        {/* Redirección para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toaster />
    </>
  );
}

export { AppUI };
