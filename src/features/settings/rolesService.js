const ROLES_KEY = "syspharma_roles";
import { PERMISSIONS_CONFIG } from "./rolesConfig";
import { permissionService } from "./permissionService";

export const rolesService = {
  init: () => {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem(ROLES_KEY) || "[]");
    } catch {
      list = [];
    }
    const allPerms = PERMISSIONS_CONFIG.map((p) => p.id);
    const employeePerms = PERMISSIONS_CONFIG.filter((p) =>
      [
        "inven.view",
        "inven.create",
        "inven.edit",
        "inven.delete",
        "billing.view",
        "services.view",
      ].includes(p.id),
    ).map((p) => p.id);

    const ensureRole = (name, color, colorId, desc, perms) => {
      const existing = list.find((r) => r.name === name);
      if (!existing) {
        list.push({
          id: Date.now() + Math.random(),
          name,
          color,
          colorId,
          description: desc,
          permissions: perms,
          active: true,
        });
      } else {
        // if role already exists, make sure it has at least the baseline permissions
        const combined = Array.from(new Set([...(existing.permissions || []), ...perms]));
        if (combined.length !== (existing.permissions || []).length) {
          existing.permissions = combined;
        }
      }
    };

    ensureRole(
      "Administrador",
      "#4fd1c5",
      "turquoise",
      "Administrador con todos los permisos",
      allPerms,
    );
    ensureRole(
      "Empleado",
      "#3b82f6",
      "blue",
      "Empleado con permisos básicos de operación",
      employeePerms,
    );
    ensureRole(
      "Cliente",
      "#10b981",
      "green",
      "Cliente del sistema, sin acceso administrativo",
      [],
    );

    localStorage.setItem(ROLES_KEY, JSON.stringify(list));

    // after ensuring roles exist, synchronize permissions map
    permissionService.syncFromRoles();
  },

  getAll: () => {
    try {
      const raw = localStorage.getItem(ROLES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveAll: (roles) => {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles || []));
    // keep permission map in sync whenever we write roles
    permissionService.syncFromRoles();
  },

  create: (role) => {
    const list = rolesService.getAll();
    const payload = { id: Date.now(), ...role };
    const next = [payload, ...list];
    rolesService.saveAll(next);
    return next;
  },

  update: (role) => {
    const list = rolesService.getAll();
    const next = list.map((r) => (r.id === role.id ? { ...r, ...role } : r));
    rolesService.saveAll(next);
    return next;
  },

  remove: (id) => {
    const list = rolesService.getAll();
    const roleToRemove = list.find((r) => r.id === id);
    const next = list.filter((r) => r.id !== id);
    rolesService.saveAll(next);
    if (roleToRemove) {
      permissionService.removeRole(roleToRemove.name);
    }
    return next;
  },
};
