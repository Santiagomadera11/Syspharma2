import React, { useState } from "react";
import { X } from "lucide-react";
import useCart from "../context/CartContext";

const ProductDetailModal = ({ product, onClose }) => {
  const [added, setAdded] = useState(false);
  if (!product) return null;

  const title = product.nombre || product.name || "Producto";
  const price = Number(product.precio ?? product.price ?? 0);

  const cart = useCart();
  const addToCart = () => {
    try {
      cart.addToCart(product);
      try { onClose && onClose(); } catch (e) {}
    } catch (err) {
      console.error("Error agregando al carrito", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[90vw] sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl overflow-hidden relative max-h-[90vh]">

        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-gray-100 rounded-full text-gray-500 hover:text-red-500 transition-colors">
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left: Imagen */}
            <div className="flex items-center justify-center bg-gray-50 rounded-xl p-6 border border-gray-100 h-full min-h-[300px]">
              {(product.imagen || product.image) ? (
                <img src={product.imagen || product.image} alt={title} className="max-h-[300px] w-auto object-contain mix-blend-multiply hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="flex flex-col items-center text-gray-300">
                  <svg className="w-16 h-16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V8a2 2 0 0 0-2-2h-3l-2-2H10L8 6H5a2 2 0 0 0-2 2v8" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <span className="text-sm mt-2">Sin imagen</span>
                </div>
              )}
            </div>

            {/* Right: Información */}
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-2 uppercase tracking-wide">{product.categoria || "Medicamento"}</span>
                <h2 className="text-3xl font-extrabold text-gray-800 leading-tight">{product.nombre || product.name}</h2>
              </div>

              <div className="border-t border-b border-gray-100 py-4">
                <p className="text-sm text-gray-500 mb-1">Precio de venta</p>
                <h3 className="text-4xl font-bold text-emerald-600">${Number(product.precio ?? product.price ?? 0).toLocaleString()}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Proveedor</p>
                  <p className="font-semibold text-gray-800 text-sm">{product.proveedor || product.laboratorio || product.marca || "Farmacéutica Global"}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Stock Disponible</p>
                  <p className={`font-semibold text-sm ${Number(product.stock) > 0 ? 'text-gray-800' : 'text-red-500'}`}>{product.stock ?? 0} unidades</p>
                </div>
              </div>

              {product.tipoProducto === "Medicamento" && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-800">Información del Medicamento</h3>
                  <div className="mt-2 space-y-2 text-sm text-gray-700">
                    {product.presentacion && <div><strong>Presentación: </strong>{product.presentacion}</div>}
                    {product.viaAdministracion && <div><strong>Vía: </strong>{product.viaAdministracion}</div>}
                    {product.concentracion && <div><strong>Concentración: </strong>{product.concentracion}</div>}
                    {product.composicion && <div><strong>Composición: </strong>{product.composicion}</div>}
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border hover:bg-gray-50">Cerrar</button>
                <button onClick={() => { addToCart(); }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6h15l-1.5 9h-13L4 2H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Agregar al carrito
                </button>
                {added && <span className="text-sm text-emerald-700 font-semibold">Agregado ✓</span>}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetailModal;
