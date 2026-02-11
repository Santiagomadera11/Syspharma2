const DB_KEY = 'syspharma_purchases';

const initialData = [
  { id: 1, factura: "F-00123", proveedor: "Droguería Alemana", fecha: "2025-10-01", total: 1500000, estado: "Recibido", items: 12 },
  { id: 2, factura: "F-00124", proveedor: "Laboratorios Genfar", fecha: "2025-10-05", total: 850000, estado: "Pendiente", items: 5 },
  { id: 3, factura: "F-00125", proveedor: "Coopidrogas", fecha: "2025-10-08", total: 3200000, estado: "Recibido", items: 45 },
  { id: 4, factura: "F-00126", proveedor: "Tecnoquímicas", fecha: "2025-10-10", total: 450000, estado: "Cancelado", items: 0 },
];

// Función auxiliar para disparar eventos de cambio
const notifyChange = () => {
  window.dispatchEvent(new CustomEvent("purchases:changed"));
};

export const purchaseService = {
  getAll: () => {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      localStorage.setItem(DB_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(data);
  },

  create: (purchase) => {
    const purchases = purchaseService.getAll();
    const newPurchase = { ...purchase, id: Date.now() };
    const newList = [newPurchase, ...purchases];
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    notifyChange();
    return newList;
  },

  update: (purchase) => {
    const purchases = purchaseService.getAll();
    const newList = purchases.map(p => p.id === purchase.id ? purchase : p);
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    notifyChange();
    return newList;
  },

  delete: (id) => {
    const purchases = purchaseService.getAll();
    const newList = purchases.filter(p => p.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    notifyChange();
    return newList;
  },

  changeStatus: (id, newStatus) => {
    const purchases = purchaseService.getAll();
    const newList = purchases.map(p => p.id === id ? { ...p, estado: newStatus } : p);
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    notifyChange();
    return newList;
  }
};