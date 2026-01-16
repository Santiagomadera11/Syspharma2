const DB_KEY = "syspharma_sales";

export const salesService = {
  getAll: () => {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      localStorage.setItem(DB_KEY, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      localStorage.setItem(DB_KEY, JSON.stringify([]));
      return [];
    }
  },

  create: (saleData) => {
    const sales = salesService.getAll();
    const id = Date.now();
    const newSale = {
      id,
      hora: new Date().toLocaleTimeString("es-CO"),
      fecha: new Date().toLocaleDateString("es-CO"),
      cliente: saleData.cliente || "Cliente",
      productos: saleData.productos || [], // array de {nombre, cantidad, precio}
      cantidadProductos: (saleData.productos || []).reduce(
        (sum, p) => sum + (p.cantidad || 0),
        0
      ),
      metodoPago: saleData.metodoPago || "Efectivo",
      total: saleData.total || 0,
      estado: saleData.estado || "completada", // completada, devolucion, cancelada
      notas: saleData.notas || "",
      ...saleData,
    };
    const next = [newSale, ...sales];
    localStorage.setItem(DB_KEY, JSON.stringify(next));
    return next;
  },

  update: (saleData) => {
    const sales = salesService.getAll();
    const updated = sales.map((s) =>
      s.id === saleData.id ? { ...s, ...saleData } : s
    );
    localStorage.setItem(DB_KEY, JSON.stringify(updated));
    return updated;
  },

  delete: (id) => {
    const sales = salesService.getAll();
    const filtered = sales.filter((s) => s.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
    return filtered;
  },

  getSalesByDate: (date) => {
    const sales = salesService.getAll();
    return sales.filter((s) => s.fecha === date);
  },

  getTodaySales: () => {
    const today = new Date().toLocaleDateString("es-CO");
    return salesService.getSalesByDate(today);
  },

  getTotalSalesToday: () => {
    const sales = salesService.getTodaySales();
    return sales.reduce((sum, s) => sum + (s.total || 0), 0);
  },

  getTotalProductsToday: () => {
    const sales = salesService.getTodaySales();
    return sales.reduce((sum, s) => sum + (s.cantidadProductos || 0), 0);
  },
};
