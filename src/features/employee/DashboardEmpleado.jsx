import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  ShoppingCart,
  Plus,
  AlertCircle,
  CheckCircle,
  Package,
  ArrowRight,
  Stethoscope
} from "lucide-react";
import { appointmentService } from "../services/appointments/services/appointmentService";
import { turnService } from "../sales/services/turnService";
import { OpenShiftModal } from "../sales/components/OpenShiftModal";
import { useCrud } from "../../shared/hooks/useCrud";

const LOW_STOCK_THRESHOLD = 15;

const parseToMinutes = (hhmm) => {
  if (!hhmm || typeof hhmm !== 'string') return Infinity;
  const parts = hhmm.split(":");
  const h = Number(parts[0] ?? 0);
  const m = Number(parts[1] ?? 0);
  if (Number.isNaN(h) || Number.isNaN(m)) return Infinity;
  return h * 60 + m;
};

export const DashboardEmpleado = () => {
  const navigate = useNavigate();
  const currentUser = useMemo(() => JSON.parse(localStorage.getItem("syspharma_user") || '{"nombre": "Empleado"}'), []);
  const [todaysAppointments, setTodaysAppointments] = useState([]);
  const [pendingConfirmations, setPendingConfirmations] = useState(0);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);

  // Productos (hook comparte items) - usar la misma clave que productService
  const { items: products } = useCrud("syspharma_products", []);

  const lowStockProducts = useMemo(() => {
    return (products || [])
      .filter(p => Number(p.stock) < LOW_STOCK_THRESHOLD)
      .slice(0, 4);
  }, [products]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Allow appointmentService to be sync or async
      const allAppointments = await Promise.resolve(appointmentService.getAppointments());

      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const todayAppts = (allAppointments || []).filter(apt => apt.fecha === todayStr && apt.estado !== "Cancelada");
      todayAppts.sort((a, b) => a.hora.localeCompare(b.hora));

      setTodaysAppointments(todayAppts);

      const pending = todayAppts.filter(apt => apt.estado === "Confirmar Asistencia").length;
      setPendingConfirmations(pending);

      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();

      const next = todayAppts.find(apt => parseToMinutes(apt.hora) >= nowMinutes && apt.estado !== "Completada");
      setNextAppointment(next || null);
    } catch (err) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const id = setInterval(loadDashboardData, 60000); // refresh cada 60s
    return () => clearInterval(id);
  }, []);

  // Verificar turno activo al cargar - Solo empleados ven modal si no hay turno
  useEffect(() => {
    if (!turnService.hasActiveTurn()) {
      setShowOpenShiftModal(true);
    }
  }, []);

  return (
    <>
      <div className="p-4 font-sans bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Hola, {currentUser.nombre.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm">Aquí tienes el resumen de tu jornada hoy.</p>
        </div>
        <div className="flex gap-2">
          <button 
            aria-label="Nueva Venta"
            onClick={() => navigate("/employee/ventas")}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-gray-50 shadow-sm transition-all"
          >
            <ShoppingCart size={18} /> Nueva Venta
          </button>
          <button 
            aria-label="Agendar Cita"
            onClick={() => navigate("/employee/citas")}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md transition-all hover:scale-105"
          >
            <Plus size={18} /> Agendar Cita
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Citas para Hoy</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{todaysAppointments.length}</h3>
            <p className="text-xs text-blue-600 font-medium mt-1">
              {todaysAppointments.filter(a => a.estado === "Completada").length} atendidas
            </p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Calendar size={28} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Por Confirmar</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{pendingConfirmations}</h3>
            <p className="text-xs text-orange-500 font-medium mt-1">Requieren llamada</p>
          </div>
          <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Alertas Stock</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{lowStockProducts.length}</h3>
            <p className="text-xs text-red-500 font-medium mt-1">Productos por agotarse</p>
          </div>
          <div className="p-2 bg-red-50 rounded-lg text-red-600">
            <AlertCircle size={28} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {nextAppointment ? (
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-4 text-white shadow relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1 opacity-90">
                    <Clock size={16} />
                    <span className="text-sm font-medium">Siguiente turno: {nextAppointment.hora}</span>
                  </div>
                  <h2 className="text-xl font-bold">{nextAppointment.paciente}</h2>
                  <p className="opacity-90 text-sm mt-1">{nextAppointment.servicio}</p>
                </div>
                <button 
                  aria-label="Gestionar Citas"
                  onClick={() => navigate("/employee/citas")}
                  className="bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-bold shadow hover:bg-gray-100 transition-colors"
                >
                  Gestionar
                </button>
              </div>
              <Stethoscope className="absolute -bottom-4 -right-4 text-white opacity-10" size={96} />
            </div>
          ) : (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
              <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
              <h3 className="text-green-800 font-bold">¡Todo al día!</h3>
              <p className="text-green-600 text-sm">No hay más citas pendientes por hoy.</p>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Agenda de Hoy</h3>
              <button aria-label="Ver todas las citas" onClick={() => navigate("/employee/citas")} className="text-blue-600 text-xs font-bold hover:underline">Ver todo</button>
            </div>
            <div className="divide-y divide-gray-50">
              {loading && (
                <div className="p-3 text-center text-sm text-gray-500">Cargando citas...</div>
              )}
              {error && (
                <div className="p-3 text-center text-sm text-red-500">Error: {error}</div>
              )}
              {!loading && todaysAppointments.length > 0 ? (
                todaysAppointments.map((apt) => (
                  <div key={apt.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors relative">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 text-blue-700 font-bold text-xs px-2 py-1 rounded-md">
                        {apt.hora}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">{apt.paciente}</h4>
                        <p className="text-xs text-gray-500">{apt.servicio}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                        apt.estado === 'Completada' ? 'bg-green-50 text-green-700 border-green-100' :
                        apt.estado === 'En Consulta' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-yellow-50 text-yellow-700 border-yellow-100'
                      }`}>
                        {apt.estado}
                      </span>
                    </div>
                  </div>
                ))
              ) : (!loading && todaysAppointments.length === 0 && (
                <div className="p-6 text-center text-gray-400 text-sm">No hay citas programadas para hoy.</div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <h3 className="font-bold text-gray-800 mb-3 text-sm">Accesos Rápidos</h3>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction icon={ShoppingCart} label="Ventas" onClick={() => navigate("/employee/ventas")} color="blue" />
              <QuickAction icon={Calendar} label="Citas" onClick={() => navigate("/employee/citas")} color="emerald" />
              <QuickAction icon={Users} label="Pacientes" onClick={() => navigate("/employee/citas")} color="purple" />
              <QuickAction icon={Package} label="Inventario" onClick={() => navigate("/employee/productos")} color="orange" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500"/> Bajo Stock
              </h3>
            </div>
            <div className="space-y-3">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map((prod) => (
                  <div key={prod.id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-600 truncate max-w-[120px]">{prod.nombre}</span>
                    <span className="font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-md text-xs">{prod.stock} un.</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">Inventario saludable ✅</p>
              )}
            </div>
            {lowStockProducts.length > 0 && (
              <button 
                aria-label="Ver inventario"
                onClick={() => navigate("/employee/productos")}
                className="w-full mt-4 text-xs text-center text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1"
              >
                Ver inventario <ArrowRight size={12} />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>

    {/* Modal para abrir caja si no hay turno al cargar */}
    <OpenShiftModal
      isOpen={showOpenShiftModal}
      onShiftOpened={() => setShowOpenShiftModal(false)}
      user={currentUser}
      canClose={false}
      onCancel={() => setShowOpenShiftModal(false)}
    />
    </>
  );
};

const QuickAction = ({ icon: Icon, label, onClick, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 hover:bg-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    purple: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    orange: "bg-orange-50 text-orange-600 hover:bg-orange-100",
  };

  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${colors[color]}`}
    >
      <Icon size={18} className="mb-1" />
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
};

export default DashboardEmpleado;
