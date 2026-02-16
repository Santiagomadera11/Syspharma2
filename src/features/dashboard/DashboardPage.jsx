import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Activity,
  TrendingUp,
  CreditCard,
  Package,
  AlertCircle,
  Download,
  Calendar,
  Wallet,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { turnService } from "../sales/services/turnService";
import { OpenShiftModal } from "../sales/components/OpenShiftModal";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("syspharma_user") || "{}");
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [period, setPeriod] = useState("Año"); // Día, Mes, Año
  const [appointments, setAppointments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Al cargar el dashboard, verifica si hay turno activo
  useEffect(() => {
    const activeTurn = turnService.getActiveTurn();
    // Admin NO ve modal automático
    // Solo usuarios con rol de empleado verían esto, pero como es admin dashboard, no es necesario
    if (!activeTurn && user.rol !== "Administrador") {
      setShowOpenShiftModal(true);
    }
  }, []);

  // Cargar citas, gastos, productos y ventas del localStorage y sincronizar en tiempo real
  useEffect(() => {
    const loadData = () => {
      try {
        const appointmentsData = localStorage.getItem("sys_appointments_db");
        const expensesData = localStorage.getItem("sys_expenses_db");
        const productsData = localStorage.getItem("syspharma_products");
        const salesData = localStorage.getItem("sys_sales_db");
        
        if (appointmentsData) {
          setAppointments(JSON.parse(appointmentsData));
        }
        if (expensesData) {
          setExpenses(JSON.parse(expensesData));
        }
        if (productsData) {
          setProducts(JSON.parse(productsData));
        }
        if (salesData) {
          setSales(JSON.parse(salesData));
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };

    loadData();

    // Escuchar eventos personalizados de cambios en datos
    const handleDataChange = () => {
      loadData();
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener("appointments:changed", handleDataChange);
    window.addEventListener("expenses:changed", handleDataChange);
    window.addEventListener("products:changed", handleDataChange);
    window.addEventListener("sales:changed", handleDataChange);
    window.addEventListener("syspharma_products_updated", handleDataChange);
    window.addEventListener("services:changed", handleDataChange);

    // Refrescar cada 2 segundos para sincronización en tiempo real
    const interval = setInterval(loadData, 2000);

    return () => {
      window.removeEventListener("appointments:changed", handleDataChange);
      window.removeEventListener("expenses:changed", handleDataChange);
      window.removeEventListener("products:changed", handleDataChange);
      window.removeEventListener("sales:changed", handleDataChange);
      window.removeEventListener("syspharma_products_updated", handleDataChange);
      window.removeEventListener("services:changed", handleDataChange);
      clearInterval(interval);
    };
  }, []);

  // LÓGICA DE FILTRADO DE FECHAS
  const filterByDate = (items, dateField) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return items.filter(item => {
      if (!item || !item[dateField]) return false;
      const itemDate = new Date(item[dateField]);
      const itemDateStr = itemDate.toISOString().split('T')[0];

      if (period === "Día") return itemDateStr === today;
      if (period === "Mes") return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      if (period === "Año") return itemDate.getFullYear() === now.getFullYear();
      
      return true;
    });
  };

  // CÁLCULOS EN TIEMPO REAL
  const filteredAppointments = filterByDate(appointments, "fecha");
  const filteredExpenses = filterByDate(expenses, "fecha");

  const totalCitas = filteredAppointments.length;
  const totalIngresos = filteredAppointments.reduce((sum, appt) => {
    return sum + (Number(appt.precio) || 0);
  }, 0);
  const totalGastos = filteredExpenses.reduce((sum, exp) => {
    return sum + (Number(exp.monto) || 0);
  }, 0);
  const utilidad = totalIngresos - totalGastos;

  const handleShiftOpened = () => {
    setShowOpenShiftModal(false);
  };

  // Funciones de navegación para Accesos Rápidos
  const handleGoToSales = () => {
    navigate("/admin/ventas");
  };

  const handleAddProduct = () => {
    navigate("/admin/productos");
  };

  const handleScheduleAppointment = () => {
    navigate("/admin/citas");
  };

  // --- DATOS DINÁMICOS PARA GRÁFICAS ---
  // Gráfica de Ventas por día de la semana
  const dataVentas = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split('T')[0];
    const dayName = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"][date.getDay()];
    
    const dayIncome = filteredAppointments
      .filter(appt => {
        const apptDate = new Date(appt.fecha);
        return apptDate.toISOString().split('T')[0] === dateStr;
      })
      .reduce((sum, appt) => sum + (Number(appt.precio) || 0), 0);
    
    return { name: dayName, valor: dayIncome };
  });

  // Gráfica de Métodos de Pago
  const dataPagos = sales.length > 0
    ? Object.entries(
        sales.reduce((acc, sale) => {
          const method = sale.metodoPago || "Efectivo";
          acc[method] = (acc[method] || 0) + (Number(sale.total) || 0);
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }))
    : [
        { name: "Efectivo", value: 0 },
        { name: "Tarjeta", value: 0 },
        { name: "Nequi", value: 0 },
      ];

  // Gráfica de Estados (usando estado de productos o citas)
  const dataPedidos = [
    { name: "Completado", cantidad: filteredAppointments.filter(a => a.estado === "Completado").length },
    { name: "Pendiente", cantidad: filteredAppointments.filter(a => a.estado === "Pendiente").length },
    { name: "Cancelado", cantidad: filteredAppointments.filter(a => a.estado === "Cancelado").length },
    { name: "Reprogramado", cantidad: filteredAppointments.filter(a => a.estado === "Reprogramado").length },
  ];

  // Alertas de Stock Bajo (productos con stock <= 5)
  const lowStockProducts = products.filter(p => Number(p.stock) <= 5);
  const stockAlertCount = lowStockProducts.length;

  const COLORS = ["#10B981", "#3B82F6", "#F59E0B"];

  return (
    <div className="space-y-6" key={refreshKey}>
      {/* 1. Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-xl p-6 text-white shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">¡Hola, {user.nombre}! 👋</h1>
          <p className="opacity-90 text-sm">
            Aquí tienes el resumen de tu farmacia.
          </p>
        </div>
        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
          <Activity size={24} />
        </div>
      </div>

      {/* SELECCIONADOR DE PERÍODO */}
      <div className="flex bg-white rounded-xl border border-gray-100 p-1 w-fit gap-1">
        {["Día", "Mes", "Año"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              period === p
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* 2. TARJETAS SINCRONIZADAS CON LÓGICA CONTABLE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* TARJETA: CITAS */}
        <StatCard
          title={`Citas del ${period.toLowerCase()}`}
          value={totalCitas}
          icon={Calendar}
          color="blue"
          suffix="citas"
        />

        {/* TARJETA: INGRESOS */}
        <StatCard
          title={`Ingresos del ${period.toLowerCase()}`}
          value={`$${totalIngresos.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          suffix="Pesos"
        />

        {/* TARJETA: GASTOS */}
        <StatCard
          title={`Gastos del ${period.toLowerCase()}`}
          value={`$${totalGastos.toLocaleString()}`}
          icon={Wallet}
          color="orange"
          suffix="Pesos"
        />

        {/* TARJETA: UTILIDAD */}
        <StatCard
          title={`Utilidad del ${period.toLowerCase()}`}
          value={`$${utilidad.toLocaleString()}`}
          icon={TrendingUp}
          color={utilidad >= 0 ? "emerald" : "red"}
          suffix={utilidad >= 0 ? "Ganancia" : "Pérdida"}
        />
      </div>

      {/* 3. KPIs Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Ventas Hoy"
          value={`$${filteredAppointments.filter(a => {
            const today = new Date().toISOString().split('T')[0];
            const apptDate = new Date(a.fecha).toISOString().split('T')[0];
            return apptDate === today;
          }).reduce((sum, a) => sum + (Number(a.precio) || 0), 0).toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-100 text-green-600"
        />
        <KpiCard
          title="Total Citas"
          value={filteredAppointments.length}
          icon={ShoppingBag}
          color="bg-blue-100 text-blue-600"
        />
        <KpiCard
          title="Productos"
          value={products.length}
          icon={Users}
          color="bg-purple-100 text-purple-600"
        />
        <KpiCard
          title="Stock Bajo"
          value={stockAlertCount}
          icon={AlertCircle}
          color={stockAlertCount > 0 ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}
        />
      </div>

      {/* 4. Las Gráficas (Cuadrícula 2x2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gráfica Ventas */}
        <ChartCard
          title="Tendencia de Ventas"
          subtitle="Últimos 7 días"
          icon={TrendingUp}
          iconColor="text-primary-500"
        >
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dataVentas}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="#34D399"
                strokeWidth={2}
                fill="#ECFDF5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gráfica Pagos */}
        <ChartCard
          title="Métodos de Pago"
          subtitle="Distribución"
          icon={CreditCard}
          iconColor="text-blue-500"
        >
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dataPagos}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {dataPagos.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend
                verticalAlign="middle"
                align="right"
                layout="vertical"
                iconType="circle"
                wrapperStyle={{ fontSize: "10px" }}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gráfica Estados */}
        <ChartCard
          title="Estado de Pedidos"
          subtitle="Procesamiento actual"
          icon={Package}
          iconColor="text-orange-500"
        >
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dataPedidos}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#9ca3af" }}
              />
              <Tooltip cursor={{ fill: "transparent" }} />
              <Bar
                dataKey="cantidad"
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Tarjeta Stock */}
        <ChartCard
          title="Alertas de Stock"
          subtitle="Inventario crítico"
          icon={AlertCircle}
          iconColor={stockAlertCount > 0 ? "text-red-500" : "text-green-500"}
        >
          <div className="h-[200px] flex flex-col items-center justify-center text-center overflow-y-auto">
            {stockAlertCount > 0 ? (
              <div className="w-full space-y-2">
                {lowStockProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="text-left bg-red-50 p-2 rounded border border-red-200">
                    <p className="text-xs font-bold text-red-700 truncate">{product.nombre}</p>
                    <p className="text-xs text-red-600">Stock: {product.stock} unidades</p>
                  </div>
                ))}
                {stockAlertCount > 5 && (
                  <p className="text-xs text-red-600 mt-2">+{stockAlertCount - 5} productos más</p>
                )}
              </div>
            ) : (
              <>
                <div className="bg-green-50 text-green-500 p-3 rounded-full mb-2">
                  <Package size={24} />
                </div>
                <p className="text-gray-600 font-medium text-sm">
                  Inventario Saludable
                </p>
                <p className="text-gray-400 text-xs">
                  No hay alertas críticas.
                </p>
              </>
            )}
          </div>
        </ChartCard>
      </div>

      {/* 5. Accesos Rápidos */}
      <h2 className="text-base font-bold text-gray-800 pt-2">
        Accesos Rápidos
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
        <ActionCard 
          title="Registrar Venta" 
          desc="Nueva factura" 
          icon="🛒"
          onClick={handleGoToSales}
        />
        <ActionCard
          title="Agregar Producto"
          desc="Nuevo inventario"
          icon="📦"
          onClick={handleAddProduct}
        />
        <ActionCard 
          title="Agendar Cita" 
          desc="Servicio médico" 
          icon="📅"
          onClick={handleScheduleAppointment}
        />
      </div>

      {/* Modal de Apertura de Turno */}
      <OpenShiftModal
        isOpen={showOpenShiftModal}
        onShiftOpened={handleShiftOpened}
        user={user}
      />
    </div>
  );
};

// --- Subcomponentes para mantener el código limpio ---

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
      <div className="flex items-center gap-2 font-bold text-sm">
        <Icon size={18} />
        {title}
      </div>
      <div>
        <h3 className="text-3xl font-bold">{value}</h3>
        <p className="text-xs opacity-75 mt-1">{suffix}</p>
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
    <div className={`p-2.5 rounded-lg ${color}`}>
      <Icon size={20} />
    </div>
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
      <div className="flex gap-2">
        <Icon className={iconColor} size={18} />
        <button className="text-gray-400 hover:text-gray-600">
          <Download size={16} />
        </button>
      </div>
    </div>
    <div className="flex-1 w-full min-h-0">{children}</div>
  </div>
);

const ActionCard = ({ title, desc, icon, onClick }) => (
  <div 
    onClick={onClick}
    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-primary-400 transition-all cursor-pointer bg-white flex items-center gap-3 hover:bg-primary-50"
  >
    <div className="text-2xl bg-gray-50 p-2 rounded-lg hover:bg-primary-100 transition-colors">{icon}</div>
    <div>
      <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  </div>
);
