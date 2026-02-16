const DB_KEY = 'syspharma_categories';

// Función auxiliar para disparar eventos de cambio
const notifyChange = () => {
  window.dispatchEvent(new CustomEvent("categories:changed"));
  window.dispatchEvent(new CustomEvent("products:changed"));
};

export const categoryService = {
  getAll: () => {
    const data = localStorage.getItem(DB_KEY);

    if (!data) return [];

    try {
      const parsed = JSON.parse(data);

      // Si el localStorage contiene exactamente el dataset demo original, lo eliminamos
      const demoNames = [
        "Analgésicos",
        "Antibióticos",
        "Vitaminas",
        "Cuidado Personal",
        "Infantil",
      ];

      const looksLikeDemo = Array.isArray(parsed)
        && parsed.length === demoNames.length
        && parsed.every((c) => c && typeof c.nombre === 'string' && demoNames.includes(c.nombre));

      if (looksLikeDemo) {
        localStorage.removeItem(DB_KEY);
        return [];
      }

      return parsed;
    } catch (err) {
      // Si el JSON está corrupto, limpiamos la clave para evitar comportamientos inesperados
      localStorage.removeItem(DB_KEY);
      return [];
    }
  },
  create: (item) => {
    const list = categoryService.getAll();
    const newList = [{ ...item, id: Date.now() }, ...list];
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    notifyChange();
    return newList;
  },
  update: (item) => {
    const list = categoryService.getAll().map(i => i.id === item.id ? item : i);
    localStorage.setItem(DB_KEY, JSON.stringify(list));
    notifyChange();
    return list;
  },
  toggleStatus: (id) => {
    const list = categoryService.getAll().map(i => i.id === id ? { ...i, estado: !i.estado } : i);
    localStorage.setItem(DB_KEY, JSON.stringify(list));
    notifyChange();
    return list;
  },
  delete: (id) => {
    const list = categoryService.getAll().filter(i => i.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(list));
    notifyChange();
    return list;
  }
};