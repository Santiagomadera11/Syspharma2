import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar as CalendarIcon, List, Settings, Plus, Search, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, Clock, Users, Filter, DollarSign, X, CheckCircle
} from "lucide-react";
import axios from "axios";
import AppointmentFormModal from "./components/AppointmentFormModal";
import AppointmentDetailModal from "./components/AppointmentDetailModal";
import { StatusNotification } from "../../../shared/ui/StatusNotification";
import { AvailabilityConfigPage } from "./AvailabilityConfigPage";
import DoctorsPage from "../doctors/DoctorsPage";
import { appointmentService } from "./services/appointmentService";

const API_URL = "http://localhost:5055/api/Cita";
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("syspharma_token")}` },
});

export const AppointmentsPage = () => {
  const currentUser = JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");
  const currentUserRole = (currentUser.rol || "Empleado").toLowerCase();

  const [activeTab, setActiveTab] = useState("calendario");
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [range, setRange] = useState({
    start: `${new Date().getFullYear()}-01-01`,
    end: `${new Date().getFullYear()}-12-31`
  });
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDaySummaryModalOpen, setIsDaySummaryModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [citasRes, estadosRes, doctorsData] = await Promise.all([
        axios.get(API_URL, getAuthHeaders()),
        axios.get(`${API_URL}/estados`, getAuthHeaders()),
        appointmentService.getDoctors(),
      ]);
      setAppointments(Array.isArray(citasRes.data) ? citasRes.data : []);
      setEstados(Array.isArray(estadosRes.data) ? estadosRes.data : []);
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
    } catch (err) {
      console.error("Error cargando citas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Escuchar cambios en médicos para refrescar el selector del modal
  useEffect(() => {
    const refresh = () => loadData();
    window.addEventListener("doctors:changed", refresh);
    return () => window.removeEventListener("doctors:changed", refresh);
  }, [loadData]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const matchRange = apt.fecha >= range.start && apt.fecha <= range.end;
      const matchSearch = (apt.pacienteNombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (apt.servicioNombre || "").toLowerCase().includes(searchTerm.toLowerCase());
      return matchRange && matchSearch;
    }).sort((a, b) => new Date(`${b.fecha}T${b.hora}`) - new Date(`${a.fecha}T${a.hora}`));
  }, [appointments, range, searchTerm]);

  const financialSummary = useMemo(() => {
    const ingresos = filteredAppointments
      .filter(a => (a.estadoNombre || "").toLowerCase().includes("completada"))
      .reduce((s, a) => s + (Number(a.precio) || 0), 0);
    return { ingresos, totalCitas: filteredAppointments.length };
  }, [filteredAppointments]);

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter(apt => apt.fecha === dateStr);
  };

  const handleStatusChange = async (appointmentId, estadoNombre) => {
    const estado = estados.find(e => e.nombre.toLowerCase() === estadoNombre.toLowerCase());
    if (!estado) return;
    try {
      await axios.patch(`${API_URL}/${appointmentId}/estado`, estado.id, {
        ...getAuthHeaders(),
        headers: { ...getAuthHeaders().headers, "Content-Type": "application/json" }
      });
      setNotification({ message: "Estado actualizado", type: "success" });
      loadData();
    } catch (err) {
      setNotification({ message: "Error al actualizar", type: "error" });
    }
  };

  const renderList = () => (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-50 bg-gray-50/30">
        <input type="text" placeholder="Buscar paciente o servicio..."
          className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-400">
          <tr>
            <th className="p-4 text-[10px] font-black uppercase">Paciente</th>
            <th className="p-4 text-[10px] font-black uppercase">Fecha / Hora</th>
            <th className="p-4 text-[10px] font-black uppercase">Servicio</th>
            <th className="p-4 text-[10px] font-black uppercase">Precio</th>
            <th className="p-4 text-[10px] font-black uppercase">Estado</th>
            <th className="p-4 text-center text-[10px] font-black uppercase">Ver</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filteredAppointments.length === 0 ? (
            <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">No hay citas registradas en este periodo.</td></tr>
          ) : (
            filteredAppointments.map(apt => (
              <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <p className="font-bold text-sm text-gray-900">{apt.pacienteNombre}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{apt.medicoNombre}</p>
                </td>
                <td className="p-4">
                  <p className="text-sm font-bold text-gray-700">{apt.fecha}</p>
                  <p className="text-[10px] text-gray-400 font-bold">{apt.hora}</p>
                </td>
                <td className="p-4 text-sm font-medium text-gray-600">{apt.servicioNombre}</td>
                <td className="p-4 font-black text-emerald-600">${Number(apt.precio || 0).toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${apt.estadoNombre?.toLowerCase().includes('completada') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'}`}>
                    {apt.estadoNombre}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => { setSelectedAppointment(apt); setIsDetailModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Eye size={16} /></button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days = [];
    let day = new Date(startDate);
    while (day <= endDate) {
      days.push({
        date: new Date(day),
        isCurrentMonth: day.getMonth() === month,
        isToday: day.toDateString() === new Date().toDateString(),
        appts: getAppointmentsForDate(day)
      });
      day.setDate(day.getDate() + 1);
    }

    return (
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-gray-800 capitalize">
            {currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="p-2 hover:bg-gray-100 rounded-xl"><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-gray-400 uppercase pb-2">{d}</div>
          ))}
          {days.map((d, i) => (
            <div key={i} onClick={() => { setSelectedDate(d.date); setIsDaySummaryModalOpen(true); }}
              className={`min-h-[100px] p-2 border rounded-2xl cursor-pointer transition-all ${d.isCurrentMonth ? "bg-white" : "bg-gray-50/50 text-gray-300 border-transparent"} ${d.isToday ? "ring-2 ring-emerald-500" : "hover:border-emerald-200"}`}>
              <span className="text-xs font-black">{d.date.getDate()}</span>
              {d.appts.length > 0 && (
                <div className="mt-1 bg-emerald-600 text-white text-[9px] font-black uppercase py-1 rounded-md text-center">{d.appts.length} Citas</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 font-sans p-6 min-h-screen bg-[#f8fafc]">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Gestión de Citas</h1>
          <p className="text-sm text-gray-500 font-medium">Agenda y administración médica</p>
        </div>
        <button onClick={() => { setEditingAppointment(null); setIsAppointmentModalOpen(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-emerald-100 flex items-center gap-2 text-xs uppercase transition-all">
          <Plus size={18} /> Nueva Cita
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 overflow-x-auto">
        {[
          { id: "calendario", icon: CalendarIcon, label: "Calendario" },
          { id: "citas", icon: List, label: "Lista de Citas" },
          { id: "disponibilidad", icon: Settings, label: "Disponibilidad", adminOnly: true },
          { id: "medicos", icon: Users, label: "Médicos", adminOnly: true },
        ].map(tab => {
          if (tab.adminOnly && currentUserRole !== "administrador") return null;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? "text-emerald-600 border-emerald-600" : "text-gray-400 border-transparent hover:text-gray-600"}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filtro por Rango */}
      {(activeTab === "calendario" || activeTab === "citas") && (
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600"><Filter size={20} /></div>
            <span className="font-black text-gray-800 text-[10px] uppercase">Rango de datos</span>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border">
            <input type="date" value={range.start} onChange={(e) => setRange(p => ({ ...p, start: e.target.value }))} className="bg-transparent text-xs font-bold outline-none p-1" />
            <div className="h-4 w-[1px] bg-gray-300"></div>
            <input type="date" value={range.end} onChange={(e) => setRange(p => ({ ...p, end: e.target.value }))} className="bg-transparent text-xs font-bold outline-none p-1" />
          </div>
        </div>
      )}

      {/* Vistas */}
      <div className="flex-1">
        {activeTab === "calendario" && renderCalendar()}
        {activeTab === "citas" && renderList()}
        {activeTab === "disponibilidad" && <AvailabilityConfigPage />}
        {activeTab === "medicos" && <DoctorsPage />}
      </div>

      {/* Modales */}
      {isAppointmentModalOpen && (
        <AppointmentFormModal isOpen={isAppointmentModalOpen} onClose={() => setIsAppointmentModalOpen(false)} onSave={() => loadData()} appointment={editingAppointment} doctors={doctors} />
      )}
      {isDetailModalOpen && selectedAppointment && (
        <AppointmentDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} appointment={selectedAppointment} />
      )}
      {notification && <StatusNotification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default AppointmentsPage;