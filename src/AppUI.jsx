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

const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen">Cargando...</div>
);


export const ProfileVerificationRoute = () => {
  const { user, loading, isProfileComplete } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user && !isProfileComplete()) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};


export const CompleteProfileRoute = () => {
  const { user, loading, isProfileComplete } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  
  if (user && isProfileComplete()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicRoute = () => {
  const { user } = useAuth();

  return user ? <Navigate to="/" replace /> : <Outlet />;
};

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
