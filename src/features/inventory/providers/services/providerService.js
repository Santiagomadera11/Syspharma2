import axios from "axios";

const API_URL = "http://localhost:5055/api/Proveedor";

const getAuthHeaders = () => {
  const token = localStorage.getItem("syspharma_token");
  return { Authorization: `Bearer ${token}` };
};

export const providerService = {
  getAll: async () => {
    const res = await axios.get(API_URL, { headers: getAuthHeaders() });
    return res.data;
  },
  create: async (item) => {
    const { id, ...payload } = item; // excluir id para POST
    const res = await axios.post(API_URL, payload, { headers: getAuthHeaders() });
    return res.data;
  },
  update: async (item) => {
    const res = await axios.put(API_URL, item, { headers: getAuthHeaders() });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
    return res.data;
  },
  toggleStatus: async (id, estado) => {
    const res = await axios.patch(`${API_URL}/${id}/estado`, estado, {
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    });
    return res.data;
  },
};