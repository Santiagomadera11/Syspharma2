import axios from "axios";

const API_URL = "http://localhost:5055/api/Permiso";
const PERM_MAP_KEY = "syspharma_role_perms_local";

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("syspharma_token")}` },
});

// ─── Permisos del backend (catálogo) ─────────────────────────────────────────
export const permissionService = {
  // Obtener catálogo de permisos desde el backend
  getCatalog: async () => {
    const res = await axios.get(API_URL, getAuthHeaders());
    return res.data;
  },

  createPermiso: async (data) => {
    const res = await axios.post(API_URL, data, getAuthHeaders());
    return res.data;
  },

  updatePermiso: async (data) => {
    const res = await axios.put(API_URL, data, getAuthHeaders());
    return res.data;
  },

  // ─── Mapa local de permisos por rol (frontend) ─────────────────────────────
  getAll: () => {
    try { return JSON.parse(localStorage.getItem(PERM_MAP_KEY) || "{}"); }
    catch { return {}; }
  },

  saveAll: (map) => {
    localStorage.setItem(PERM_MAP_KEY, JSON.stringify(map || {}));
  },

  syncFromRoles: () => {
    // No-op: ahora la sincronización la maneja rolesService
  },

  updateRole: (roleName, permissionsArray) => {
    const map = permissionService.getAll();
    map[roleName] = {};
    (permissionsArray || []).forEach((id) => (map[roleName][id] = true));
    permissionService.saveAll(map);
  },

  removeRole: (roleName) => {
    const map = permissionService.getAll();
    delete map[roleName];
    permissionService.saveAll(map);
  },

  getRolePerms: (roleName) => {
    const map = permissionService.getAll();
    return map[roleName] || {};
  },

  hasPerm: (roleName, permId) => {
    if (!roleName) return false;
    if (roleName === "Administrador") return true;
    const perms = permissionService.getRolePerms(roleName);
    return !!perms[permId];
  },

  init: () => {
    // No-op: ya no usamos localStorage para inicializar roles
  },
};

permissionService.init();