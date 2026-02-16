const DB_KEY = 'syspharma_providers';

// No seed data: la lista de proveedores empieza vacía para que solo aparezcan
// los proveedores que el usuario agregue mediante la UI (botón "Nuevo").
// Añadimos notificación de cambios para que otras vistas (p. ej. formularios)
// puedan actualizarse en tiempo real escuchando el evento 'providers:changed'.
const notifyChange = () => {
  window.dispatchEvent(new CustomEvent('providers:changed'));
};

export const providerService = {
  getAll: () => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  },
  create: (item) => {
    const list = providerService.getAll();
    const newList = [{ ...item, id: Date.now() }, ...list];
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    notifyChange();
    return newList;
  },
  update: (item) => {
    const list = providerService.getAll().map(i => i.id === item.id ? item : i);
    localStorage.setItem(DB_KEY, JSON.stringify(list));
    notifyChange();
    return list;
  },
  delete: (id) => {
    const list = providerService.getAll().filter(i => i.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(list));
    notifyChange();
    return list;
  }
};