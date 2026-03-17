import axios from "axios";
import { PERMISSIONS_CONFIG } from "./rolesConfig";

const API_URL = "http://localhost:5055/api/RolMaestro";
const PERM_LOCAL_KEY = "syspharma_role_perms_local";

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("syspharma_token")}` },
});

const COLOR_OPTIONS = [
  { id: "turquoise", name: "Turquesa", hex: "#4fd1c5" },
  { id: "blue",      name: "Azul",     hex: "#3b82f6" },
  { id: "green",     name: "Verde",    hex: "#10b981" },
  { id: "yellow",    name: "Amarillo", hex: "#f59e0b" },
  { id: "red",       name: "Rojo",     hex: "#ef4444" },
  { id: "purple",    name: "Morado",   hex: "#8b5cf6" },
  { id: "gray",      name: "Gris",     hex: "#6b7280" },
];

const DEFAULT_COLORS = {
  "Administrador": { id: "turquoise", hex: "#4fd1c5" },
  "Empleado":      { id: "blue",      hex: "#3b82f6" },
  "Cliente":       { id: "green",     hex: "#10b981" },
};

const getColorForRole = (nombre, colorId) => {
  if (colorId) {
    const found = COLOR_OPTIONS.find(c => c.id === colorId);
    if (found) return found;
  }
  return DEFAULT_COLORS[nombre] || COLOR_OPTIONS[6];
};

const getLocalPerms = () => {
  try { return JSON.parse(localStorage.getItem(PERM_LOCAL_KEY) || "{}"); }
  catch { return {}; }
};
const saveLocalPerms = (map) => localStorage.setItem(PERM_LOCAL_KEY, JSON.stringify(map));

const enrichRole = (r) => {
  const localPerms = getLocalPerms();
  const colorData = getColorForRole(r.nombre, r.colorId);
  const rawPerms = localPerms[r.nombre];
  return {
    ...r,
    name: r.nombre,
    description: r.descripcion,
    active: r.estado,
    color: colorData.hex,
    colorId: colorData.id,
    permissions: Array.isArray(rawPerms) ? rawPerms : [],
  };
};

export const rolesService = {
  getAll: async () => {
    const res = await axios.get(API_URL, getAuthHeaders());
    return res.data.map(enrichRole);
  },

  getById: async (id) => {
    const res = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return enrichRole(res.data);
  },

  create: async (roleData) => {
    const payload = {
      nombre: roleData.name || roleData.nombre,
      descripcion: roleData.description || roleData.descripcion || null,
    };
    const res = await axios.post(API_URL, payload, getAuthHeaders());
    const created = enrichRole(res.data);

    const localPerms = getLocalPerms();
    localPerms[created.nombre] = Array.isArray(roleData.permissions) ? roleData.permissions : [];
    saveLocalPerms(localPerms);

    const colorMap = JSON.parse(localStorage.getItem("syspharma_role_colors") || "{}");
    colorMap[created.nombre] = roleData.colorId || "gray";
    localStorage.setItem("syspharma_role_colors", JSON.stringify(colorMap));

    return created;
  },

  update: async (roleData) => {
    const payload = {
      id: roleData.id,
      nombre: roleData.name || roleData.nombre,
      descripcion: roleData.description || roleData.descripcion || null,
    };
    const res = await axios.put(API_URL, payload, getAuthHeaders());
    const updated = enrichRole(res.data);

    const localPerms = getLocalPerms();
    localPerms[updated.nombre] = Array.isArray(roleData.permissions) ? roleData.permissions : [];
    saveLocalPerms(localPerms);

    const colorMap = JSON.parse(localStorage.getItem("syspharma_role_colors") || "{}");
    colorMap[updated.nombre] = roleData.colorId || "gray";
    localStorage.setItem("syspharma_role_colors", JSON.stringify(colorMap));

    return updated;
  },

  remove: async (id) => {
    await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  },

  toggleStatus: async (id, estadoActual) => {
    const config = getAuthHeaders();
    config.headers["Content-Type"] = "application/json";
    await axios.patch(`${API_URL}/${id}/estado`, !estadoActual, config);
  },

  saveLocalPermissions: (roleName, permissions) => {
    const localPerms = getLocalPerms();
    localPerms[roleName] = Array.isArray(permissions) ? permissions : [];
    saveLocalPerms(localPerms);
  },

  getLocalPermissions: (roleName) => {
    const perms = getLocalPerms()[roleName];
    return Array.isArray(perms) ? perms : [];
  },

  saveAll: () => {},
};