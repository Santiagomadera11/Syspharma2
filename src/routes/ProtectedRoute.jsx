import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../features/auth/authService";
import { permissionService } from "../features/settings/permissionService";

const ProtectedRoute = ({ children, requiredRole, requiredPerm }) => {
  const user = authService.getCurrentUser();

  if (!user) return <Navigate to="/login" replace />;

  // Permitir acceso total al rol Administrador
  if (user.rol === "Administrador") {
    return children ? children : <Outlet />;
  }

  // Si se especifica un rol requerido, verificar que coincida
  if (requiredRole && user.rol !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  // Si se solicita un permiso específico, verificarlo
  if (requiredPerm) {
    const has = permissionService.hasPerm(user.rol, requiredPerm);
    if (!has) {
      alert("Acceso denegado: no tienes permiso para ver esta sección.");
      // redirige al dashboard adecuado según el rol
      const defaultPath =
        {
          Administrador: "/admin/dashboard",
          Empleado: "/employee/inicio",
          Cliente: "/client/inicio",
        }[user.rol] || "/";
      return <Navigate to={defaultPath} replace />;
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
