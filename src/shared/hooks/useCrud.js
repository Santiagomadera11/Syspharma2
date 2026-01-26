import { useState, useEffect } from "react";

export const useCrud = (storageKey, initialData) => {
  // 1. Cargar datos del LocalStorage o usar los iniciales
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : initialData;
    } catch (error) {
      console.error("Error cargando datos", error);
      return initialData;
    }
  });

  // 2. Guardar en LocalStorage cada vez que cambien los items
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  // --- ACCIONES ---

  // AGREGAR
  const addItem = (newItem) => {
    // Generar un ID simple si no viene
    const itemWithId = { ...newItem, id: newItem.id || `${Date.now()}` };
    setItems((prev) => [itemWithId, ...prev]);
  };

  // EDITAR
  const updateItem = (id, updatedFields) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  // ELIMINAR
  const deleteItem = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return { items, addItem, updateItem, deleteItem };
};