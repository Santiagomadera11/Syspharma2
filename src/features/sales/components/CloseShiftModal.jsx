import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  X,
} from "lucide-react";
import { turnService } from "../services/turnService";

/**
 * Modal de Liquidación de Turno
 * Calcula ventas, gastos y diferencia
 * Guarda el cierre en historial
 * @param isOpen - Modal visible?
 * @param onShiftClosed - Callback cuando se cierra el turno
 * @param onCancel - Callback para cerrar sin guardar
 * @param user - Usuario actual (empleado)
 * @param userData - Datos del empleado (para cierre forzado por admin)
 * @param turnData - Datos del turno (para cierre forzado por admin)
 * @param isAdminForcedClose - ¿Es un cierre forzado por admin?
 */
export const CloseShiftModal = ({
  isOpen,
  onShiftClosed,
  onCancel,
  user,
  userData,
  turnData,
  isAdminForcedClose = false,
}) => {
  const [efectivoFisico, setEfectivoFisico] = useState("");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Datos calculados
  const [balance, setBalance] = useState({
    montoBase: 0,
    totalVentas: 0,
    totalGastos: 0,
    saldoEsperado: 0,
  });

  // Al abrir el modal, calcula los montos
  useEffect(() => {
    if (isOpen) {
      if (isAdminForcedClose && turnData) {
        // Cierre forzado: usar datos del turno que se está cerrando
        setBalance({
          montoBase: turnData.montoBase || 0,
          totalVentas: turnData.totalVentas || 0,
          totalGastos: turnData.totalGastos || 0,
          saldoEsperado:
            (turnData.montoBase || 0) +
            (turnData.totalVentas || 0) -
            (turnData.totalGastos || 0),
        });
        // Precargar nota de admin
        setNotas(
          "Cerrado por el Administrador",
        );
      } else {
        // Cierre normal: calcular desde el turno activo
        const calculatedBalance = turnService.calculateExpectedBalance();
        setBalance(calculatedBalance);
        setNotas("");
      }
      setEfectivoFisico("");
      setError("");
    }
  }, [isOpen, isAdminForcedClose, turnData]);

  const handleCloseTurn = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (!efectivoFisico || efectivoFisico === "") {
      setError("Ingresa el efectivo físico en caja");
      return;
    }

    const amount = parseFloat(efectivoFisico);
    if (isNaN(amount) || amount < 0) {
      setError("Ingresa un monto válido (número positivo)");
      return;
    }

    try {
      setLoading(true);

      // Calcula diferencia
      const diferencia = amount - balance.saldoEsperado;

      // Preparar notas con auditoría si es cierre forzado
      let finalNotas = notas || "";
      if (isAdminForcedClose) {
        // Asegurar que lleve la nota de admin
        if (!finalNotas.includes("Cerrado por el Administrador")) {
          finalNotas = "Cerrado por el Administrador";
        }
      }

      // Cierra el turno y guarda en historial
      const closedTurn = turnService.closeTurn({
        montoFinal: amount,
        totalVentas: balance.totalVentas,
        totalGastos: balance.totalGastos,
        diferencia: diferencia,
        notas: finalNotas,
      });

      // Reset form
      setEfectivoFisico("");
      setNotas("");
      setError("");

      // Dispara evento global para actualizar botones en toda la app
      window.dispatchEvent(
        new CustomEvent("turn:closed", { detail: closedTurn }),
      );

      // Callback al componente padre
      if (onShiftClosed) {
        onShiftClosed(closedTurn);
      }
    } catch (err) {
      setError(err.message || "Error al cerrar turno");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const diferencia = parseFloat(efectivoFisico || 0) - balance.saldoEsperado;
  const diferenciaBuena = diferencia === 0;
  const diferenciaNegativa = diferencia < 0;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        {/* Modal */}
        <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-md w-full mx-2 border border-gray-200 max-h-[80vh] overflow-auto no-scrollbar">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`${
                  isAdminForcedClose ? "bg-orange-100" : "bg-red-100"
                } p-3 rounded-lg`}
              >
                <DollarSign
                  className={`${
                    isAdminForcedClose ? "text-orange-600" : "text-red-600"
                  }`}
                  size={24}
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isAdminForcedClose ? "Cierre Forzado" : "Cerrar Turno"}
                </h2>
                <p className="text-xs text-gray-500">
                  {isAdminForcedClose
                    ? "Cierre por Administrador"
                    : "Liquidación de caja"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setEfectivoFisico("");
                setNotas("");
                setError("");
                if (onCancel) onCancel();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
              title="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Información del usuario */}
          <div
            className={`${
              isAdminForcedClose ? "bg-orange-50 border-orange-200" : "bg-gray-50"
            } p-4 rounded-lg mb-6 border border-gray-100`}
          >
            <p className="text-xs text-gray-600 font-medium mb-1">
              {isAdminForcedClose ? "Cerrando caja de" : "Usuario"}
            </p>
            <p className="text-sm font-bold text-gray-800">
              {userData?.userName || user?.nombre || "Usuario"}
            </p>
            <p className="text-xs text-gray-500">
              Hora: {new Date().toLocaleTimeString()}
            </p>
          </div>

          {/* Resumen de Movimientos */}
          <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <DollarSign size={16} className="text-blue-600" />
                  Monto Base
                </span>
              </span>
              <span className="font-bold text-gray-900">
                ${balance.montoBase.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-green-600" />
                  Ventas Totales
                </span>
              </span>
              <span className="font-bold text-green-600">
                +${balance.totalVentas.toLocaleString()}
              </span>
            </div>

            {/* Desglose de Ventas por Categoría */}
            {(balance.ventasProductos > 0 || balance.ventasServicios > 0) && (
              <div className="ml-4 space-y-2 text-xs text-gray-600">
                {balance.ventasProductos > 0 && (
                  <div className="flex justify-between">
                    <span>└─ Productos</span>
                    <span className="font-semibold text-gray-700">
                      ${balance.ventasProductos.toLocaleString()}
                    </span>
                  </div>
                )}
                {balance.ventasServicios > 0 && (
                  <div className="flex justify-between">
                    <span>└─ Servicios</span>
                    <span className="font-semibold text-gray-700">
                      ${balance.ventasServicios.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                <span className="flex items-center gap-1.5">
                  <TrendingDown size={16} className="text-amber-600" />
                  Gastos Totales
                </span>
              </span>
              <span className="font-bold text-amber-600">
                -${balance.totalGastos.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-sm font-semibold text-gray-700">
                Saldo Esperado
              </span>
              <span className="font-bold text-lg text-gray-900">
                ${balance.saldoEsperado.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleCloseTurn} className="space-y-4">
            {/* Input: Efectivo Físico */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Efectivo Físico en Caja
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  $
                </span>
                <input
                  type="number"
                  value={efectivoFisico}
                  onChange={(e) => setEfectivoFisico(e.target.value)}
                  placeholder="0"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 focus:bg-white text-gray-900 font-semibold"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Diferencia de Caja */}
            {efectivoFisico && (
              <div
                className={`p-4 rounded-lg border-2 flex items-start gap-3 ${
                  diferenciaBuena
                    ? "bg-green-50 border-green-200"
                    : diferenciaNegativa
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <AlertCircle
                  size={18}
                  className={`flex-shrink-0 mt-0.5 ${
                    diferenciaBuena
                      ? "text-green-600"
                      : diferenciaNegativa
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}
                />
                <div>
                  <p
                    className={`text-xs font-bold ${
                      diferenciaBuena
                        ? "text-green-800"
                        : diferenciaNegativa
                          ? "text-red-800"
                          : "text-yellow-800"
                    }`}
                  >
                    {diferenciaBuena
                      ? "✓ Caja Cuadrada"
                      : `Diferencia de ${
                          diferenciaNegativa ? "falta" : "sobrante"
                        }: $${Math.abs(diferencia).toLocaleString()}`}
                  </p>
                  <p
                    className={`text-[10px] ${
                      diferenciaBuena
                        ? "text-green-700"
                        : diferenciaNegativa
                          ? "text-red-700"
                          : "text-yellow-700"
                    }`}
                  >
                    Esperado: ${balance.saldoEsperado.toLocaleString()} |
                    Físico: ${parseFloat(efectivoFisico || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {/* Input: Notas */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notas (Opcional)
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: Hubo un cliente con cambio..."
                rows="2"
                className="w-full px-4 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-400 focus:bg-white text-gray-900 text-sm resize-none"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-all duration-200 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 active:scale-95"
                }`}
              >
                {loading ? "Cerrando turno..." : "Cerrar Turno"}
              </button>
            </div>
          </form>

          {/* Footer: Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              📌 El cierre será guardado en el historial. Tu turno se bloqueará
              automáticamente.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
