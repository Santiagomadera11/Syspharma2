import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Trash2 } from "lucide-react";

export const CartProductsPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem("syspharma_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleChangeQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      const updatedCart = cart.map((item) =>
        item.id === productId ? { ...item, cantidad: newQuantity } : item,
      );
      setCart(updatedCart);
      localStorage.setItem("syspharma_cart", JSON.stringify(updatedCart));
    }
  };

  const handleRemoveFromCart = (productId) => {
    const updatedCart = cart.filter((item) => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem("syspharma_cart", JSON.stringify(updatedCart));
  };

  const total = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
    <div className="h-full flex flex-col p-4 font-sans text-gray-800 bg-white md:bg-transparent">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold">Productos en el Carrito</h1>
            <p className="text-xs text-gray-500">Productos agregados para la venta/pedido</p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">No hay productos en el carrito</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Package size={18} className="text-blue-500" />
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {item.nombre}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600">
                        {formatCurrency(item.precio)} c/u
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            handleChangeQuantity(item.id, item.cantidad - 1)
                          }
                          className="w-8 h-8 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <span className="text-lg font-medium">-</span>
                        </button>
                        <div className="w-12 h-8 rounded-lg border border-gray-300 bg-white flex items-center justify-center">
                          <span className="text-sm font-semibold text-gray-900">
                            {item.cantidad}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleChangeQuantity(item.id, item.cantidad + 1)
                          }
                          className="w-8 h-8 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <span className="text-lg font-medium">+</span>
                        </button>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="w-8 h-8 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Subtotal:</span>
                      <span className="text-sm font-bold text-blue-600">
                        {formatCurrency(item.precio * item.cantidad)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-end items-center flex-shrink-0">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total del carrito:</p>
              <p className="text-base font-bold text-emerald-600">
                {formatCurrency(total)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartProductsPage;