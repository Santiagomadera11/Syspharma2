import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  AlertCircle,
  DollarSign,
  Clock,
  User,
} from "lucide-react";
import { turnService } from "../sales/services/turnService";
import { OpenShiftModal } from "../sales/components/OpenShiftModal";
import { CloseShiftModal } from "../sales/components/CloseShiftModal";
import { ToastNotification } from "../../shared/ui/ToastNotification";

// Mock de 20 ventas para prueba
const mockSales = [
  {
    id: 1001,
    hora: "09:30",
    cliente: "Juan Pérez",
    cantidadProductos: 3,
    metodoPago: "Efectivo",
    total: 22000,
    estado: "completada",
  },
  {
    id: 1002,
    hora: "09:45",
    cliente: "María García",
    cantidadProductos: 1,
    metodoPago: "Tarjeta débito",
    total: 19500,
    estado: "completada",
  },
  {
    id: 1003,
    hora: "10:15",
    cliente: "Carlos López",
    cantidadProductos: 2,
    metodoPago: "Efectivo",
    total: 27000,
    estado: "completada",
  },
  {
    id: 1004,
    hora: "10:45",
    cliente: "Ana Martínez",
    cantidadProductos: 1,
    metodoPago: "Transferencia",
    total: 35000,
    estado: "completada",
  },
  {
    id: 1005,
    hora: "11:20",
    cliente: "Pedro Rodríguez",
    cantidadProductos: 3,
    metodoPago: "Tarjeta crédito",
    total: 36000,
    estado: "completada",
  },
  {
    id: 1006,
    hora: "12:00",
    cliente: "Laura Sánchez",
    cantidadProductos: 2,
    metodoPago: "Efectivo",
    total: 18500,
    estado: "completada",
  },
  {
    id: 1007,
    hora: "12:30",
    cliente: "Diego Fernández",
    cantidadProductos: 4,
    metodoPago: "Tarjeta débito",
    total: 42000,
    estado: "completada",
  },
  {
    id: 1008,
    hora: "13:15",
    cliente: "Sofía Ruiz",
    cantidadProductos: 1,
    metodoPago: "Efectivo",
    total: 15000,
    estado: "completada",
  },
  {
    id: 1009,
    hora: "14:00",
    cliente: "Alejandro Morales",
    cantidadProductos: 2,
    metodoPago: "Transferencia",
    total: 28500,
    estado: "devolucion",
  },
  {
    id: 1010,
    hora: "14:45",
    cliente: "Isabella Cruz",
    cantidadProductos: 3,
    metodoPago: "Tarjeta crédito",
    total: 31000,
    estado: "completada",
  },
  {
    id: 1011,
    hora: "15:20",
    cliente: "Javier Torres",
    cantidadProductos: 2,
    metodoPago: "Efectivo",
    total: 24000,
    estado: "completada",
  },
  {
    id: 1012,
    hora: "15:50",
    cliente: "Elena Vargas",
    cantidadProductos: 1,
    metodoPago: "Tarjeta débito",
    total: 12500,
    estado: "completada",
  },
  {
    id: 1013,
    hora: "16:30",
    cliente: "Roberto Jiménez",
    cantidadProductos: 3,
    metodoPago: "Efectivo",
    total: 33000,
    estado: "completada",
  },
  {
    id: 1014,
    hora: "17:00",
    cliente: "Carmen López",
    cantidadProductos: 2,
    metodoPago: "Transferencia",
    total: 26000,
    estado: "completada",
  },
  {
    id: 1015,
    hora: "17:40",
    cliente: "Miguel Ángel",
    cantidadProductos: 1,
    metodoPago: "Tarjeta crédito",
    total: 20000,
    estado: "completada",
  },
  {
    id: 1016,
    hora: "18:15",
    cliente: "Patricia Gómez",
    cantidadProductos: 4,
    metodoPago: "Efectivo",
    total: 44000,
    estado: "completada",
  },
  {
    id: 1017,
    hora: "18:50",
    cliente: "Francisco Ramos",
    cantidadProductos: 2,
    metodoPago: "Tarjeta débito",
    total: 29500,
    estado: "completada",
  },
  {
    id: 1018,
    hora: "19:20",
    cliente: "Margarita Soto",
    cantidadProductos: 1,
    metodoPago: "Efectivo",
    total: 17000,
    estado: "completada",
  },
  {
    id: 1019,
    hora: "19:50",
    cliente: "Guillermo Díaz",
    cantidadProductos: 3,
    metodoPago: "Transferencia",
    total: 38500,
    estado: "completada",
  },
  {
    id: 1020,
    hora: "20:30",
    cliente: "Rosario Medina",
    cantidadProductos: 2,
    metodoPago: "Tarjeta crédito",
    total: 25000,
    estado: "completada",
  },
];

// Mock de gastos
const mockExpenses = [
  {
    id: 2001,
    descripcion: "Alquiler de local",
    monto: 500000,
    categoria: "Arriendo",
  },
  {
    id: 2002,
    descripcion: "Suministros de limpieza",
    monto: 50000,
    categoria: "Mantenimiento",
  },
  {
    id: 2003,
    descripcion: "Café para el personal",
    monto: 30000,
    categoria: "Comida",
  },
];

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
  const [sales] = useState(mockSales);
  const [expenses] = useState(mockExpenses);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isExpensesModalOpen, setIsExpensesModalOpen] = useState(false);

  const itemsPerPage = 20;

  // Verificar turno activo al cargar
  useEffect(() => {
    const activeTurn = turnService.getActiveTurn();
    if (activeTurn) {
      setCurrentTurn(activeTurn);
    } else {
      setShowOpenShiftModal(true);
    }
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

  // Métricas
  const totalSales = useMemo(
    () => sales.reduce((sum, s) => sum + (s.total || 0), 0),
    [sales],
  );
  const totalProductsSold = useMemo(
    () => sales.reduce((sum, s) => sum + (s.cantidadProductos || 0), 0),
    [sales],
  );
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, e) => sum + (e.monto || 0), 0),
    [expenses],
  );

  // Filtrado y paginación
  const filteredSales = sales.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.cliente.toLowerCase().includes(term) ||
      String(s.id).includes(term) ||
      s.metodoPago.toLowerCase().includes(term)
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
        </div>
      </div>

      {/* Tabla de ventas */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
        <div className="overflow-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-blue-600 text-white uppercase sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 font-semibold">Código</th>
                <th className="px-3 py-3 font-semibold">Hora</th>
                <th className="px-3 py-3 font-semibold">Cliente</th>
                <th className="px-3 py-3 font-semibold text-center">Piezas</th>
                <th className="px-3 py-3 font-semibold">Método</th>
                <th className="px-3 py-3 font-semibold text-right">Total</th>
                <th className="px-3 py-3 font-semibold text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayedSales.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-3 py-8 text-center text-gray-400"
                  >
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                displayedSales.map((sale) => (
                  <tr
                    key={sale.id}
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
                      ${sale.total.toLocaleString()}
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
      />

      <CloseShiftModal
        isOpen={showCloseShiftModal}
        onShiftClosed={handleShiftClosed}
        onClose={() => setShowCloseShiftModal(false)}
        user={user}
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
