const DB_KEY = "syspharma_orders";

const initialData = [
  {
    id: "PED-001",
    cliente: "Juan Pérez",
    documento: "1234567890",
    fecha: "2026-01-20",
    productos: [
      { nombre: "Acetaminofén 500mg", cantidad: 2, precio: 2500 },
      { nombre: "Vitamina C + Zinc", cantidad: 1, precio: 12000 },
    ],
    cantidadProductos: 3,
    total: 17000,
    estado: "Entregado",
    notas: "Entrega completada sin inconvenientes",
  },
  {
    id: "PED-002",
    cliente: "María García",
    documento: "0987654321",
    fecha: "2026-01-21",
    productos: [{ nombre: "Dolex Forte", cantidad: 1, precio: 8500 }],
    cantidadProductos: 1,
    total: 8500,
    estado: "En proceso",
    notas: "En preparación",
  },
  {
    id: "PED-003",
    cliente: "Carlos López",
    documento: "1122334455",
    fecha: "2026-01-21",
    productos: [{ nombre: "Suero Oral Fresa", cantidad: 2, precio: 9500 }],
    cantidadProductos: 2,
    total: 19000,
    estado: "Pendiente",
    notas: "Confirmación de dirección pendiente",
  },
];

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
        0
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
      o.id === orderData.id ? { ...o, ...orderData } : o
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
      o.id === id ? { ...o, estado: newStatus } : o
    );
    localStorage.setItem(DB_KEY, JSON.stringify(updated));
    return updated;
  },
};
