import { useState, useEffect, useCallback } from "react";

// Evento personalizado para sincronización en la misma pestaña
const SYNC_EVENT = "local-storage-update";

export const useCrud = (storageKey, initialData) => {
  // Función auxiliar para leer datos
  const getStoredData = () => {
    try {
      const item = localStorage.getItem(storageKey);
      return item ? JSON.parse(item) : initialData;
    } catch (error) {
      console.error("Error leyendo localStorage:", error);
      return initialData;
    }
  };

  const [items, setItems] = useState(getStoredData);

  // EFECTO DE SINCRONIZACIÓN (La Magia)
  useEffect(() => {
    // Esta función se ejecuta cuando alguien grita que hubo cambios
    const handleStorageChange = (e) => {
      // Si el evento es de otra pestaña (storage) y la clave coincide
      // O si es de la misma pestaña (local-storage-update)
      if (
        (e.type === "storage" && e.key === storageKey) ||
        e.type === SYNC_EVENT
      ) {
        console.log(`🔄 Sincronizando datos para: ${storageKey}`);
        setItems(getStoredData());
      }
    };

    // Escuchar cambios de otras pestañas
    window.addEventListener("storage", handleStorageChange);
    // Escuchar cambios en esta misma pestaña
    window.addEventListener(SYNC_EVENT, handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(SYNC_EVENT, handleStorageChange);
    };
  }, [storageKey]);

  // Función interna para guardar y notificar
  const saveAndNotify = (newData) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(newData));
      setItems(newData);
      // 🔥 AQUÍ DISPARAMOS EL EVENTO PARA AVISAR A LOS DEMÁS COMPONENTES
      window.dispatchEvent(new Event(SYNC_EVENT));
    } catch (error) {
      console.error("Error guardando datos:", error);
    }
  };

  // --- ACCIONES ---

  const addItem = (item) => {
    const newData = [item, ...items];
    saveAndNotify(newData);
  };

  const updateItem = (id, updatedFields) => {
    const newData = items.map((item) => 
      item.id === id ? { ...item, ...updatedFields } : item
    );
    saveAndNotify(newData);
  };

  const deleteItem = (id) => {
    if (window.confirm("¿Estás seguro de eliminar este registro?")) {
      const newData = items.filter((item) => item.id !== id);
      saveAndNotify(newData);
    }
  };

  // Retornamos también una función para forzar recarga manual si fuera necesario
  const refresh = () => setItems(getStoredData());

  return { items, addItem, updateItem, deleteItem, refresh };
};