const DB_KEY = "syspharma_orders";

const initialData = [];

export const ordersService = {
  getAll: () => {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      localStorage.setItem(DB_KEY, JSON.stringify(initialData));
      return initialData;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      localStorage.setItem(DB_KEY, JSON.stringify(initialData));
      return initialData;
    }
  },

  create: (orderData) => {
    const orders = ordersService.getAll();
    const id = `PED-${String(orders.length + 1).padStart(3, "0")}`;
    const newOrder = {
      id,
      cliente: orderData.cliente || "",
      documento: orderData.documento || "",
      fecha: new Date().toISOString().split("T")[0],
      productos: orderData.productos || [],
      cantidadProductos: (orderData.productos || []).reduce(
        (sum, p) => sum + (p.cantidad || 0),
        0,
      ),
      total: orderData.total || 0,
      estado: orderData.estado || "Pendiente",
      notas: orderData.notas || "",
      ...orderData,
    };
    const next = [newOrder, ...orders];
    localStorage.setItem(DB_KEY, JSON.stringify(next));
    return next;
  },

  update: (orderData) => {
    const orders = ordersService.getAll();
    const updated = orders.map((o) =>
      o.id === orderData.id ? { ...o, ...orderData } : o,
    );
    localStorage.setItem(DB_KEY, JSON.stringify(updated));
    return updated;
  },

  delete: (id) => {
    const orders = ordersService.getAll();
    const filtered = orders.filter((o) => o.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
    return filtered;
  },

  getById: (id) => {
    const orders = ordersService.getAll();
    return orders.find((o) => o.id === id);
  },

  updateStatus: (id, newStatus) => {
    const orders = ordersService.getAll();
    const updated = orders.map((o) =>
      o.id === id ? { ...o, estado: newStatus } : o,
    );
    localStorage.setItem(DB_KEY, JSON.stringify(updated));
    return updated;
  },
};
