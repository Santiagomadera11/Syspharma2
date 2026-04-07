import { apiClient } from "../../../shared/utils/apiClient";

const USER_ENDPOINT = "Usuario";
const ROLES_ENDPOINT = "RolMaestro";

const mapUser = (u) => ({
  ...u,
  rol: u.rolNombre || u.rol || "",
  estado: u.estado,
  tipoDocumentoId: u.tipoDocumentoId || null,
  tipoDocumento: u.tipoDocumento || "",
  avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.nombre || u.id)}`,
});

export const userService = {
  getAll: async () => {
    const res = await apiClient.get(USER_ENDPOINT);
    return res.data.map(mapUser);
  },

  getById: async (id) => {
    const res = await apiClient.get(`${USER_ENDPOINT}/${id}`);
    return mapUser(res.data);
  },

  getRoles: async () => {
    const res = await apiClient.get(ROLES_ENDPOINT);
    return res.data;
  },

  create: async (userData) => {
    const payload = {
      nombre: `${userData.nombres || ""} ${userData.apellidos || ""}`.trim() || userData.nombre,
      email: userData.email,
      tipoDocumentoId: userData.tipoDocumentoId ? Number(userData.tipoDocumentoId) : null,
      documento: userData.documento || null,
      telefono: userData.telefono || null,
      rolId: Number(userData.rolId),
      estado: typeof userData.estado === "boolean" ? userData.estado : true,
      contrasena: userData.password,
    };
    const res = await apiClient.post(USER_ENDPOINT, payload);
    return mapUser(res.data);
  },

  update: async (userData) => {
    const payload = {
      id: userData.id,
      nombre: `${userData.nombres || ""} ${userData.apellidos || ""}`.trim() || userData.nombre,
      email: userData.email,
      tipoDocumentoId: userData.tipoDocumentoId ? Number(userData.tipoDocumentoId) : null,
      documento: userData.documento || null,
      telefono: userData.telefono || null,
      rolId: Number(userData.rolId),
      estado: typeof userData.estado === "boolean" ? userData.estado : true,
    };
    const res = await apiClient.put(USER_ENDPOINT, payload);
    return mapUser(res.data);
  },

  toggleStatus: async (id, estadoActual) => {
    const res = await apiClient.patch(`${USER_ENDPOINT}/${id}/estado`, !estadoActual);
    return res.data;
  },

  delete: async (id) => {
    await apiClient.delete(`${USER_ENDPOINT}/${id}`);
  },
};