const DB_KEY = 'syspharma_categories';

const initialData = [
  { id: 1, nombre: "Analgésicos", descripcion: "Para el dolor y la fiebre", estado: true },
  { id: 2, nombre: "Antibióticos", descripcion: "Requieren receta médica", estado: true },
  { id: 3, nombre: "Vitaminas", descripcion: "Suplementos dietarios", estado: true },
  { id: 4, nombre: "Cuidado Personal", descripcion: "Aseo y cosmética", estado: true },
  { id: 5, nombre: "Infantil", descripcion: "Pañales y fórmulas", estado: false },
];

export const categoryService = {
  getAll: () => {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : (localStorage.setItem(DB_KEY, JSON.stringify(initialData)), initialData);
  },
  create: (item) => {
    const list = categoryService.getAll();
    const newList = [{ ...item, id: Date.now() }, ...list];
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    return newList;
  },
  update: (item) => {
    const list = categoryService.getAll().map(i => i.id === item.id ? item : i);
    localStorage.setItem(DB_KEY, JSON.stringify(list));
    return list;
  },
  toggleStatus: (id) => {
    const list = categoryService.getAll().map(i => i.id === id ? { ...i, estado: !i.estado } : i);
    localStorage.setItem(DB_KEY, JSON.stringify(list));
    return list;
  },
  delete: (id) => {
    const list = categoryService.getAll().filter(i => i.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(list));
    return list;
  }
};