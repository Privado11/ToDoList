import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAuthLogic } from "@/features";

const LoadingScreen = () => (
  <div className="flex justify-center items-center h-screen">Cargando...</div>
);

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
  const { user, loading } = useAuthLogic();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const PublicRoute = () => {
  const { user, loading } = useAuthLogic();

  if (loading) {
    return <LoadingScreen />;
  }

  return user ? <Navigate to="/" replace /> : <Outlet />;
};
