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
    // Busca el token en localStorage primero, luego en sessionStorage
    const token = localStorage.getItem("token") || sessionStorage.getItem("syspharma_token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token adjuntado al header Authorization");
    } else {
      console.warn("⚠️ No hay token disponible");
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
    // Log detallado del error para debugging
    if (error.response?.data) {
      console.error("API Error Details:", {
        status: error.response.status,
        message: error.response.data.message,
        innerException: error.response.data.innerException,
        detail: error.response.data.detail,
        stackTrace: error.response.data.stackTrace,
        fullData: error.response.data,
      });
    } else {
      console.error("API Error:", error.message);
    }

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
