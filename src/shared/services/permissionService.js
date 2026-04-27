export const permissionService = {
  // Verifica si el usuario logueado tiene un permiso específico
  hasPermission: (permissionCode) => {
    const userStr = sessionStorage.getItem("syspharma_user");
    if (!userStr || userStr === "undefined") return false;

    const user = JSON.parse(userStr);
    // REGLA DE ORO: El Administrador siempre tiene permiso para todo
    if (user.rol === "Administrador") return true;
    // Para los demás, buscamos el código en su lista de permisos
    const permisos = user.permisos || [];
    return permisos.includes(permissionCode);
  }
};
