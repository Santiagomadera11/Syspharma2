import React from "react";
import { ShoppingCart, Trash2 } from "lucide-react";
import { DollarSign } from "lucide-react";

const fmt = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

export const IntegratedCart = ({ products, services, onConfirm, isLoading, primary, disabled }) => {
  const productsTotal = products.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
  const servicesTotal = services.reduce((sum, s) => sum + s.precio, 0);
  const totalGeneral = productsTotal + servicesTotal;

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} style={{ color: primary }} />
          <h3 className="font-bold text-sm text-gray-900">Resumen de Venta</h3>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Productos */}
        {products.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase text-gray-500 mb-1.5">📦 Productos ({products.length})</h4>
            <div className="space-y-1 border-b border-gray-100 pb-2">
              {products.map((p) => (
                <div key={p.id} className="flex justify-between text-xs">
                  <div>
                    <p className="font-medium text-gray-800 text-xs">{p.nombre}</p>
                    <p className="text-xs text-gray-500">x{p.cantidad}</p>
                  </div>
                  <p className="font-bold text-gray-900 text-xs">{fmt(p.precio * p.cantidad)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs mt-1.5 font-semibold text-gray-700">
              <span>Subtotal:</span>
              <span>{fmt(productsTotal)}</span>
            </div>
          </div>
        )}

        {/* Servicios */}
        {services.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase text-gray-500 mb-1.5">🏥 Servicios ({services.length})</h4>
            <div className="space-y-1 border-b border-gray-100 pb-2">
              {services.map((s) => (
                <div key={s.id} className="flex justify-between text-xs">
                  <div>
                    <p className="font-medium text-gray-800 text-xs">{s.doctorNombre}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(s.fecha).toLocaleDateString("es-CO")} {s.hora}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 text-xs">{fmt(s.precio)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs mt-1.5 font-semibold text-gray-700">
              <span>Subtotal:</span>
              <span>{fmt(servicesTotal)}</span>
            </div>
          </div>
        )}

        {/* Vacío */}
        {products.length === 0 && services.length === 0 && (
          <div className="flex flex-col items-center justify-center py-4 text-gray-400">
            <ShoppingCart size={32} className="opacity-20 mb-1.5" />
            <p className="text-xs">Carrito vacío</p>
          </div>
        )}
      </div>

      {/* Footer con Total y Botón */}
      <div className="border-t border-gray-100 p-2.5 space-y-1.5 bg-gradient-to-b from-white to-gray-50 flex-shrink-0">
        {/* IVA (simplificado) */}
        <div className="flex justify-between text-xs text-gray-600">
          <span>IVA (0%):</span>
          <span>{fmt(0)}</span>
        </div>

        {/* Total */}
        <div className="flex justify-between text-sm font-black bg-gradient-to-r from-emerald-100 to-blue-100 -mx-2.5 -mb-2.5 px-2.5 py-2 rounded-b-lg" style={{ color: primary }}>
          <span>TOTAL:</span>
          <span>{fmt(totalGeneral)}</span>
        </div>

        {/* Botón Finalizar */}
        <button
          onClick={onConfirm}
          disabled={
            disabled ||
            isLoading ||
            (products.length === 0 && services.length === 0) ||
            totalGeneral === 0
          }
          className="w-full py-2 rounded-lg text-white font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          style={{
            background:
              disabled ||
              isLoading ||
              (products.length === 0 && services.length === 0) ||
              totalGeneral === 0
                ? "#cbd5e1"
                : primary,
          }}
        >
          <DollarSign size={14} />
          {isLoading ? "Procesando..." : "Finalizar Venta"}
        </button>
      </div>
    </div>
  );
};
