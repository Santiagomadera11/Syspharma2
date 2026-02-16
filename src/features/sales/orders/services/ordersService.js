const DB_KEY = "syspharma_orders";

const initialData = [];

// Helper para obtener turno activo
const getActiveTurn = () => {
  try {
    const turnKey = "syspharma_current_turn";
    const turn = localStorage.getItem(turnKey);
    return turn ? JSON.parse(turn) : null;
  } catch (error) {
    return null;
  }
};

// REGLA DE ORO: Empleados SIEMPRE necesitan turno abierto
// Web/Externos: pueden crear sin turno pero marcar como "Pendientes de Validación"
const validateOrderCreation = (orderData) => {
  const origin = orderData.origin || "web";
  const turn = getActiveTurn();

  if (origin === "empleado" && !turn) {
    return {
      valid: false,
      message: "REGLA DE ORO: Los empleados no pueden crear pedidos sin turno abierto. Debes abrir caja primero.",
    };
  }

  if (origin === "web" && !turn) {
    return {
      valid: true,
      warning: "Pedido web sin validación de turno. Será marcado como Pendiente.",
      state: "Pendientes de Validación",
    };
  }

  return { valid: true, message: "" };
};

export const ordersService = {
  getAll: () => {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      localStorage.setItem(DB_KEY, JSON.stringify(initialData));
      return initialData;
    }
    try {
      return JSON.parse(data);
    } catch {
      localStorage.setItem(DB_KEY, JSON.stringify(initialData));
      return initialData;
    }
  },

  create: (orderData) => {
    // REGLA DE ORO: Validar según origen del pedido (empleado vs web)
    const validation = validateOrderCreation(orderData);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const orders = ordersService.getAll();
    const id = `PED-${String(orders.length + 1).padStart(3, "0")}`;
    const turn = getActiveTurn();

    // Determinar estado: si es pedido web sin turno, marcarlo como "Pendientes de Validación"
    let estado = "Pendiente";
    if (validation.state === "Pendientes de Validación") {
      estado = "Pendientes de Validación";
    } else if (orderData.estado) {
      estado = orderData.estado;
    }

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
      turnId: turn?.turnId || null,
      userId: orderData.userId || null,
      userName: orderData.userName || "",
      origin: orderData.origin || "web",
      estado: estado,
      notas: orderData.notas || "",
      creadoPor: orderData.creadoPor || "Administrador",
      ...orderData,
    };
    const next = [newOrder, ...orders];
    localStorage.setItem(DB_KEY, JSON.stringify(next));

    // Emitir eventos para notificar otras pestañas/componentes
    try { window.dispatchEvent(new CustomEvent(`${DB_KEY}_updated`, { detail: {} })); } catch (e) {}
    try { window.dispatchEvent(new Event(`${DB_KEY}_updated`)); } catch (e) {}
    try { window.dispatchEvent(new Event('storage')); } catch (e) {}

    // Si es pedido de empleado CON turno, registrar como venta inmediata
    if (orderData.origin === "empleado" && turn) {
      try {
        const salesKey = "syspharma_sales";
        const sales = JSON.parse(localStorage.getItem(salesKey) || "[]");
        const newSale = {
          saleId: Date.now(),
          fecha: new Date().toISOString(),
          userId: orderData.userId || turn.userId,
          userName: orderData.userName || turn.userName,
          monto: orderData.total || 0,
          tipo: "pedido",
          categoria: "producto",
          descripcion: `Pedido ${id}`,
          referencia: id,
          turnId: turn.turnId,
        };
        sales.push(newSale);
        localStorage.setItem(salesKey, JSON.stringify(sales));
      } catch (error) {
        console.warn("Error registrando venta de pedido:", error);
      }
    }

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
