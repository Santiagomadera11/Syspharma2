import React, { useEffect, useState } from 'react';
import { LS, read, write } from '../../shared/services/lsService';
import { ToastNotification } from '../../shared/ui/ToastNotification';

const FavoritosPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    load();
    const onFavUpdated = () => load();
    window.addEventListener(`${LS.FAVORITES}_updated`, onFavUpdated);
    window.addEventListener(`${LS.PRODUCTS}_updated`, onFavUpdated);
    return () => {
      window.removeEventListener(`${LS.FAVORITES}_updated`, onFavUpdated);
      window.removeEventListener(`${LS.PRODUCTS}_updated`, onFavUpdated);
    };
  }, []);

  function load() {
    const fav = read(LS.FAVORITES) || [];
    const prods = read(LS.PRODUCTS) || [];
    // Map favorites to current product data
    const mapped = fav.map((f) => {
      const p = prods.find((x) => x.id === f.id) || f;
      return { ...p };
    });
    setFavorites(mapped);
    setProducts(prods);
  }

  const handleRemove = (id) => {
    const arr = (read(LS.FAVORITES) || []).filter((f) => f.id !== id);
    write(LS.FAVORITES, arr);
    setToast({ message: 'Eliminado de favoritos', type: 'success', zIndex: 70 });
  };

  if (!favorites || favorites.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Tus Favoritos</h2>
        <p>Tu lista de deseos está vacía. ¡Explora el catálogo!</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Tus Favoritos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {favorites.map((p) => (
          <div key={p.id} className="border rounded p-3 shadow-sm">
            <img src={p.imagen} alt={p.nombre} className="w-full h-40 object-cover mb-2" />
            <div className="font-bold">{p.nombre}</div>
            <div className="text-sm text-gray-600">{p.laboratorio || p.marca}</div>
            <div className="mt-2">
              <div className="text-lg font-semibold">
                ${p.enOferta && p.porcentajeDescuento ? (p.precio * (1 - (p.porcentajeDescuento||0)/100)).toFixed(2) : p.precio}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleRemove(p.id)} className="px-3 py-1 border rounded text-sm">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
      {toast && (
        <ToastNotification message={toast.message} type={toast.type} zIndex={toast.zIndex} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default FavoritosPage;
