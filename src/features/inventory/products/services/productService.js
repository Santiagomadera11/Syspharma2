import axios from "axios";

const API_URL = "http://localhost:5055/api/Producto";

const getAuthHeaders = () => {
  const token = localStorage.getItem("syspharma_token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const productService = {
  getAll: async () => {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  },

  create: async (product) => {
    const response = await axios.post(API_URL, product, getAuthHeaders());
    return response.data;
  },

  update: async (product) => {
    const response = await axios.put(API_URL, product, getAuthHeaders());
    return response.data;
  },

  delete: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return response.data;
  },

  toggleStatus: async (id, estadoActual) => {
    const config = getAuthHeaders();
    config.headers["Content-Type"] = "application/json";
    const response = await axios.patch(`${API_URL}/${id}/estado`, !estadoActual, config);
    return response.data;
  },
};