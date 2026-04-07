import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign, ShoppingBag, Users, Activity, TrendingUp,
  CreditCard, Package, AlertCircle, Download, Calendar, Wallet,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import axios from "axios";
import { OpenShiftModal } from "../sales/components/OpenShiftModal";
import { turnService } from "../sales/services/turnService";

const API = "http://localhost:5055/api";
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("syspharma_token")}` },
});

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");
  const [period, setPeriod] = useState("Mes");
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);

  // Datos del backend
  const [ventas, setVentas] = useState([]);
  const [compras, setCompras] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [ventasRes, comprasRes, pedidosRes, citasRes, productosRes] = await Promise.allSettled([
        axios.get(`${API}/Venta`, getAuthHeaders()),
        axios.get(`${API}/Compra`, getAuthHeaders()),
        axios.get(`${API}/Pedido`, getAuthHeaders()),
        axios.get(`${API}/Cita`, getAuthHeaders()),
        axios.get(`${API}/Producto`, getAuthHeaders()),
      ]);
      if (ventasRes.status === "fulfilled") setVentas(ventasRes.value.data || []);
      if (comprasRes.status === "fulfilled") setCompras(comprasRes.value.data || []);
      if (pedidosRes.status === "fulfilled") setPedidos(pedidosRes.value.data || []);
      if (citasRes.status === "fulfilled") setCitas(citasRes.value.data || []);
      if (productosRes.status === "fulfilled") setProductos(productosRes.value.data || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadData();
    // Verificar turno para empleados
    if (user.rol !== "Administrador") {
      turnService.getActiveTurn(user?.id).then(turno => {
        if (!turno) setShowOpenShiftModal(true);
      });
    }
    const handleSync = () => loadData();
    ["sales:changed", "orders:changed", "appointments:changed", "products:changed"].forEach(e =>
      window.addEventListener(e, handleSync));
    const interval = setInterval(loadData, 30000);
    return () => {
      ["sales:changed", "orders:changed", "appointments:changed", "products:changed"].forEach(e =>
        window.removeEventListener(e, handleSync));
      clearInterval(interval);
    };
  }, [loadData]);

  // Filtro por período
  const filterByPeriod = (items, dateField) => {
    const now = new Date();
    return items.filter(item => {
      if (!item?.[dateField]) return false;
      const d = new Date(item[dateField]);
      if (period === "Día") return d.toDateString() === now.toDateString();
      if (period === "Mes") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (period === "Año") return d.getFullYear() === now.getFullYear();
      return true;
    });
  };

  const ventasFiltradas = filterByPeriod(ventas, "fechaVenta");
  const comprasFiltradas = filterByPeriod(compras, "fechaCompra");
  const pedidosFiltrados = filterByPeriod(pedidos, "fechaCreacion");
  const citasFiltradas = filterByPeriod(citas, "fechaCreacion");

  // KPIs
  const totalIngresos = ventasFiltradas.reduce((s, v) => s + (v.total || 0), 0);
  const totalGastos = comprasFiltradas.reduce((s, c) => s + (c.total || 0), 0);
  const utilidad = totalIngresos - totalGastos;
  const lowStockProducts = productos.filter(p => Number(p.stock) <= 5);

  // Gráfica ventas últimos 7 días
  const dataVentas = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayName = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"][date.getDay()];
    const valor = ventas.filter(v => v.fechaVenta && new Date(v.fechaVenta).toDateString() === date.toDateString())
      .reduce((s, v) => s + (v.total || 0), 0);
    return { name: dayName, valor };
  });

  // Gráfica métodos de pago
  const dataPagos = Object.entries(
    ventasFiltradas.reduce((acc, v) => {
      const m = v.metodoPagoNombre || "Efectivo";
      acc[m] = (acc[m] || 0) + (v.total || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
  if (dataPagos.length === 0) dataPagos.push({ name: "Sin datos", value: 0 });

  // Gráfica estados pedidos
  const dataPedidos = ["Pendiente", "En proceso", "Entregado", "Cancelado"].map(estado => ({
    name: estado,
    cantidad: pedidosFiltrados.filter(p => (p.estadoNombre || "").toLowerCase() === estado.toLowerCase()).length,
  }));

  const fmt = (v) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-xl p-6 text-white shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">¡Hola, {user.nombre}! 👋</h1>
          <p className="opacity-90 text-sm">Aquí tienes el resumen de tu farmacia.</p>
        </div>
        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
          <Activity size={24} />
        </div>
      </div>

      {/* Selector período */}
      <div className="flex bg-white rounded-xl border border-gray-100 p-1 w-fit gap-1">
        {["Día", "Mes", "Año"].map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              period === p ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}>
            {p}
          </button>
        ))}
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title={`Ventas (${period})`} value={fmt(totalIngresos)} icon={DollarSign} color="green" suffix={`${ventasFiltradas.length} ventas`} />
        <StatCard title={`Compras (${period})`} value={fmt(totalGastos)} icon={Wallet} color="orange" suffix={`${comprasFiltradas.length} compras`} />
        <StatCard title={`Utilidad (${period})`} value={fmt(utilidad)} icon={TrendingUp} color={utilidad >= 0 ? "emerald" : "red"} suffix={utilidad >= 0 ? "Ganancia" : "Pérdida"} />
        <StatCard title={`Citas (${period})`} value={citasFiltradas.length} icon={Calendar} color="blue" suffix="citas registradas" />
      </div>

      {/* KPIs secundarios */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard title="Pedidos del período" value={pedidosFiltrados.length} icon={ShoppingBag} color="bg-blue-100 text-blue-600" />
        <KpiCard title="Total productos" value={productos.length} icon={Package} color="bg-purple-100 text-purple-600" />
        <KpiCard title="Pedidos pendientes" value={pedidos.filter(p => (p.estadoNombre || "").toLowerCase() === "pendiente").length} icon={Users} color="bg-yellow-100 text-yellow-600" />
        <KpiCard title="Stock bajo" value={lowStockProducts.length} icon={AlertCircle} color={lowStockProducts.length > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"} />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Tendencia de Ventas" subtitle="Últimos 7 días" icon={TrendingUp} iconColor="text-primary-500">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dataVentas}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Tooltip formatter={v => fmt(v)} />
              <Area type="monotone" dataKey="valor" stroke="#34D399" strokeWidth={2} fill="#ECFDF5" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Métodos de Pago" subtitle="Distribución por ventas" icon={CreditCard} iconColor="text-blue-500">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={dataPagos} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                {dataPagos.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: "10px" }} />
              <Tooltip formatter={v => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Estado de Pedidos" subtitle="Distribución actual" icon={Package} iconColor="text-orange-500">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dataPedidos}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Alertas de Stock" subtitle="Inventario crítico" icon={AlertCircle} iconColor={lowStockProducts.length > 0 ? "text-red-500" : "text-green-500"}>
          <div className="h-[200px] flex flex-col items-center justify-center overflow-y-auto w-full">
            {lowStockProducts.length > 0 ? (
              <div className="w-full space-y-2">
                {lowStockProducts.slice(0, 5).map(p => (
                  <div key={p.id} className="text-left bg-red-50 p-2 rounded border border-red-200">
                    <p className="text-xs font-bold text-red-700 truncate">{p.nombre}</p>
                    <p className="text-xs text-red-600">Stock: {p.stock} unidades</p>
                  </div>
                ))}
                {lowStockProducts.length > 5 && (
                  <p className="text-xs text-red-600 mt-2">+{lowStockProducts.length - 5} productos más</p>
                )}
              </div>
            ) : (
              <>
                <div className="bg-green-50 text-green-500 p-3 rounded-full mb-2"><Package size={24} /></div>
                <p className="text-gray-600 font-medium text-sm">Inventario Saludable</p>
                <p className="text-gray-400 text-xs">No hay alertas críticas.</p>
              </>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Accesos rápidos */}
      <h2 className="text-base font-bold text-gray-800 pt-2">Accesos Rápidos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
        <ActionCard title="Registrar Venta" desc="Nueva factura" icon="🛒" onClick={() => navigate("/admin/ventas/nueva")} />
        <ActionCard title="Agregar Producto" desc="Nuevo inventario" icon="📦" onClick={() => navigate("/admin/productos")} />
        <ActionCard title="Agendar Cita" desc="Servicio médico" icon="📅" onClick={() => navigate("/admin/citas")} />
      </div>

      <OpenShiftModal isOpen={showOpenShiftModal} onShiftOpened={() => setShowOpenShiftModal(false)} user={user} />
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, suffix }) => {
  const colorMap = {
    blue: "bg-blue-50/50 border-blue-100 text-blue-700",
    green: "bg-emerald-50/50 border-emerald-100 text-emerald-700",
    orange: "bg-orange-50/50 border-orange-100 text-orange-700",
    red: "bg-red-50/50 border-red-100 text-red-700",
    emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-700",
  };
  return (
    <div className={`p-5 rounded-2xl border ${colorMap[color]} flex flex-col justify-between h-32`}>
      <div className="flex items-center gap-2 font-bold text-sm"><Icon size={18} /> {title}</div>
      <div>
        <h3 className="text-3xl font-bold">{value}</h3>
        <p className="text-xs opacity-75 mt-1">{suffix}</p>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
    <div className={`p-2.5 rounded-lg ${color}`}><Icon size={20} /></div>
    <div>
      <p className="text-xs text-gray-500 font-medium">{title}</p>
      <h3 className="text-xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const ChartCard = ({ title, subtitle, icon: Icon, iconColor, children }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
        <p className="text-[10px] text-gray-500">{subtitle}</p>
      </div>
      <Icon className={iconColor} size={18} />
    </div>
    <div className="flex-1 w-full min-h-0">{children}</div>
  </div>
);

const ActionCard = ({ title, desc, icon, onClick }) => (
  <div onClick={onClick}
    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-primary-400 transition-all cursor-pointer bg-white flex items-center gap-3 hover:bg-primary-50">
    <div className="text-2xl bg-gray-50 p-2 rounded-lg hover:bg-primary-100 transition-colors">{icon}</div>
    <div>
      <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  </div>
);

export default DashboardPage;