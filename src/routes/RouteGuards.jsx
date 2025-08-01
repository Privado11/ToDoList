import { Navigate, Outlet } from "react-router-dom";
import { useAuthLogic, useProfile } from "@/features";

const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen">Loading...</div>
);

export const PasswordRecoveryGuard = () => {
  const { passwordRecoveryEmail } = useAuthLogic();
  const { isLoading } = useProfile();
  const loadingComplete = isLoading || loading;

  if (loadingComplete) {
    return <LoadingScreen />;
  }

  if (passwordRecoveryEmail) {
    return <Navigate to="/update-password" replace />;
  }

  return <Outlet />;
};

export const UpdatePasswordRoute = () => {
  const { user, passwordRecoveryEmail, loading } = useAuthLogic();
  const { isLoading } = useProfile();
  const loadingComplete = isLoading || loading;

  if (loadingComplete) {
    return <LoadingScreen />;
  }

  if (!user && !passwordRecoveryEmail) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export const ProfileVerificationRoute = () => {
  const { user, loading } = useAuthLogic();
  const { isProfileComplete, isLoading } = useProfile();
  const loadingComplete = isLoading || loading;

  if (loadingComplete) {
    return <LoadingScreen />;
  }

  if (user && !isProfileComplete()) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
};

export const CompleteProfileRoute = () => {
  const { user, loading,  } = useAuthLogic();
  const { isLoading, isProfileComplete } = useProfile();
  const loadingComplete = isLoading || loading;

  if (loadingComplete) {
    return <LoadingScreen />;
  }
  if (user && isProfileComplete()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export const ProtectedRoute = () => {
  const { user, loading, passwordRecoveryEmail } = useAuthLogic();
  const { isLoading } = useProfile();
  const loadingComplete = isLoading || loading;

  if (loadingComplete) {
    return <LoadingScreen />;
  }
  if (passwordRecoveryEmail) {
    return <Navigate to="/update-password" replace />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicRoute = () => {
  const { user, loading, passwordRecoveryEmail } = useAuthLogic();
  const { isLoading } = useProfile();
  const loadingComplete = isLoading || loading;

  if (loadingComplete) {
    return <LoadingScreen />;
  }
  if (passwordRecoveryEmail) {
    return <Navigate to="/update-password" replace />;
  }

  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
