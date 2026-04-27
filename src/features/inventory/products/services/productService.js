import { apiClient } from "../../../../shared/utils/apiClient";

const ENDPOINT = "Producto";

export const productService = {
  getAll: async () => {
    const response = await apiClient.get(ENDPOINT);
    return response.data || [];
  },

  getById: async (id) => {
    const response = await apiClient.get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  create: async (product) => {
    const payload = {
      nombre: product.nombre,
      descripcion: product.descripcion || null,
      categoriaId: product.categoriaId,
      proveedorId: product.proveedorId || null,
      precio: product.precio,
      precioCompra: product.precioCompra || null,
      stock: product.stock || 0,
      codigoBarras: product.codigoBarras || null,
      imagen: product.imagen || null,
    };
    const response = await apiClient.post(ENDPOINT, payload);
    return response.data;
  },

  update: async (product) => {
    const payload = {
      id: product.id,
      nombre: product.nombre,
      descripcion: product.descripcion || null,
      categoriaId: product.categoriaId,
      proveedorId: product.proveedorId || null,
      precio: product.precio,
      precioCompra: product.precioCompra || null,
      stock: product.stock,
      codigoBarras: product.codigoBarras || null,
      imagen: product.imagen || null,
    };
    const response = await apiClient.put(ENDPOINT, payload);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },

  toggleStatus: async (id, estadoActual) => {
    const response = await apiClient.patch(`${ENDPOINT}/${id}/estado`, !estadoActual);
    return response.data;
  },
};