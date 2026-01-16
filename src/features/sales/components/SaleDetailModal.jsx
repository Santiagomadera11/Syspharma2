import React, { useState } from "react";
import { X } from "lucide-react";

export const SaleDetailModal = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
          <h2 className="text-lg font-bold text-gray-800">
            Detalle de venta #{sale.id}
          </h2>
          <button onClick={onClose} className="text-gray-500 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Cliente e info básica */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase">
                Cliente
              </div>
              <div className="text-lg font-bold text-gray-800">
                {sale.cliente}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase">
                Fecha y hora
              </div>
              <div className="text-sm text-gray-700">
                {sale.fecha} - {sale.hora}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase">
                Método de pago
              </div>
              <div className="text-sm text-gray-700">{sale.metodoPago}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase">
                Estado
              </div>
              <div className="text-sm font-semibold">
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    sale.estado === "completada"
                      ? "bg-green-100 text-green-700"
                      : sale.estado === "devolucion"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {sale.estado}
                </span>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Productos</h3>
            <div className="space-y-2">
              {(sale.productos || []).map((prod, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-2 border rounded bg-gray-50"
                >
                  <div>
                    <div className="font-medium text-sm">{prod.nombre}</div>
                    <div className="text-xs text-gray-500">
                      Cantidad: {prod.cantidad}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      ${(prod.precio * prod.cantidad).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      ${prod.precio.toLocaleString()} x {prod.cantidad}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Total:</span>
              <span className="text-2xl font-bold text-emerald-600">
                ${sale.total.toLocaleString()}
              </span>
            </div>
          </div>

          {sale.notas && (
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase mb-1">
                Notas
              </div>
              <div className="p-2 bg-gray-50 rounded text-sm text-gray-700">
                {sale.notas}
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-3 bg-gray-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border rounded hover:bg-gray-100 text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailModal;
