import axios from 'axios';

const API_URL = 'http://localhost:5055/api/Auth';

// Permisos en memoria (no storage)
let _permisos = [];

// Helper — usa sessionStorage con fallback a memoria
const storage = {
  set: (key, value) => {
    try { sessionStorage.setItem(key, value); } catch (e) {
      console.warn(`[storage.set] Error guardar ${key}:`, e);
    }
  },
  get: (key) => {
    try { return sessionStorage.getItem(key); } catch (e) {
      console.warn(`[storage.get] Error leer ${key}:`, e);
      return null;
    }
  },
  remove: (key) => {
    try { sessionStorage.removeItem(key); } catch (e) {
      console.warn(`[storage.remove] Error remover ${key}:`, e);
    }
  }
};

export const authService = {
  init: () => {},

  login: async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const data = response.data;
    // Los permisos vienen dentro de data.user, no en data directamente
    _permisos = Array.isArray(data.user?.permisos) ? data.user.permisos : [];
    return data;
  } catch (error) {
    if (error.response?.status === 401)
      return { error: true, message: 'Credenciales incorrectas' };
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
        documento: data.documento || null,
        tipoDocumentoId: data.tipoDocumentoId ? Number(data.tipoDocumentoId) : null,
        telefono: data.telefono || null,
      });
      return { success: true };
    } catch (error) {
      if (error.response?.status === 400)
        return { error: true, message: error.response.data.message };
      return { error: true, message: 'Error al conectar con el servidor' };
    }
  },

  // NUEVO MÉTODO: Envía los datos modificados al controlador Auth de ASP.NET Core
  updateProfile: async (userId, data) => {
    try {
      const token = storage.get('syspharma_token');
      
      // Enviamos el PUT mapeando el ID del usuario en la URL
      const response = await axios.put(`${API_URL}/${userId}`, {
        id: userId,
        nombre: `${data.nombres.trim()} ${data.apellidos.trim()}`.trim(),
        email: data.email.trim().toLowerCase(),
        tipoDocumentoId: data.tipoDocumentoId ? Number(data.tipoDocumentoId) : null,
        documento: data.documento ? data.documento.trim() : null,
        telefono: data.telefono ? data.telefono.trim() : null,
        direccion: data.direccion ? data.direccion.trim() : null
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      return { success: true, data: response.data };
    } catch (error) {
      if (error.response?.status === 400)
        return { error: true, message: error.response.data.message || 'Datos inválidos' };
      return { error: true, message: 'Error al actualizar el perfil en el servidor' };
    }
  },

  // NUEVO MÉTODO: Actualiza el objeto dentro de sessionStorage sin perder propiedades viejas
  updateUserInSession: (updatedFields) => {
    try {
      const userStr = storage.get('syspharma_user');
      if (!userStr) return false;

      const currentUser = JSON.parse(userStr);
      // Mezclamos los campos existentes con los nuevos valores modificados
      const updatedUser = { ...currentUser, ...updatedFields };
      
      storage.set('syspharma_user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Error actualizando usuario en sesión:", error);
      return false;
    }
  },

  logout: () => {
    storage.remove('syspharma_user');
    storage.remove('syspharma_token');
    // Limpiar también localStorage
    localStorage.removeItem('token');
    _permisos = [];
  },

  getCurrentUser: () => {
    try {
      const userStr = storage.get('syspharma_user');
      console.log("Leyendo usuario de sessionStorage:", userStr ? "Encontrado" : "No encontrado");
      console.log("Valor almacenado:", userStr);
      
      if (!userStr || userStr === "undefined" || userStr === "null") {
        console.warn("Usuario vacío o inválido");
        return null;
      }
      
      const user = JSON.parse(userStr);
      console.log("Usuario parseado:", user);
      return user;
    } catch (error) {
      console.error("Error leyendo el usuario de la sesión:", error);
      return null;
    }
  },

  getToken: () => storage.get('syspharma_token'),

  getPermisos: () => _permisos,

  recargarPermisos: async () => {
    const token = storage.get('syspharma_token');
    const userStr = storage.get('syspharma_user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (!token || !user) return [];

    try {
      const res = await axios.get(
        `http://localhost:5055/api/RolMaestro`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const roles = res.data;
      const currentRole = (user.rol || "").toLowerCase().trim();
      const miRol = roles.find(r => (r.nombre || "").toLowerCase().trim() === currentRole);
      _permisos = miRol?.permisos || [];
      storage.set('syspharma_user', JSON.stringify({ ...user, permisos: _permisos }));
      return _permisos;
    } catch {
      return [];
    }
  }
};
