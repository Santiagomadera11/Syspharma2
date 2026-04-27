import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../features/auth/authService";

const ROLES_FIJOS = ["administrador", "empleado", "cliente"];
const PERMS_ADMIN = ["users.view", "users.create", "users.edit", "users.delete", "system.view", "reports.view"];
const PERMS_EMPLOYEE = ["sales.view", "sales.create", "sales.orders", "inven.view", "inven.create", "services.view", "services.manage"];

const ProtectedRoute = ({ children, requiredRole, requiredPerm }) => {
  const user = authService.getCurrentUser();

  if (!user) {
    console.warn("⛔ [ProtectedRoute] No hay sesión activa.");
    return <Navigate to="/login" replace />;
  }

  const userRole = user.rol?.toLowerCase().trim();
  const userPerms = user.permisos || [];
  const esRolDinamico = !ROLES_FIJOS.includes(userRole);
  const tienePermisosAdmin    = userPerms.some(p => PERMS_ADMIN.includes(p));
  const tienePermisosEmpleado = userPerms.some(p => PERMS_EMPLOYEE.includes(p));

  // Administrador tiene acceso total siempre
  if (userRole === "administrador") {
    return children ? children : <Outlet />;
  }

  // Verificar rol requerido
  if (requiredRole) {
    const req = requiredRole.toLowerCase().trim();

    if (esRolDinamico) {
      // Rol dinámico con permisos admin puede entrar al panel admin
      if (req === "administrador" && tienePermisosAdmin) {
        // permitir
      }
      // Rol dinámico con permisos empleado puede entrar al panel empleado
      else if (req === "empleado" && tienePermisosEmpleado) {
        // permitir
      }
      else if (req === "administrador" && !tienePermisosAdmin) {
        return <Navigate to="/" replace />;
      }
      else if (req === "empleado" && !tienePermisosEmpleado) {
        return <Navigate to="/" replace />;
      }
    } else if (userRole !== req) {
      console.warn(`⛔ Rol insuficiente. Requerido: ${req}, Actual: ${userRole}`);
      return <Navigate to="/" replace />;
    }
  }

  // Verificar permiso requerido
  if (requiredPerm) {
    const hasPermission = userPerms.includes(requiredPerm);

    if (!hasPermission) {
      if (esRolDinamico && userPerms.length === 0) {
        // Backend aún sin permisos — acceso temporal
        console.warn("⚠️ Rol dinámico sin permisos del backend — acceso temporal.");
      } else {
        console.error(`⛔ Permiso faltante: ${requiredPerm}`);
        alert(`Acceso denegado: No tienes el permiso [${requiredPerm}]`);
        const defaultPath = tienePermisosAdmin ? "/admin/dashboard" : "/employee/inicio";
        return <Navigate to={defaultPath} replace />;
      }
    }
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;