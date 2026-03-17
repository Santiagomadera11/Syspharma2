import axios from "axios";

const API_URL = "http://localhost:5055/api/Usuario";
const ROLES_URL = "http://localhost:5055/api/RolMaestro";

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("syspharma_token")}` },
});

const mapUser = (u) => ({
  ...u,
  // compatibilidad con frontend que usa 'rol' y 'estado'
  rol: u.rolNombre || u.rol || "",
  estado: u.estado,
  avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.nombre || u.id)}`,
});

export const userService = {
  getAll: async () => {
    const res = await axios.get(API_URL, getAuthHeaders());
    return res.data.map(mapUser);
  },

  getById: async (id) => {
    const res = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return mapUser(res.data);
  },

  // Obtener roles para el select
  getRoles: async () => {
    const res = await axios.get(ROLES_URL, getAuthHeaders());
    return res.data; // [{ id, nombre, ... }]
  },

  create: async (userData) => {
    const payload = {
      nombre: `${userData.nombres || ""} ${userData.apellidos || ""}`.trim() || userData.nombre,
      email: userData.email,
      tipoDocumento: userData.tipoDocumento || null,
      documento: userData.documento || null,
      telefono: userData.telefono || null,
      rolId: Number(userData.rolId),
      estado: typeof userData.estado === "boolean" ? userData.estado : true,
      contrasena: userData.password,
    };
    const res = await axios.post(API_URL, payload, getAuthHeaders());
    return mapUser(res.data);
  },

  update: async (userData) => {
    const payload = {
      id: userData.id,
      nombre: `${userData.nombres || ""} ${userData.apellidos || ""}`.trim() || userData.nombre,
      email: userData.email,
      tipoDocumento: userData.tipoDocumento || null,
      documento: userData.documento || null,
      telefono: userData.telefono || null,
      rolId: Number(userData.rolId),
      estado: typeof userData.estado === "boolean" ? userData.estado : true,
    };
    const res = await axios.put(API_URL, payload, getAuthHeaders());
    return mapUser(res.data);
  },

  toggleStatus: async (id, estadoActual) => {
    const config = getAuthHeaders();
    config.headers["Content-Type"] = "application/json";
    const res = await axios.patch(`${API_URL}/${id}/estado`, !estadoActual, config);
    return res.data;
  },

  delete: async (id) => {
    await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  },
};