import React from "react";
import { X } from "lucide-react";

export const OrderDetailModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const formatCurrency = (val) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);

  const getStatusColor = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "bg-yellow-100 text-yellow-700";
      case "En proceso":
        return "bg-blue-100 text-blue-700";
      case "Entregado":
        return "bg-green-100 text-green-700";
      case "Cancelado":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-green-50 sticky top-0">
          <div>
            <h2 className="text-sm font-bold text-gray-800">
              Detalles del Pedido
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          {/* Información del Cliente */}
          <div>
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2.5 text-emerald-700">
              Información del Cliente
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-600">Nombre:</span>
                <span className="text-xs font-semibold text-gray-800">
                  {order.cliente}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-600">Documento:</span>
                <span className="text-xs font-mono text-gray-800">
                  {order.documento}
                </span>
              </div>
              {order.notas && order.notas.includes("Teléfono") && (
                <div className="flex justify-between items-start">
                  <span className="text-xs text-gray-600">Teléfono:</span>
                  <span className="text-xs font-semibold text-gray-800">
                    {order.notas.split("Teléfono: ")[1]?.split(" |")[0]}
                  </span>
                </div>
              )}
              {order.notas && order.notas.includes("Correo") && (
                <div className="flex justify-between items-start break-all">
                  <span className="text-xs text-gray-600">Correo:</span>
                  <span className="text-xs font-semibold text-gray-800">
                    {order.notas.split("Correo: ")[1]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Fecha y Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1 block">
                Fecha
              </label>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs font-semibold text-gray-800">
                  {new Date(order.fecha).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1 block">
                Estado
              </label>
              <div className="bg-gray-50 rounded-lg p-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusColor(
                    order.estado
                  )}`}
                >
                  {order.estado}
                </span>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div>
            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2.5 text-emerald-700">
              Productos ({order.cantidadProductos})
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2 max-h-[150px] overflow-y-auto">
              {order.productos && order.productos.length > 0 ? (
                order.productos.map((product, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-start pb-2 border-b border-gray-200 last:border-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {product.nombre}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Cantidad: {product.cantidad}
                      </p>
                    </div>
                    <div className="text-right ml-2 flex-shrink-0">
                      <p className="text-xs font-bold text-emerald-600">
                        {formatCurrency(product.precio * product.cantidad)}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {formatCurrency(product.precio)} c/u
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">
                  Sin productos
                </p>
              )}
            </div>
          </div>

          {/* Totales */}
          <div className="border-t border-gray-200 pt-3 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Subtotal:</span>
              <span className="text-xs font-semibold text-gray-800">
                {formatCurrency(order.total)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1.5 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-800">Total:</span>
              <span className="text-sm font-bold text-emerald-600">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
