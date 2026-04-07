import { apiClient } from "../../shared/utils/apiClient";
import { PERMISSIONS_CONFIG } from "./rolesConfig";

const ENDPOINT = "RolMaestro";

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

// Color guardado por rol en localStorage solo para UI (no permisos)
const getColorMap = () => {
  try { return JSON.parse(localStorage.getItem("syspharma_role_colors") || "{}"); }
  catch { return {}; }
};

const enrichRole = (r) => {
  const colorMap = getColorMap();
  const colorId = colorMap[r.nombre] || null;
  const colorData = getColorForRole(r.nombre, colorId);
  return {
    ...r,
    name: r.nombre,
    description: r.descripcion,
    active: r.estado,
    color: colorData.hex,
    colorId: colorData.id,
    // Permisos vienen desde el backend en r.permisos
    permissions: Array.isArray(r.permisos) ? r.permisos : [],
  };
};

export const rolesService = {
  getAll: async () => {
    const res = await apiClient.get(ENDPOINT);
    return res.data.map(enrichRole);
  },

  getById: async (id) => {
    const res = await apiClient.get(`${ENDPOINT}/${id}`);
    return enrichRole(res.data);
  },

  create: async (roleData) => {
    const payload = {
      nombre: roleData.name || roleData.nombre,
      descripcion: roleData.description || roleData.descripcion || null,
      permisos: Array.isArray(roleData.permissions) ? roleData.permissions : [],
    };
    const res = await apiClient.post(ENDPOINT, payload);
    const created = enrichRole(res.data);

    // Solo guardar color en localStorage (no permisos)
    const colorMap = getColorMap();
    colorMap[created.nombre] = roleData.colorId || "gray";
    localStorage.setItem("syspharma_role_colors", JSON.stringify(colorMap));

    return created;
  },

  update: async (roleData) => {
    const payload = {
      id: roleData.id,
      nombre: roleData.name || roleData.nombre,
      descripcion: roleData.description || roleData.descripcion || null,
      permisos: Array.isArray(roleData.permissions) ? roleData.permissions : [],
    };
    const res = await apiClient.put(ENDPOINT, payload);
    const updated = enrichRole(res.data);

    // Solo guardar color en localStorage (no permisos)
    const colorMap = getColorMap();
    colorMap[updated.nombre] = roleData.colorId || "gray";
    localStorage.setItem("syspharma_role_colors", JSON.stringify(colorMap));

    return updated;
  },

  remove: async (id) => {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },

  toggleStatus: async (id, estadoActual) => {
    await apiClient.patch(`${ENDPOINT}/${id}/estado`, !estadoActual);
  },

  // Obtener permisos de un rol desde el backend
  getPermisos: async (rolId) => {
    const res = await apiClient.get(`${ENDPOINT}/${rolId}/permisos`);
    return res.data;
  },

  // Asignar permisos a un rol en el backend
  asignarPermisos: async (rolId, permisos) => {
    await apiClient.post(`${ENDPOINT}/${rolId}/permisos`, permisos);
  },

  // Compatibilidad con código anterior
  saveLocalPermissions: () => {},
  getLocalPermissions: () => [],
  saveAll: () => {},
};