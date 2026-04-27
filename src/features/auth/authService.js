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

      // Guardar permisos en memoria incluso si el usuario se procesa en el login page
      _permisos = Array.isArray(data.permisos) ? data.permisos : [];

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
      console.log("📖 Leyendo usuario de sessionStorage:", userStr ? "✅ Encontrado" : "❌ No encontrado");
      console.log("📊 Valor almacenado:", userStr);
      
      if (!userStr || userStr === "undefined" || userStr === "null") {
        console.warn("⚠️ Usuario vacío o inválido");
        return null;
      }
      
      const user = JSON.parse(userStr);
      console.log("✅ Usuario parseado:", user);
      return user;
    } catch (error) {
      console.error("❌ Error leyendo el usuario de la sesión:", error);
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
      const miRol = roles.find(r => r.nombre === user.rol);
      _permisos = miRol?.permisos || [];
      return _permisos;
    } catch {
      return [];
    }
  }
};