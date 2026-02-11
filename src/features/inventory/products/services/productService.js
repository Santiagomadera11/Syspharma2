const DB_KEY = "syspharma_products";

const initialData = [];

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
    const newList = products.map((p) =>
      p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p,
    );
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    return newList;
  },

  getById: (id) => {
    const products = productService.getAll();
    const found = products.find((p) => p.id == id); // Usar == en lugar de === para comparación flexible
    return found;
  },

  toggleStatus: (id) => {
    const products = productService.getAll();
    const newList = products.map((p) =>
      p.id === id ? { ...p, estado: !p.estado } : p,
    );
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    return newList;
  },

  delete: (id) => {
    const products = productService.getAll();
    const newList = products.filter((p) => p.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(newList));
    return newList;
  },
};
