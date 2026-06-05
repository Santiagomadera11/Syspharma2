import React from "react";
import { ShoppingCart, DollarSign } from "lucide-react";

const fmt = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

export const IntegratedCart = ({ 
  products, 
  services, 
  onConfirm, 
  isLoading, 
  primary, 
  disabled,
  porcentajeIva = 19,
  esUnPedido = false,
}) => {
  const productsTotal = products.reduce((sum, p) => sum + p.precio * p.cantidad, 0);
  const servicesTotal = services.reduce((sum, s) => sum + s.precio, 0);
  const subtotal = productsTotal + servicesTotal;
  const iva = subtotal * (porcentajeIva / 100);
  const totalGeneral = subtotal + iva;

  const hasItems = products.length > 0 || services.length > 0;

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex flex-col h-fit">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} style={{ color: primary }} />
            <h3 className="font-bold text-sm text-gray-900">
              {esUnPedido ? "Resumen de Pedido" : "Resumen de Venta"}
            </h3>
          </div>
          {hasItems && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full font-semibold text-gray-600">
              {products.length + services.length} items
            </span>
          )}
        </div>
      </div>

      {/* Contenido scrolleable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Vacío */}
        {!hasItems && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <ShoppingCart size={32} className="opacity-20 mb-2" />
            <p className="text-xs font-semibold">Carrito vacío</p>
            <p className="text-[10px]">Agregue productos o servicios</p>
          </div>
        )}
      </div>

      {/* Footer SIEMPRE VISIBLE */}
      {hasItems && (
        <div className="border-t border-gray-100 p-3 space-y-2 bg-gradient-to-b from-white to-gray-50 flex-shrink-0">
          {/* Subtotal */}
          <div className="flex justify-between text-xs text-gray-600">
            <span>Subtotal:</span>
            <span className="font-semibold">{fmt(subtotal)}</span>
          </div>

          {/* IVA */}
          {porcentajeIva > 0 && (
            <div className="flex justify-between text-xs text-gray-600">
              <span>IVA ({porcentajeIva}%):</span>
              <span className="font-semibold">{fmt(iva)}</span>
            </div>
          )}

          {/* Total destacado */}
          <div 
            className="flex justify-between text-sm font-black px-3 py-2.5 rounded-lg mt-2"
            style={{ 
              background: primary + "15",
              color: primary 
            }}
          >
            <span>TOTAL:</span>
            <span>{fmt(totalGeneral)}</span>
          </div>

          {/* Botón Finalizar */}
          <button
            onClick={onConfirm}
            disabled={disabled || isLoading}
            className="w-full py-2.5 rounded-lg text-white font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed mt-3 shadow-md"
            style={{
              background: disabled || isLoading ? "#cbd5e1" : primary,
            }}
          >
            <DollarSign size={14} />
            {isLoading ? "Procesando..." : (esUnPedido ? "Confirmar Pedido" : "Finalizar Venta")}
          </button>
        </div>
      )}
    </div>
  );
};

export default IntegratedCart;