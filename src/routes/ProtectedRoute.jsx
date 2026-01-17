import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../features/auth/authService";

const ProtectedRoute = ({ children, requiredRole }) => {
  const user = authService.getCurrentUser();

  if (!user) return <Navigate to="/login" replace />;

  // Si se especifica un rol requerido, verificar que coincida
  if (requiredRole && user.rol !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
