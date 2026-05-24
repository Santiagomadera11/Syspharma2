import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Plus, DollarSign, Eye, ChevronLeft, ChevronRight,
  ShoppingCart, TrendingUp, Receipt, Package
} from "lucide-react";
import { salesService } from "./services/salesService";
import { SaleDetailModal } from "./components/SaleDetailModal";
import { ToastNotification } from "../../shared/ui/ToastNotification";

const ESTADO_CONFIG = {
  completada: { label: "Completada", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  devolucion: { label: "Devolución", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

const KPICard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-3">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color} bg-opacity-20`}>
      <Icon size={16} className={color.replace("bg-", "text-")} />
    </div>
    <div>
      <div className="text-lg font-black text-gray-900 leading-none">{value}</div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-0.5">{label}</div>
    </div>
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
  const itemsPerPage = 3; 
  const user = JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");
  const userRole = (user.rol || "").toLowerCase().trim();
  const userPerms = (user.permisos || []).map((perm) => String(perm || "").toLowerCase().trim());
  const canCreateSale = userRole === "administrador" || userPerms.includes("sales.create");

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
  }, [loadSales]);

  const filteredSales = useMemo(() => {
    return sales
      .filter((s) => {
        const term = searchTerm.toLowerCase();
        const matchSearch = (s?.clienteNombre || "").toLowerCase().includes(term) || String(s?.numeroVenta || "").toLowerCase().includes(term);
        const matchEstado = filterEstado === "todos" || s?.estadoNombre?.toLowerCase() === filterEstado;
        return matchSearch && matchEstado;
      })
      .sort((a, b) => new Date(b.fechaVenta || 0) - new Date(a.fechaVenta || 0));
  }, [sales, searchTerm, filterEstado]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const displayedSales = filteredSales.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="h-full flex flex-col gap-3 font-sans p-2 bg-[#f8fafc]">
      {/* Header Compacto */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Ventas</h1>
        </div>
        {canCreateSale && (
          <button onClick={() => navigate("/admin/ventas/nueva")}
            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-[11px] shadow-md transition-all active:scale-95">
            <Plus size={14} /> NUEVA VENTA
          </button>
        )}
      </div>

      {/* KPIs Pequeños */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard icon={DollarSign} label="Ingresos" value={fmt(sales.reduce((s,v)=>s+(v.total||0),0))} color="bg-blue-500" />
        <KPICard icon={Receipt} label="Ventas Hoy" value={sales.filter(s => new Date(s.fechaVenta).toDateString() === new Date().toDateString()).length} color="bg-emerald-500" />
        <KPICard icon={TrendingUp} label="Registros" value={sales.length} color="bg-purple-500" />
      </div>

      {/* Buscador y Filtro Slim */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
          <input type="text" placeholder="Buscar venta..."
            className="w-full pl-9 pr-3 py-1.5 border border-gray-100 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 text-[11px] bg-white font-medium outline-none"
            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }} />
        </div>
        <select value={filterEstado} onChange={(e) => { setFilterEstado(e.target.value); setCurrentPage(0); }}
          className="px-2 py-1.5 border border-gray-100 rounded-xl shadow-sm text-[11px] bg-white font-bold text-gray-600 outline-none">
          <option value="todos">Todos</option>
          <option value="completada">Completadas</option>
          <option value="devolucion">Devoluciones</option>
        </select>
      </div>

      {/* Tabla Sin Scroll (3 filas) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["#", "Fecha", "Cliente", "Items", "Pago", "Total", "Estado", ""].map(h => (
                <th key={h} className="px-3 py-2 text-[9px] font-black text-gray-400 uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayedSales.map((sale) => {
              const config = ESTADO_CONFIG[sale.estadoNombre?.toLowerCase()] || ESTADO_CONFIG.completada;
              const totalItems =
                (sale.detalles?.length || sale.Detalles?.length || 0) +
                (sale.servicios?.length || sale.Servicios?.length || 0);
              return (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 text-[10px] font-bold text-gray-400">{sale.numeroVenta?.split('-')[1]}</td>
                  <td className="px-3 py-2 text-[10px] text-gray-500">{new Date(sale.fechaVenta).toLocaleDateString()}</td>
                  <td className="px-3 py-2">
                    <span className="text-[10px] font-bold text-gray-700 truncate block max-w-[100px]">{sale.clienteNombre || "C. Final"}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-1.5 py-0.5 rounded border border-blue-100">
                      {totalItems} ITEMS
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[10px] text-gray-400 font-bold uppercase">{sale.metodoPagoNombre?.substring(0, 8)}</td>
                  <td className="px-3 py-2 text-right text-[11px] font-black text-gray-900">{fmt(sale.total)}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${config.bg} ${config.text}`}>
                      {config.label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => { setSelectedSale(sale); setIsSaleDetailOpen(true); }}
                      className="w-6 h-6 bg-white border border-gray-200 rounded-lg flex items-center justify-center mx-auto text-gray-400 hover:text-emerald-600 transition-all">
                      <Eye size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Paginación Slim */}
        <div className="bg-gray-50/50 px-3 py-2 flex items-center justify-between border-t border-gray-100">
          <span className="text-[9px] font-bold text-gray-400 uppercase">Pág {currentPage + 1} de {totalPages || 1}</span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}
              className="p-1 bg-white border rounded shadow-sm disabled:opacity-30"><ChevronLeft size={14} /></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1}
              className="p-1 bg-white border rounded shadow-sm disabled:opacity-30"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      <SaleDetailModal isOpen={isSaleDetailOpen} onClose={() => { setIsSaleDetailOpen(false); setSelectedSale(null); }} sale={selectedSale} />
      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SalesPage;
