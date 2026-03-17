import axios from "axios";

const API_URL = "http://localhost:5055/api/Proveedor";

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("syspharma_token")}` },
});

export const providerService = {
  getAll: async () => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  },

  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  },

  create: async (data) => {
    const payload = {
      nombre: data.nombre,
      contacto: data.contacto || null,
      email: data.email || null,
      telefono: data.telefono || null,
      direccion: data.direccion || null,
      tipoDocumento: data.tipoDocumento || null,
      documento: data.documento || null,
    };
    const response = await axios.post(API_URL, payload, getAuthHeaders());
    return response.data;
  },

  update: async (data) => {
    const payload = {
      id: data.id,
      nombre: data.nombre,
      contacto: data.contacto || null,
      email: data.email || null,
      telefono: data.telefono || null,
      direccion: data.direccion || null,
      tipoDocumento: data.tipoDocumento || null,
      documento: data.documento || null,
    };
    const response = await axios.put(API_URL, payload, getAuthHeaders());
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  },

  toggleStatus: async (id, nuevoEstado) => {
    const config = getAuthHeaders();
    config.headers["Content-Type"] = "application/json";
    const response = await axios.patch(`${API_URL}/${id}/estado`, nuevoEstado, config);
    return response.data;
  },
};