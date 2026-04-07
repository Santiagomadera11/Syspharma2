import { apiClient } from "../../../../shared/utils/apiClient";

const ENDPOINT = "Pedido";

const notifyChange = () => {
  window.dispatchEvent(new CustomEvent("syspharma_orders_updated"));
};

export const ordersService = {
  getAll: async () => {
    const res = await apiClient.get(ENDPOINT);
    return res.data;
  },

  getById: async (id) => {
    const res = await apiClient.get(`${ENDPOINT}/${id}`);
    return res.data;
  },

  getEstados: async () => {
    const res = await apiClient.get(`${ENDPOINT}/estados`);
    return res.data;
  },

  create: async (orderData) => {
    const payload = {
      usuarioId: orderData.userId || orderData.usuarioId || null,
      clienteNombre: orderData.cliente || orderData.clienteNombre || "Consumidor Final",
      clienteDocumento: orderData.documento || orderData.clienteDocumento || null,
      clienteTelefono: orderData.telefono || orderData.clienteTelefono || null,
      clienteEmail: orderData.correo || orderData.clienteEmail || null,
      metodoPagoId: orderData.metodoPagoId || null,
      porcentajeIva: orderData.porcentajeIva || 0,
      notas: orderData.notas || null,
      origen: orderData.origin || orderData.origen || "web",
      fechaEntrega: orderData.fechaEntrega || null,
      detalles: (orderData.productos || orderData.detalles || []).map(p => ({
        productoId: p.id || p.productoId || null,
        nombre: p.nombre,
        cantidad: p.cantidad,
        precioUnitario: p.precio || p.precioUnitario,
      })),
    };
    const res = await apiClient.post(ENDPOINT, payload);
    notifyChange();
    return res.data;
  },

  update: async (orderData) => {
    const payload = {
      id: orderData.id,
      clienteNombre: orderData.cliente || orderData.clienteNombre,
      clienteDocumento: orderData.documento || orderData.clienteDocumento || null,
      clienteTelefono: orderData.telefono || orderData.clienteTelefono || null,
      clienteEmail: orderData.correo || orderData.clienteEmail || null,
      metodoPagoId: orderData.metodoPagoId || null,
      estadoId: orderData.estadoId,
      notas: orderData.notas || null,
      fechaEntrega: orderData.fechaEntrega || null,
      detalles: orderData.productos ? orderData.productos.map(p => ({
        productoId: p.id || p.productoId || null,
        nombre: p.nombre,
        cantidad: p.cantidad,
        precioUnitario: p.precio || p.precioUnitario,
      })) : null,
    };
    const res = await apiClient.put(ENDPOINT, payload);
    notifyChange();
    return res.data;
  },

  updateStatus: async (id, estadoId) => {
    const res = await apiClient.patch(`${ENDPOINT}/${id}/estado`, estadoId);
    notifyChange();
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`${ENDPOINT}/${id}`);
    notifyChange();
    return res.data;
  },
};