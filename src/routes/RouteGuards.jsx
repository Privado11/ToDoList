import { Navigate, Outlet } from "react-router-dom";
import { useAuthLogic } from "@/features";

const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen">Cargando...</div>
);


export const PasswordRecoveryGuard = () => {
  const { passwordRecoveryEmail, loading } = useAuthLogic();

  if (loading) {
    return <LoadingScreen />;
  }

 
  if (passwordRecoveryEmail) {
    return <Navigate to="/update-password" replace />;
  }

  return <Outlet />;
};

export const UpdatePasswordRoute = () => {
  const { user, passwordRecoveryEmail, loading } = useAuthLogic();

  if (loading) {
    return <LoadingScreen />;
  }


  if (!user && !passwordRecoveryEmail) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const ProfileVerificationRoute = () => {
  const { user, loading, isProfileComplete } = useAuthLogic();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user && !isProfileComplete()) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};

export const CompleteProfileRoute = () => {
  const { user, loading, isProfileComplete } = useAuthLogic();

  if (loading) {
    return <LoadingScreen />;
  }

  if (user && isProfileComplete()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const ProtectedRoute = () => {
  const { user, loading, passwordRecoveryEmail } = useAuthLogic();

  if (loading) {
    return <LoadingScreen />;
  }


  if (passwordRecoveryEmail) {
    return <Navigate to="/update-password" replace />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicRoute = () => {
  const { user, loading, passwordRecoveryEmail } = useAuthLogic();

  if (loading) {
    return <LoadingScreen />;
  }


  if (passwordRecoveryEmail) {
    return <Navigate to="/update-password" replace />;
  }

  return user ? <Navigate to="/" replace /> : <Outlet />;
};
