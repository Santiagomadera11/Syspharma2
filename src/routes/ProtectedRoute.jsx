import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../features/auth/authService";

const ProtectedRoute = ({ children }) => {
  const user = authService.getCurrentUser();
  if (!user) return <Navigate to="/login" replace />;
  // If children are provided, render them; otherwise render nested routes via Outlet
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
