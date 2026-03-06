import axios from 'axios';

const API_URL = 'http://localhost:5055/api/Auth';

export const authService = {
  init: () => {},

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const data = response.data;
      const user = {
        nombre: data.nombre,
        email: data.email,
        rol: data.rol,
        token: data.token
      };
      localStorage.setItem('syspharma_user', JSON.stringify(user));
      localStorage.setItem('syspharma_token', data.token);
      return user;
    } catch (error) {
      if (error.response?.status === 401) {
        return { error: true, message: 'Credenciales incorrectas' };
      }
      return { error: true, message: 'Error al conectar con el servidor' };
    }
  },

  register: async (data) => {
    try {
      await axios.post(`${API_URL}/register`, {
        nombre: data.nombre,
        email: data.email,
        password: data.password,
        roleId: data.roleId,
        documento: data.documento,
        tipoDocumento: data.tipoDocumento,
        telefono: data.telefono
      });
      return { success: true };
    } catch (error) {
      if (error.response?.status === 400) {
        return { error: true, message: error.response.data.message };
      }
      return { error: true, message: 'Error al conectar con el servidor' };
    }
  },

  logout: () => {
    localStorage.removeItem('syspharma_user');
    localStorage.removeItem('syspharma_token');
  },

  getCurrentUser: () => {
    const u = localStorage.getItem('syspharma_user');
    return u ? JSON.parse(u) : null;
  },

  getToken: () => {
    return localStorage.getItem('syspharma_token');
  }
}