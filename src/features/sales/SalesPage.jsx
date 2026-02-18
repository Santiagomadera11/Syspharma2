import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  DollarSign,
  Eye,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  TrendingUp,
  AlertCircle,
  History,
} from "lucide-react";
import { RegisterExpenseModal } from "./components/RegisterExpenseModal";
import { ExpensesModal } from "./components/ExpensesModal";
import { turnService } from "./services/turnService";
import { ordersService } from "./orders/services/ordersService";
import { expensesService } from "./services/expensesService";
import { salesService } from "./services/salesService";
import { OpenShiftModal } from "./components/OpenShiftModal";
import { CloseShiftModal } from "./components/CloseShiftModal";
import { SaleDetailModal } from "./components/SaleDetailModal";
import { ToastNotification } from "../../shared/ui/ToastNotification";

export const SalesPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("syspharma_user") || "{}");
  const [sales, setSales] = useState(() => salesService.getAll());
  const [expenses, setExpenses] = useState(expensesService.getTodayExpenses());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);
  const [isRegisterExpenseModalOpen, setIsRegisterExpenseModalOpen] =
    useState(false);
  const [isSaleDetailOpen, setIsSaleDetailOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [toast, setToast] = useState(null);

  const itemsPerPage = 20;

  // Verificar turno activo al cargar y actualizar ventas
  useEffect(() => {
    const activeTurn = turnService.getActiveTurn();
    if (activeTurn) {
      setCurrentTurn(activeTurn);
    }
    // Recargar ventas desde BD
    setSales(salesService.getAll());
    setExpenses(expensesService.getTodayExpenses());

    // Escuchar cuando se abre un turno
    const handleTurnOpened = (event) => {
      const newTurn = event.detail;
      setCurrentTurn(newTurn);
    };

    // Escuchar cuando se cierra un turno
    const handleTurnClosed = () => {
      setCurrentTurn(null);
    };

    // Escuchar eventos de sincronización
    const handleSync = () => {
      setSales(salesService.getAll());
      setExpenses(expensesService.getTodayExpenses());
    };

    // Refrescar datos cuando la ventana regresa al foco
    const handleFocus = () => {
      setSales(salesService.getAll());
      setExpenses(expensesService.getTodayExpenses());
    };

    window.addEventListener("turn:opened", handleTurnOpened);
    window.addEventListener("turn:closed", handleTurnClosed);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("sales:changed", handleSync);
    window.addEventListener("expenses:changed", handleSync);

    // Actualizar datos cada 2 segundos para sincronización en tiempo real
    const interval = setInterval(() => {
      setSales(salesService.getAll());
      setExpenses(expensesService.getTodayExpenses());
    }, 2000);

    return () => {
      window.removeEventListener("turn:opened", handleTurnOpened);
      window.removeEventListener("turn:closed", handleTurnClosed);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("sales:changed", handleSync);
      window.removeEventListener("expenses:changed", handleSync);
      clearInterval(interval);
    };
  }, []);

  const handleShiftOpened = (newTurn) => {
    setCurrentTurn(newTurn);
    setShowOpenShiftModal(false);
  };

  const handleShiftClosed = (closedTurn) => {
    setCurrentTurn(null);
    setShowCloseShiftModal(false);
    setToast({
      message: `Turno cerrado. Diferencia: $${closedTurn.diferencia}`,
      type: closedTurn.diferencia === 0 ? "success" : "warning",
      zIndex: 70,
    });
    // Redirige al login después de 2 segundos
    setTimeout(() => {
      navigate("/login");
    }, 2000);
  };

  const handleNewSale = () => {
    // Solo empleados deben validar turno
    if (user.rol !== "Administrador") {
      const validation = turnService.validateOperationAllowed();
      if (!validation.valid) {
        setToast({
          message: validation.message,
          type: "error",
          zIndex: 70,
        });
        return;
      }
    }
    navigate("/admin/ventas/nueva");
  };

  const handleDeleteSale = (id) => {
    if (window.confirm("¿Eliminar venta?")) {
      alert("Venta eliminada");
    }
  };

  const handleReturnSale = (id) => {
    alert("Venta marcada como devolución");
  };

  const handleOpenSaleDetail = (sale) => {
    setSelectedSale(sale);
    setIsSaleDetailOpen(true);
  };

  // Métricas dinámicas
  const totalSales = useMemo(() => {
    const allSales = salesService.getAll();
    return allSales.reduce((sum, s) => sum + (s.total || 0), 0);
  }, [sales]);
  const totalProductsSold = useMemo(() => {
    const allSales = salesService.getAll();
    return allSales.reduce((sum, s) => sum + (s.cantidadProductos || 0), 0);
  }, [sales]);
  const totalExpenses = useMemo(() => {
    const todayExpenses = expensesService.getTodayExpenses();
    return todayExpenses.reduce((sum, e) => sum + (e.monto || 0), 0);
  }, [expenses]);
  const netProfit = totalSales - totalExpenses;

  // Filtrado y paginación
  const filteredSales = sales.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      (s?.cliente || "").toLowerCase().includes(term) ||
      String(s?.id || "").includes(term) ||
      (s?.metodoPago || "").toLowerCase().includes(term)
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
      <div className="flex items-start justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Punto de venta</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Selecciona productos para agregar a la venta
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              // Solo empleados deben validar turno
              if (user.rol !== "Administrador") {
                const validation = turnService.validateOperationAllowed();
                if (!validation.valid) {
                  setToast({
                    message: validation.message,
                    type: "error",
                    zIndex: 70,
                  });
                  return;
                }
              }
              setIsRegisterExpenseModalOpen(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus size={16} />
            Registrar gasto
          </button>
          <button
            onClick={() => setShowCloseShiftModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold shadow-sm text-xs flex items-center gap-1.5 transition-all"
          >
            <DollarSign size={16} />
            Cerrar caja
          </button>
        </div>
      </div>

      {/* Cards - KPIs */}
      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
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
            <button
              onClick={() => setIsExpensesModalOpen(true)}
              className="text-[10px] text-orange-600 hover:text-orange-700 font-semibold hover:underline"
            >
              Detalle
            </button>
          </div>
        </div>

        {/* Card 3: Ganancias netas */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-emerald-600" size={18} />
            <h3 className="text-sm font-bold text-gray-800">
              Ganancias netas del día
            </h3>
          </div>
          <div className="text-2xl font-bold text-emerald-600">
            ${netProfit.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Ventas - Gastos</div>
        </div>
      </div>

      {/* Búsqueda y botón nueva venta */}
      <div className="flex gap-2 flex-shrink-0">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar por cliente, código o método de pago..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-300 text-xs bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300 text-xs bg-white"
          defaultValue="todos"
        >
          <option value="todos">Todos los estados</option>
          <option value="completada">Completadas</option>
          <option value="devolucion">Devoluciones</option>
        </select>
        <button
          onClick={handleNewSale}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm text-xs flex items-center gap-1.5 transition-all"
        >
          <Plus size={16} />
          Nueva venta
        </button>
      </div>

      {/* Tabla de ventas */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
        <div className="overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-600 text-white text-xs uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 font-semibold">Código</th>
                <th className="px-3 py-3 font-semibold">Hora</th>
                <th className="px-3 py-3 font-semibold">Cliente</th>
                <th className="px-3 py-3 font-semibold text-center">
                  Productos
                </th>
                <th className="px-3 py-3 font-semibold">Método pago</th>
                <th className="px-3 py-3 font-semibold text-right">Total</th>
                <th className="px-3 py-3 font-semibold text-center">Estado</th>
                <th className="px-3 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
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
                displayedSales.map((sale, idx) => (
                  <tr
                    key={sale?.id ?? `sale-${idx}`}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-2.5 text-xs font-mono font-semibold text-gray-700">
                      {sale.id}
                    </td>
                    <td className="px-3 py-2.5">{sale.hora}</td>
                    <td className="px-3 py-2.5 font-medium">{sale.cliente}</td>
                    <td className="px-3 py-2.5 text-center font-semibold">
                      {sale.cantidadProductos}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">
                      {sale.metodoPago}
                    </td>
                    <td className="px-3 py-2.5 font-bold text-emerald-600 text-right">
                      ${((sale && sale.total) || 0).toLocaleString()}
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
                          onClick={() => handleOpenSaleDetail(sale)}
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
              Mostrando página {currentPage + 1} de {totalPages} (
              {filteredSales.length} ventas)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => currentPage > 0 && setCurrentPage((p) => p - 1)}
                disabled={currentPage === 0}
                className="p-1 rounded bg-white border border-gray-200 disabled:opacity-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() =>
                  currentPage < totalPages - 1 && setCurrentPage((p) => p + 1)
                }
                disabled={currentPage === totalPages - 1}
                className="p-1 rounded bg-white border border-gray-200 disabled:opacity-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para registrar gasto */}
      <RegisterExpenseModal
        isOpen={isRegisterExpenseModalOpen}
        onClose={() => setIsRegisterExpenseModalOpen(false)}
        onSaveSuccess={() => {
          // Aquí puedes agregar lógica adicional si es necesaria
        }}
      />

      {/* Modal para ver gastos */}
      <ExpensesModal
        isOpen={isExpensesModalOpen}
        onClose={() => setIsExpensesModalOpen(false)}
      />

      {/* Modal de Apertura de Turno */}
      <OpenShiftModal
        isOpen={showOpenShiftModal}
        onShiftOpened={handleShiftOpened}
        user={user}
      />

      {/* Modal de Cierre de Turno */}
      <CloseShiftModal
        isOpen={showCloseShiftModal}
        onShiftClosed={handleShiftClosed}
        onClose={() => setShowCloseShiftModal(false)}
        user={user}
      />

      {/* Modal de Detalle de Venta */}
      <SaleDetailModal
        isOpen={isSaleDetailOpen}
        onClose={() => {
          setIsSaleDetailOpen(false);
          setSelectedSale(null);
        }}
        sale={selectedSale}
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

export default SalesPage;
