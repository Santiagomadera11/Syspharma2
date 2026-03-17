// inventory/services/categoryService.js
import axios from 'axios';

const API_URL = 'http://localhost:5055/api/Categoria';

// Helper para obtener los headers con el token
const getAuthHeaders = () => {
  const token = localStorage.getItem('syspharma_token');
  return { 
    headers: { 
      Authorization: `Bearer ${token}` 
    } 
  };
};

const getAll = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

const create = async (categoryData) => {
  const response = await axios.post(API_URL, categoryData, getAuthHeaders());
  return response.data;
};

const update = async (id, categoryData) => {
  const response = await axios.put(API_URL, { id, ...categoryData }, getAuthHeaders());
  return response.data;
};

const toggleStatus = async (id, newStatus) => {
  const config = getAuthHeaders();
  config.headers['Content-Type'] = 'application/json';
  
  const response = await axios.patch(`${API_URL}/${id}/estado`, newStatus, config);
  return response.data;
};

const remove = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

// Exportamos todas las funciones como un objeto
export const categoryService = {
  getAll,
  create,
  update,
  toggleStatus,
  remove
};