const DB_KEY = 'syspharma_providers';

const initialData = [
  { id: 1, nit: "900.123.456", nombre: "Droguería Alemana", contacto: "Juan Pérez", telefono: "3101234567", email: "ventas@alemana.com", estado: true },
  { id: 2, nit: "800.987.654", nombre: "Laboratorios Genfar", contacto: "Ana Gómez", telefono: "3209876543", email: "pedidos@genfar.com", estado: true },
  { id: 3, nit: "890.111.222", nombre: "Coopidrogas", contacto: "Carlos Ruiz", telefono: "3001112233", email: "contacto@coopi.com", estado: true },
];

export const providerService = {
  getAll: () => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : (localStorage.setItem(DB_KEY, JSON.stringify(initialData)), initialData);
  },
  create: (item) => {
    const list = providerService.getAll();
    const newList = [{ ...item, id: Date.now() }, ...list];
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    return newList;
  },
  update: (item) => {
    const list = providerService.getAll().map(i => i.id === item.id ? item : i);
    localStorage.setItem(DB_KEY, JSON.stringify(list));
    return list;
  },
  delete: (id) => {
    const list = providerService.getAll().filter(i => i.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(list));
    return list;
  }
};