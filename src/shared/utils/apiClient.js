import axios from "axios";

// Crear instancia de axios con configuración base
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5055/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("syspharma_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si es error de autenticación, limpiar sesión
    if (error.response?.status === 401) {
      sessionStorage.removeItem("syspharma_token");
      sessionStorage.removeItem("syspharma_user");
      // Redireccionar a login si es necesario
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Helper para construir URLs de recursos
export const buildUrl = (resource) => `/${resource}`;

// Helper para obtener headers (legacy, usar apiClient directamente)
export const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem("syspharma_token")}`,
  },
});
