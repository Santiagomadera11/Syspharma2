import { apiClient } from "../../../shared/utils/apiClient";

const ENDPOINT = "Venta";

export const salesService = {
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

  create: async (saleData) => {
    const payload = {
      turnoId: saleData.turnoId,
      usuarioId: saleData.usuarioId,
      clienteNombre: saleData.cliente || saleData.clienteNombre || "Consumidor Final",
      clienteDocumento: saleData.documento || saleData.clienteDocumento || null,
      clienteTelefono: saleData.telefono || saleData.clienteTelefono || null,
      metodoPagoId: saleData.metodoPagoId,
      porcentajeIva: saleData.porcentajeIva || 0,
      notas: saleData.notas || null,
      detalles: (saleData.productos || saleData.detalles || []).map(p => ({
        productoId: p.id || p.productoId,
        cantidad: p.cantidad,
        precioUnitario: p.precio || p.precioUnitario,
        descuento: p.descuento || 0,
      })),
    };
    const res = await apiClient.post(ENDPOINT, payload);
    return res.data;
  },

  update: async (saleData) => {
    const payload = {
      id: saleData.id,
      clienteNombre: saleData.clienteNombre || saleData.cliente,
      clienteDocumento: saleData.clienteDocumento || null,
      clienteTelefono: saleData.clienteTelefono || null,
      metodoPagoId: saleData.metodoPagoId,
      estadoId: saleData.estadoId,
      notas: saleData.notas || null,
    };
    const res = await apiClient.put(ENDPOINT, payload);
    return res.data;
  },

  cambiarEstado: async (id, estadoId) => {
    const res = await apiClient.patch(`${ENDPOINT}/${id}/estado`, estadoId);
    return res.data;
  },

  delete: async (id) => {
    const res = await apiClient.delete(`${ENDPOINT}/${id}`);
    return res.data;
  },

  // ── Helpers de estadísticas ───────────────────────────────────────────────
  getTodaySales: async () => {
    const all = await salesService.getAll();
    const today = new Date().toLocaleDateString("es-CO");
    return all.filter(s => {
      const fecha = s.fechaVenta ? new Date(s.fechaVenta).toLocaleDateString("es-CO") : "";
      return fecha === today;
    });
  },

  getTotalSalesToday: async () => {
    const sales = await salesService.getTodaySales();
    return sales.reduce((sum, s) => sum + (s.total || 0), 0);
  },

  getTotalProductsToday: async () => {
    const sales = await salesService.getTodaySales();
    return sales.reduce((sum, s) =>
      sum + (s.detalles || []).reduce((a, d) => a + d.cantidad, 0), 0);
  },
};