const DB_KEY = 'sys_products';

const initialData = [
  { id: 1, codigo: "P001", nombre: "Acetaminofén 500mg", laboratorio: "Genfar", categoria: "Analgésicos", precio: 2500, stock: 120, vencimiento: "2026-12-01", estado: true },
  { id: 2, codigo: "P002", nombre: "Dolex Forte", laboratorio: "GSK", categoria: "Analgésicos", precio: 8500, stock: 5, vencimiento: "2025-06-15", estado: true }, // Stock bajo
  { id: 3, codigo: "P003", nombre: "Vitamina C + Zinc", laboratorio: "MK", categoria: "Vitaminas", precio: 12000, stock: 45, vencimiento: "2027-01-20", estado: true },
  { id: 4, codigo: "P004", nombre: "Suero Oral Fresa", laboratorio: "Pedialyte", categoria: "Hidratación", precio: 9500, stock: 0, vencimiento: "2024-10-10", estado: false },
];

export const productService = {
  getAll: () => {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      localStorage.setItem(DB_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(data);
  },

  create: (product) => {
    const products = productService.getAll();
    const newProduct = { ...product, id: Date.now() };
    const newList = [newProduct, ...products]; // Agregamos al principio
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    return newList;
  },

  update: (updatedProduct) => {
    const products = productService.getAll();
    const newList = products.map(p => p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p);
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    return newList;
  },

  toggleStatus: (id) => {
    const products = productService.getAll();
    const newList = products.map(p => p.id === id ? { ...p, estado: !p.estado } : p);
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    return newList;
  },

  delete: (id) => {
    const products = productService.getAll();
    const newList = products.filter(p => p.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    return newList;
  }
};