const DB_KEY = 'syspharma_purchases';

const initialData = [];

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