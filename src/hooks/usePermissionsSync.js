import { useEffect, useRef } from "react";
import { rolesService } from "../features/settings/rolesService";

const POLL_INTERVAL = 30_000; // 30 segundos

export const usePermissionsSync = () => {
  const intervalRef = useRef(null);

  useEffect(() => {
    const sync = async () => {
      try {
        const currentUser = JSON.parse(
          sessionStorage.getItem("syspharma_user") || "{}"
        );

        // Solo aplica para empleados (no admin, no cliente)
        if (!currentUser?.rolId || currentUser?.rol === "Administrador") return;

        // Consulta los permisos actuales del rol desde la BD
        const permisosActuales = await rolesService.getPermisos(currentUser.rolId);

        if (!Array.isArray(permisosActuales)) return;

        const permisosGuardados = currentUser.permisos || [];

        // Compara si cambiaron
        const cambiaron =
          permisosActuales.length !== permisosGuardados.length ||
          permisosActuales.some((p) => !permisosGuardados.includes(p));

        if (cambiaron) {
          // Actualiza sessionStorage con los nuevos permisos
          currentUser.permisos = permisosActuales;
          sessionStorage.setItem("syspharma_user", JSON.stringify(currentUser));

          // Notifica a todos los componentes
          window.dispatchEvent(new Event("permissionsUpdated"));
        }
      } catch (error) {
        // Silencioso — no interrumpir al usuario si falla
        console.warn("Error sincronizando permisos:", error);
      }
    };

    // Ejecuta inmediatamente al montar
    sync();

    // Luego cada 30 segundos
    intervalRef.current = setInterval(sync, POLL_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, []);
};
