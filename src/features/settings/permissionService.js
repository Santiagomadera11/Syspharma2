const PERM_MAP_KEY = "syspharma_role_perms";
import { rolesService } from "./rolesService";

export const permissionService = {
  init: () => {
    // ensure storage exists and sync from roles
    const raw = localStorage.getItem(PERM_MAP_KEY);
    if (!raw) {
      localStorage.setItem(PERM_MAP_KEY, JSON.stringify({}));
    }
    permissionService.syncFromRoles();
  },

  getAll: () => {
    try {
      const raw = localStorage.getItem(PERM_MAP_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  saveAll: (map) => {
    localStorage.setItem(PERM_MAP_KEY, JSON.stringify(map || {}));
  },

  syncFromRoles: () => {
    // rebuild the map using current roles array
    const roles = rolesService.getAll();
    const map = {};
    (roles || []).forEach((r) => {
      const perms = {};
      (r.permissions || []).forEach((id) => (perms[id] = true));
      map[r.name] = perms;
    });
    permissionService.saveAll(map);
    return map;
  },

  updateRole: (roleName, permissionsArray) => {
    const map = permissionService.getAll();
    map[roleName] = {};
    (permissionsArray || []).forEach((id) => (map[roleName][id] = true));
    permissionService.saveAll(map);
  },

  removeRole: (roleName) => {
    const map = permissionService.getAll();
    if (map[roleName]) {
      delete map[roleName];
      permissionService.saveAll(map);
    }
  },

  getRolePerms: (roleName) => {
    const map = permissionService.getAll();
    return map[roleName] || {};
  },

  hasPerm: (roleName, permId) => {
    if (!roleName) return false;
    const perms = permissionService.getRolePerms(roleName);
    return !!perms[permId];
  },
};

// ensure init when module is imported
permissionService.init();
