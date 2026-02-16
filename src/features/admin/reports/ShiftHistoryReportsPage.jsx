import React, { useState, useMemo } from "react";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Stethoscope,
  Eye,
  Download,
} from "lucide-react";
import { turnService } from "../../sales/services/turnService";

export const ShiftHistoryReportsPage = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedShift, setSelectedShift] = useState(null);

  // Obtener historial de turnos cerrados
  const shifts = turnService.getTurnsHistory();

  // Filtrar por fecha
  const filteredShifts = useMemo(() => {
    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.horaCierre).toISOString().split("T")[0];
      if (startDate && shiftDate < startDate) return false;
      if (endDate && shiftDate > endDate) return false;
      return true;
    });
  }, [shifts, startDate, endDate]);

  // Calcular totales
  const totalSummary = useMemo(() => {
    return filteredShifts.reduce(
      (acc, shift) => ({
        totalClosed: acc.totalClosed + 1,
        totalRevenue: acc.totalRevenue + (shift.totalVentas || 0),
        totalExpenses: acc.totalExpenses + (shift.totalGastos || 0),
        productSales: acc.productSales + 0, // Se obtendría de datos individuales
        serviceSales: acc.serviceSales + 0,
      }),
      {
        totalClosed: 0,
        totalRevenue: 0,
        totalExpenses: 0,
        productSales: 0,
        serviceSales: 0,
      },
    );
  }, [filteredShifts]);

  // Obtener desglose de un turno específico
  const getShiftBreakdown = (turnId) => {
    const sales = turnService.getUserSales(turnId);
    const productRevenue = sales
      .filter((s) => s.categoria === "producto")
      .reduce((sum, s) => sum + (s.monto || 0), 0);
    const serviceRevenue = sales
      .filter((s) => s.categoria === "servicio")
      .reduce((sum, s) => sum + (s.monto || 0), 0);

    return { productRevenue, serviceRevenue };
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString("es-CO");
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString("es-CO");
  };

  return (
    <div className="h-full flex flex-col gap-4 font-sans text-gray-800 p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Histórico de Turnos
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Reportes de cajas cerradas con desglose de ingresos
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          <Download size={16} />
          Descargar Excel
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 flex-shrink-0 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Desde
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Hasta
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-semibold"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Turnos Cerrados</p>
              <p className="text-2xl font-bold text-gray-800">
                {totalSummary.totalClosed}
              </p>
            </div>
            <Calendar className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Ingresos Totales</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(totalSummary.totalRevenue)}
              </p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Gastos Totales</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(totalSummary.totalExpenses)}
              </p>
            </div>
            <TrendingDown className="text-red-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Balance Neto</p>
              <p className="text-lg font-bold text-indigo-600">
                {formatCurrency(
                  totalSummary.totalRevenue - totalSummary.totalExpenses,
                )}
              </p>
            </div>
            <DollarSign className="text-indigo-600" size={32} />
          </div>
        </div>
      </div>

      {/* TABLA DE TURNOS */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="border-b border-gray-200">
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                  ID
                </th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                  Empleado
                </th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                  Fecha Apertura
                </th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                  Fecha Cierre
                </th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                  Monto Base
                </th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                  Ingresos
                </th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                  Gastos
                </th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                  Saldo
                </th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredShifts.length > 0 ? (
                filteredShifts.map((shift) => (
                  <tr
                    key={shift.turnId}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 text-xs text-gray-600 font-mono">
                      {shift.turnId}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-700 font-semibold">
                      {shift.userName}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {formatDate(shift.horaApertura)}
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {formatDate(shift.horaCierre)}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-gray-700">
                      {formatCurrency(shift.montoBase)}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-green-600">
                      {formatCurrency(shift.totalVentas)}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold text-red-600">
                      {formatCurrency(shift.totalGastos)}
                    </td>
                    <td className="py-3 px-4 text-xs font-bold text-indigo-600">
                      {formatCurrency(
                        shift.montoBase + shift.totalVentas - shift.totalGastos,
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <button
                        onClick={() => setSelectedShift(shift)}
                        className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-semibold"
                      >
                        <Eye size={14} />
                        Ver Desglose
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="py-6 text-center text-gray-500 text-sm"
                  >
                    No hay turnos en el período seleccionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DESGLOSE */}
      {selectedShift && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Desglose: {selectedShift.userName} -{" "}
                {formatDate(selectedShift.horaCierre)}
              </h2>
              <button
                onClick={() => setSelectedShift(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Resumen General */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <DollarSign size={18} />
                  Resumen Financiero
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Monto Base</p>
                    <p className="text-lg font-bold text-gray-800">
                      {formatCurrency(selectedShift.montoBase)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Ventas</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(selectedShift.totalVentas)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Gastos</p>
                    <p className="text-lg font-bold text-red-600">
                      {formatCurrency(selectedShift.totalGastos)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Saldo Esperado</p>
                    <p className="text-lg font-bold text-indigo-600">
                      {formatCurrency(
                        selectedShift.montoBase +
                          selectedShift.totalVentas -
                          selectedShift.totalGastos,
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desglose de Ventas */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <Package size={18} />
                  Desglose de Ingresos por Categoría
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center bg-white p-2 rounded">
                    <span className="font-semibold text-gray-700">
                      Ventas de Productos
                    </span>
                    <span className="text-green-600 font-bold">
                      {formatCurrency(selectedShift.ventasProductos || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded">
                    <span className="font-semibold text-gray-700">
                      Ventas de Servicios
                    </span>
                    <span className="text-blue-600 font-bold">
                      {formatCurrency(selectedShift.ventasServicios || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Información de Cierre */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3">
                  Información de Cierre
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Monto Físico Reportado
                    </span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(selectedShift.montoFinal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diferencia</span>
                    <span
                      className={`font-semibold ${
                        selectedShift.diferencia === 0
                          ? "text-green-600"
                          : selectedShift.diferencia > 0
                            ? "text-red-600"
                            : "text-orange-600"
                      }`}
                    >
                      {formatCurrency(selectedShift.diferencia || 0)}
                    </span>
                  </div>
                  {selectedShift.notas && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Notas</span>
                      <span className="text-gray-700">
                        {selectedShift.notas}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedShift(null)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
