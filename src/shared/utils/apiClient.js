import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5055/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("syspharma_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status !== 409) {
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
    }

    if (error.response?.status === 401) {
      sessionStorage.removeItem("syspharma_token");
      sessionStorage.removeItem("syspharma_user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export const buildUrl = (resource) => `/${resource}`;

export const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem("syspharma_token")}`,
  },
});