import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, DollarSign, Eye, ChevronLeft, ChevronRight,
  ShoppingCart, TrendingUp, AlertCircle, Receipt, ArrowUpRight,
} from "lucide-react";
import { salesService } from "./services/salesService";
import { SaleDetailModal } from "./components/SaleDetailModal";
import { ToastNotification } from "../../shared/ui/ToastNotification";

const ESTADO_CONFIG = {
  completada: { label: "Completada", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  devolucion: { label: "Devolución", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  anulada: { label: "Anulada", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  pendiente: { label: "Pendiente", bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
};

const KPICard = ({ icon: Icon, label, value, sub, color, onAction, actionLabel }) => (
  <div className="relative bg-white rounded-2xl p-5 border border-gray-100 shadow-sm overflow-hidden">
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 -translate-y-6 translate-x-6 ${color}`} />
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-opacity-15`}>
        <Icon size={18} className={color.replace("bg-", "text-")} />
      </div>
      {onAction && (
        <button onClick={onAction} className="text-[10px] font-bold text-gray-400 hover:text-gray-600 flex items-center gap-0.5">
          {actionLabel} <ArrowUpRight size={10} />
        </button>
      )}
    </div>
    <div className="text-2xl font-black text-gray-900 tracking-tight">{value}</div>
    <div className="text-xs font-semibold text-gray-500 mt-0.5">{label}</div>
    {sub && <div className="text-[10px] text-gray-400 mt-1">{sub}</div>}
  </div>
);

export const SalesPage = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("todos");
  const [currentPage, setCurrentPage] = useState(0);
  const [isSaleDetailOpen, setIsSaleDetailOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [toast, setToast] = useState(null);
  const itemsPerPage = 15;

  const fmt = (v) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

  const loadSales = useCallback(async () => {
    try {
      const data = await salesService.getAll();
      setSales(Array.isArray(data) ? data : []);
    } catch { setSales([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadSales();
    const handleSync = () => loadSales();
    window.addEventListener("sales:changed", handleSync);
    const interval = setInterval(loadSales, 10000);
    return () => {
      window.removeEventListener("sales:changed", handleSync);
      clearInterval(interval);
    };
  }, [loadSales]);

  const totalSales = useMemo(() => sales.reduce((sum, s) => sum + (s.total || 0), 0), [sales]);
  const totalProductsSold = useMemo(() => sales.reduce((sum, s) =>
    sum + (s.detalles || []).reduce((a, d) => a + d.cantidad, 0), 0), [sales]);
  const ventasHoy = useMemo(() => {
    const today = new Date().toLocaleDateString("es-CO");
    return sales.filter(s => s.fechaVenta ? new Date(s.fechaVenta).toLocaleDateString("es-CO") === today : false).length;
  }, [sales]);

  const filteredSales = useMemo(() => sales.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      (s?.clienteNombre || "").toLowerCase().includes(term) ||
      String(s?.numeroVenta || "").toLowerCase().includes(term) ||
      (s?.metodopagoNombre || s?.metodoPagoNombre || "").toLowerCase().includes(term);
    const matchEstado = filterEstado === "todos" || s?.estadoNombre?.toLowerCase() === filterEstado;
    return matchSearch && matchEstado;
  }), [sales, searchTerm, filterEstado]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const displayedSales = filteredSales.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const getEstadoConfig = (estadoNombre) => {
    const key = (estadoNombre || "").toLowerCase();
    return ESTADO_CONFIG[key] || { label: estadoNombre, bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400" };
  };

  return (
    <div className="h-full flex flex-col gap-4 font-sans">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">Ventas</h1>
          <p className="text-xs text-gray-400 mt-0.5">Registro y seguimiento de ventas</p>
        </div>
        <button onClick={() => navigate("/admin/ventas/nueva")}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all">
          <Plus size={14} /> Nueva venta
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
        <KPICard icon={ShoppingCart} label="Total ventas" value={fmt(totalSales)} sub={`${totalProductsSold} productos vendidos`} color="bg-blue-500" />
        <KPICard icon={Receipt} label="Ventas de hoy" value={ventasHoy} sub="Registradas hoy" color="bg-emerald-500" />
        <KPICard icon={TrendingUp} label="Total registros" value={sales.length} sub="En el sistema" color="bg-purple-500" />
      </div>

      <div className="flex gap-2 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input type="text" placeholder="Buscar por cliente, número de venta o método de pago..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-200 text-xs bg-white"
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }} />
        </div>
        <select value={filterEstado} onChange={(e) => { setFilterEstado(e.target.value); setCurrentPage(0); }}
          className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none text-xs bg-white">
          <option value="todos">Todos los estados</option>
          <option value="completada">Completadas</option>
          <option value="devolucion">Devoluciones</option>
          <option value="anulada">Anuladas</option>
          <option value="pendiente">Pendientes</option>
        </select>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["#", "Fecha", "Cliente", "Productos", "Método Pago", "Total", "Estado", "Ver"].map(h => (
                  <th key={h} className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-16 text-center text-gray-400 text-sm">Cargando ventas...</td></tr>
              ) : displayedSales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <Receipt size={24} className="text-gray-300" />
                      </div>
                      <p className="text-sm font-semibold text-gray-400">No hay ventas registradas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedSales.map((sale, idx) => {
                  const estado = getEstadoConfig(sale.estadoNombre);
                  const totalProductos = (sale.detalles || []).reduce((a, d) => a + d.cantidad, 0);
                  return (
                    <tr key={sale?.id ?? idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3"><span className="text-xs font-mono font-bold text-gray-400">{sale.numeroVenta}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {sale.fechaVenta ? new Date(sale.fechaVenta).toLocaleDateString("es-CO") : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-black flex-shrink-0">
                            {(sale.clienteNombre || "?")[0].toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-gray-800 truncate max-w-[120px]">{sale.clienteNombre || "Consumidor Final"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg">{totalProductos}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md font-medium">{sale.metodoPagoNombre || "-"}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-black text-gray-900">{fmt(sale.total)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${estado.bg} ${estado.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${estado.dot}`} />
                          {estado.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => { setSelectedSale(sale); setIsSaleDetailOpen(true); }}
                          className="w-7 h-7 bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 text-gray-400 hover:text-emerald-600 rounded-lg flex items-center justify-center mx-auto transition-all">
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredSales.length > 0 && (
          <div className="border-t border-gray-100 px-4 py-2.5 bg-gray-50/50 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] text-gray-400">{filteredSales.length} ventas · Página {currentPage + 1} de {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))} disabled={currentPage === 0}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-all">
                <ChevronLeft size={13} />
              </button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-all">
                <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}
      </div>

      <SaleDetailModal isOpen={isSaleDetailOpen} onClose={() => { setIsSaleDetailOpen(false); setSelectedSale(null); }} sale={selectedSale} />
      {toast && <ToastNotification message={toast.message} type={toast.type} zIndex={toast.zIndex} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SalesPage;