import React, { useEffect, useState } from 'react';
import { LS, read, write } from '../../shared/services/lsService';
import { ToastNotification } from '../../shared/ui/ToastNotification';

const CarritoPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    load();
    const onCartUpdated = () => load();
    window.addEventListener(`${LS.CART}_updated`, onCartUpdated);
    window.addEventListener(`${LS.PRODUCTS}_updated`, onCartUpdated);
    return () => {
      window.removeEventListener(`${LS.CART}_updated`, onCartUpdated);
      window.removeEventListener(`${LS.PRODUCTS}_updated`, onCartUpdated);
    };
  }, []);

  function load() {
    const cart = read(LS.CART) || [];
    const prods = read(LS.PRODUCTS) || [];
    const mapped = cart.map((item) => {
      const p = prods.find((x) => x.id === item.id) || {};
      const currentPrice = p.precio || item.precio || 0;
      const priceChanged = item.precio && p.precio && item.precio !== p.precio;
      return { ...item, producto: p, precioActual: currentPrice, priceChanged };
    });
    setCartItems(mapped);
    setProducts(prods);
  }

  const changeQty = (id, delta) => {
    const arr = (read(LS.CART) || []).map((it) => it.id === id ? { ...it, cantidad: Math.max(1, it.cantidad + delta) } : it);
    write(LS.CART, arr);
  };

  const handleRemove = (id) => {
    const arr = (read(LS.CART) || []).filter((f) => f.id !== id);
    write(LS.CART, arr);
    setToast({ message: 'Eliminado del carrito', type: 'success', zIndex: 70 });
  };

  const handleClear = () => {
    write(LS.CART, []);
    setToast({ message: 'Carrito vaciado', type: 'success', zIndex: 70 });
  };

  const total = cartItems.reduce((s, it) => s + (it.precioActual || 0) * (it.cantidad || 1), 0);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Tu Carrito</h2>
        <p>Tu carrito está vacío. Agrega productos desde el catálogo.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Tu Carrito</h2>
      <div className="space-y-4">
        {cartItems.map((it) => (
          <div key={it.id} className="flex items-center gap-4 border p-3 rounded">
            <img src={(it.producto && it.producto.imagen) || it.imagen} className="w-20 h-20 object-cover" alt="" />
            <div className="flex-1">
              <div className="font-bold">{(it.producto && it.producto.nombre) || it.nombre}</div>
              <div className="text-sm text-gray-600">{(it.producto && it.producto.laboratorio) || it.laboratorio}</div>
              <div className="mt-2">
                <div className="text-lg font-semibold">
                  ${it.precioActual.toFixed(2)} {it.priceChanged && <span className="text-xs text-red-600">(Precio actualizado)</span>}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <button onClick={() => changeQty(it.id, -1)} className="px-2 py-1 border rounded">-</button>
                <div className="px-3">{it.cantidad}</div>
                <button onClick={() => changeQty(it.id, 1)} className="px-2 py-1 border rounded">+</button>
              </div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => handleRemove(it.id)} className="px-3 py-1 border rounded text-sm">Eliminar</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-xl font-bold">Total: ${total.toFixed(2)}</div>
        <div className="flex gap-2">
          <button onClick={handleClear} className="px-4 py-2 border rounded">Vaciar Carrito</button>
          <button className="px-4 py-2 bg-primary text-white rounded">Pagar</button>
        </div>
      </div>

      {toast && (
        <ToastNotification message={toast.message} type={toast.type} zIndex={toast.zIndex} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default CarritoPage;
