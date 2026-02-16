import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, ChevronLeft, ChevronRight, ShoppingCart, AlertCircle, DollarSign, Clock, User } from "lucide-react";
import { turnService } from "../sales/services/turnService";
import { ordersService } from "../sales/orders/services/ordersService";
import { expensesService } from "../sales/services/expensesService";
import { salesService } from "../sales/services/salesService";
import { RegisterExpenseModal } from "../sales/components/RegisterExpenseModal";
import { OpenShiftModal } from "../sales/components/OpenShiftModal";
import { CloseShiftModal } from "../sales/components/CloseShiftModal";
import { OrderDetailModal } from "../sales/orders/components/OrderDetailModal";
import { ToastNotification } from "../../shared/ui/ToastNotification";

/**
 * EmployeeSalesPage - Vista AZUL de Ventas para Empleados
 * - Apertura/Cierre de turno
 * - Listado de ventas del día
 * - Cierre con comparación de efectivo
 */
export const EmployeeSalesPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("syspharma_user") || "{}");

  // Estados principales
  const [sales, setSales] = useState(() => salesService.getAll());
  const [expenses, setExpenses] = useState(expensesService.getTodayExpenses());
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
  const [isRegisterExpenseModalOpen, setIsRegisterExpenseModalOpen] =
    useState(false);
  const [isSaleDetailOpen, setIsSaleDetailOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const itemsPerPage = 20;

  // Verificar turno activo al cargar
  useEffect(() => {
    const activeTurn = turnService.getActiveTurn();
    if (activeTurn) {
      setCurrentTurn(activeTurn);
    }
    // Recargar ventas desde BD
    setSales(salesService.getAll());
    setExpenses(expensesService.getTodayExpenses());

    // Refrescar datos cuando la ventana regresa al foco
    const handleFocus = () => {
      setSales(salesService.getAll());
      setExpenses(expensesService.getTodayExpenses());
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleShiftOpened = (newTurn) => {
    setCurrentTurn(newTurn);
    setShowOpenShiftModal(false);
    setToast({
      message: `Turno abierto con $${newTurn.montoBase.toLocaleString()}`,
      type: "success",
      zIndex: 70,
    });
  };

  const handleShiftClosed = (closedTurn) => {
    setCurrentTurn(null);
    setShowCloseShiftModal(false);
    setToast({
      message: `Turno cerrado. Diferencia: $${closedTurn.diferencia.toLocaleString()}`,
      type: closedTurn.diferencia === 0 ? "success" : "warning",
      zIndex: 70,
    });
    // Redirige al login después de 2 segundos
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  const handleNewSale = () => {
    // Intercepción: Solo empleados deben chequear turno
    if (user.rol !== "Administrador" && !turnService.hasActiveTurn()) {
      setShowOpenShiftModal(true);
      return;
    }
    navigate("/employee/ventas/nueva");
  };

  // Métricas dinámicas
  const totalSales = useMemo(() => {
    const allSales = ordersService
      .getAll()
      .filter((o) => o.estado === "Entregada");
    return allSales.reduce((sum, s) => sum + (s.total || 0), 0);
  }, [sales]);
  const totalProductsSold = useMemo(() => {
    const allSales = ordersService
      .getAll()
      .filter((o) => o.estado === "Entregada");
    return allSales.reduce((sum, s) => sum + (s.cantidadProductos || 0), 0);
  }, [sales]);
  const totalExpenses = useMemo(() => {
    const todayExpenses = expensesService.getTodayExpenses();
    return todayExpenses.reduce((sum, e) => sum + (e.monto || 0), 0);
  }, [expenses]);

  // Filtrado y paginación
  const filteredSales = sales.filter((s) => {
    const term = (searchTerm || "").toLowerCase();
    const cliente = (s?.cliente || "").toLowerCase();
    const metodo = (s?.metodoPago || "").toLowerCase();
    return (
      cliente.includes(term) ||
      String(s?.id || "").includes(term) ||
      metodo.includes(term)
    );
  });

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const displayedSales = filteredSales.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  return (
    <div className="h-full flex flex-col gap-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Ventas</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Panel de ventas del empleado {user.nombre}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setIsRegisterExpenseModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm text-xs flex items-center gap-1.5 transition-all"
            >
              <Plus size={16} />
              Registrar gasto
            </button>
            <button
              onClick={() => setShowCloseShiftModal(true)}
              disabled={!currentTurn}
              className={`px-4 py-2 rounded-lg font-bold shadow-sm text-xs flex items-center gap-1.5 transition-all ${
                currentTurn
                  ? "bg-purple-600 hover:bg-purple-700 text-white active:scale-95"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <DollarSign size={16} />
              Cerrar Turno
            </button>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
            <Clock size={16} className="text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">Estado Turno</p>
              <p className="text-sm font-bold text-blue-600">
                {currentTurn ? "✓ Activo" : "✗ Cerrado"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards - KPIs */}
      <div className="grid grid-cols-2 gap-3 flex-shrink-0">
        {/* Card 1: Ventas brutas */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-cyan-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="text-cyan-600" size={18} />
            <h3 className="text-sm font-bold text-gray-800">
              Ventas brutas del día
            </h3>
          </div>
          <div className="text-2xl font-bold text-cyan-600">
            ${totalSales.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {totalProductsSold} productos vendidos
          </div>
        </div>

        {/* Card 2: Gastos */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-orange-600" size={18} />
            <h3 className="text-sm font-bold text-gray-800">Gastos del día</h3>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            ${totalExpenses.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-1">
            <div className="text-xs text-gray-500">
              {expenses.length} gastos realizados
            </div>
          </div>
        </div>
      </div>

      {/* Botones de Acción y Búsqueda */}
      <div className="flex gap-2 flex-shrink-0 items-center">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar cliente, código o método de pago..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-xs bg-white"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>

        <div className="flex gap-2">
          <select
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-xs bg-white"
            defaultValue="todos"
          >
            <option value="todos">Todos los estados</option>
            <option value="completada">Completadas</option>
            <option value="devolucion">Devoluciones</option>
          </select>
          <button
            onClick={handleNewSale}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus size={16} />
            Nueva venta
          </button>
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
        <div className="overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-blue-600 text-white uppercase sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 font-semibold">Código</th>
                <th className="px-3 py-3 font-semibold">Hora</th>
                <th className="px-3 py-3 font-semibold">Cliente</th>
                <th className="px-3 py-3 font-semibold text-center">
                  Productos
                </th>
                <th className="px-3 py-3 font-semibold">Método</th>
                <th className="px-3 py-3 font-semibold text-right">Total</th>
                <th className="px-3 py-3 font-semibold text-center">Estado</th>
                <th className="px-3 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedSales.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-3 py-8 text-center text-gray-400"
                  >
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                displayedSales.map((sale, _idx) => (
                  <tr
                    key={sale?.id ?? `sale-${_idx}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-2.5 font-mono text-gray-700">
                      {sale.id}
                    </td>
                    <td className="px-3 py-2.5">{sale.hora}</td>
                    <td className="px-3 py-2.5 font-medium">{sale.cliente}</td>
                    <td className="px-3 py-2.5 text-center font-semibold">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        {sale.cantidadProductos}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">
                      {sale.metodoPago}
                    </td>
                    <td className="px-3 py-2.5 font-bold text-emerald-600 text-right">
                      ${Number(sale.total || 0).toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          sale.estado === "completada"
                            ? "bg-green-100 text-green-700"
                            : sale.estado === "devolucion"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {sale.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedSale(sale);
                            setIsSaleDetailOpen(true);
                          }}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded-md border border-blue-200"
                          title="Ver detalle"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredSales.length > 0 && (
          <div className="border-t border-gray-100 p-3 bg-gray-50 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] text-gray-500 font-medium">
              Página {currentPage + 1} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => currentPage > 0 && setCurrentPage((p) => p - 1)}
                disabled={currentPage === 0}
                className="p-1 rounded bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-100"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() =>
                  currentPage < totalPages - 1 && setCurrentPage((p) => p + 1)
                }
                disabled={currentPage === totalPages - 1}
                className="p-1 rounded bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-100"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modales */}
      <OpenShiftModal
        isOpen={showOpenShiftModal}
        onShiftOpened={handleShiftOpened}
        user={user}
        canClose={user.rol === "Administrador"}
        onCancel={() => setShowOpenShiftModal(false)}
      />

      <CloseShiftModal
        isOpen={showCloseShiftModal}
        onShiftClosed={handleShiftClosed}
        onClose={() => setShowCloseShiftModal(false)}
        user={user}
      />

      <RegisterExpenseModal
        isOpen={isRegisterExpenseModalOpen}
        onClose={() => setIsRegisterExpenseModalOpen(false)}
        onSaveSuccess={() => {
          setExpenses(expensesService.getTodayExpenses());
        }}
      />

      {/* Modal de Detalle */}
      <OrderDetailModal
        isOpen={isSaleDetailOpen}
        onClose={() => {
          setIsSaleDetailOpen(false);
          setSelectedSale(null);
        }}
        order={selectedSale}
      />

      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          zIndex={toast.zIndex}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default EmployeeSalesPage;
