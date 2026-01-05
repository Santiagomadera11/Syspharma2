import React from 'react';
import { DollarSign, ShoppingBag, Users, Activity, TrendingUp, CreditCard, Package, AlertCircle, Download } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';

export const DashboardPage = () => {
  const user = JSON.parse(localStorage.getItem('syspharma_user') || '{}');

  // --- DATOS SIMULADOS PARA GRÁFICAS ---
  const dataVentas = [
    { name: 'lun', valor: 0 }, { name: 'mar', valor: 0 }, { name: 'mié', valor: 0 },
    { name: 'jue', valor: 0 }, { name: 'vie', valor: 0 }, { name: 'sáb', valor: 0 }, { name: 'dom', valor: 0 },
  ];
  const dataPedidos = [
    { name: 'Pendiente', cantidad: 5 }, { name: 'Proceso', cantidad: 2 }, 
    { name: 'Listo', cantidad: 8 }, { name: 'Cancelado', cantidad: 1 },
  ];
  const dataPagos = [
    { name: 'Efectivo', value: 400 }, { name: 'Tarjeta', value: 300 }, { name: 'Nequi', value: 300 },
  ];
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B'];

  return (
    <div className="space-y-6">
      
      {/* 1. LO QUE ESTABA ANTES: Banner de Bienvenida */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-xl p-6 text-white shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">¡Hola, {user.nombre}! 👋</h1>
          <p className="opacity-90 text-sm">Aquí tienes el resumen de tu farmacia hoy.</p>
        </div>
        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
           <Activity size={24} />
        </div>
      </div>

      {/* 2. LO QUE ESTABA ANTES: KPIs (Resumen numérico) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Ventas Hoy" value="$0" icon={DollarSign} color="bg-green-100 text-green-600" />
        <KpiCard title="Pedidos" value="12" icon={ShoppingBag} color="bg-blue-100 text-blue-600" />
        <KpiCard title="Clientes" value="5" icon={Users} color="bg-purple-100 text-purple-600" />
        <KpiCard title="Stock Bajo" value="8" icon={AlertCircle} color="bg-red-100 text-red-600" />
      </div>

      {/* 3. LO NUEVO: Las Gráficas (Cuadrícula 2x2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Gráfica Ventas */}
        <ChartCard title="Tendencia de Ventas" subtitle="Últimos 7 días" icon={TrendingUp} iconColor="text-primary-500">
           <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dataVentas}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <Tooltip />
                <Area type="monotone" dataKey="valor" stroke="#34D399" strokeWidth={2} fill="#ECFDF5" />
              </AreaChart>
           </ResponsiveContainer>
        </ChartCard>

        {/* Gráfica Pagos */}
        <ChartCard title="Métodos de Pago" subtitle="Distribución" icon={CreditCard} iconColor="text-blue-500">
           <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={dataPagos} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {dataPagos.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{fontSize: '10px'}}/>
                <Tooltip />
              </PieChart>
           </ResponsiveContainer>
        </ChartCard>

        {/* Gráfica Estados */}
        <ChartCard title="Estado de Pedidos" subtitle="Procesamiento actual" icon={Package} iconColor="text-orange-500">
           <ResponsiveContainer width="100%" height={200}>
              <BarChart data={dataPedidos}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="cantidad" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
           </ResponsiveContainer>
        </ChartCard>

        {/* Tarjeta Stock */}
        <ChartCard title="Alertas de Stock" subtitle="Inventario crítico" icon={AlertCircle} iconColor="text-red-500">
           <div className="h-[200px] flex flex-col items-center justify-center text-center">
              <div className="bg-green-50 text-green-500 p-3 rounded-full mb-2">
                  <Package size={24} />
              </div>
              <p className="text-gray-600 font-medium text-sm">Inventario Saludable</p>
              <p className="text-gray-400 text-xs">No hay alertas críticas por ahora.</p>
           </div>
        </ChartCard>

      </div>

      {/* 4. LO QUE ESTABA ANTES: Accesos Rápidos */}
      <h2 className="text-base font-bold text-gray-800 pt-2">Accesos Rápidos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4">
        <ActionCard title="Registrar Venta" desc="Nueva factura" icon="🛒" />
        <ActionCard title="Agregar Producto" desc="Nuevo inventario" icon="📦" />
        <ActionCard title="Agendar Cita" desc="Servicio médico" icon="📅" />
      </div>

    </div>
  );
};

// --- Subcomponentes para mantener el código limpio ---

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
        <button className="text-gray-400 hover:text-gray-600"><Download size={16} /></button>
      </div>
    </div>
    <div className="flex-1 w-full min-h-0">
      {children}
    </div>
  </div>
);

const ActionCard = ({ title, desc, icon }) => (
  <div className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer bg-white flex items-center gap-3">
    <div className="text-2xl bg-gray-50 p-2 rounded-lg">{icon}</div>
    <div>
      <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  </div>
);