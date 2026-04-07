import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, List, Settings, Plus, Search, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle,
  AlertCircle, TrendingUp, TrendingDown, X, Users,
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
  const currentUserRole = currentUser.rol || "Empleado";

  const [activeTab, setActiveTab] = useState("calendario");
  const [periodFilter, setPeriodFilter] = useState("dia");
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [notification, setNotification] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDaySummaryModalOpen, setIsDaySummaryModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [appointmentToChangeStatus, setAppointmentToChangeStatus] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    } catch {
      setAppointments([]);
      setDoctors([]);
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadData();
    const onChange = () => loadData();
    window.addEventListener("appointments:changed", onChange);
    return () => window.removeEventListener("appointments:changed", onChange);
  }, [loadData]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const filterByPeriod = (items) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return items.filter(item => {
      const itemDate = new Date(item.fecha + "T00:00:00");
      itemDate.setHours(0, 0, 0, 0);
      if (periodFilter === "dia") return itemDate.toDateString() === today.toDateString();
      if (periodFilter === "semana") {
        const day = today.getDay();
        const start = new Date(today);
        start.setDate(today.getDate() - day + (day === 0 ? -6 : 1));
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        return itemDate >= start && itemDate <= end;
      }
      if (periodFilter === "mes") return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
      if (periodFilter === "año") return itemDate.getFullYear() === today.getFullYear();
      return true;
    });
  };

  const financialSummary = useMemo(() => {
    const period = filterByPeriod(appointments);
    const ingresos = period.filter(a => (a.estadoNombre || "").toLowerCase() === "completada")
      .reduce((s, a) => s + (Number(a.precio) || 0), 0);
    return { ingresos, totalCitas: period.length };
  }, [appointments, periodFilter]);

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter(apt => apt.fecha === dateStr);
  };

  const getStatusColor = (estado) => {
    const lower = (estado || "").toLowerCase();
    if (lower.includes("confirmar")) return "bg-yellow-100 text-yellow-700";
    if (lower.includes("consulta")) return "bg-blue-100 text-blue-700";
    if (lower === "completada") return "bg-emerald-100 text-emerald-700";
    if (lower.includes("asistió") || lower.includes("no asist")) return "bg-red-100 text-red-700";
    if (lower === "cancelada") return "bg-gray-100 text-gray-700";
    return "bg-gray-100 text-gray-700";
  };

  const handleStatusChange = async (appointmentId, estadoNombre) => {
    const estado = estados.find(e => e.nombre.toLowerCase() === estadoNombre.toLowerCase());
    if (!estado) return;
    try {
      const config = getAuthHeaders();
      config.headers["Content-Type"] = "application/json";
      await axios.patch(`${API_URL}/${appointmentId}/estado`, estado.id, config);
      setNotification({ message: `Estado actualizado a ${estadoNombre}`, type: "success" });
      await loadData();
    } catch (err) {
      setNotification({ message: err?.response?.data?.message || "Error al cambiar estado", type: "error" });
    }
  };

  const confirmStatusChange = async (estadoNombre) => {
    if (appointmentToChangeStatus) {
      await handleStatusChange(appointmentToChangeStatus.id, estadoNombre);
      setIsStatusModalOpen(false);
      setAppointmentToChangeStatus(null);
    }
  };

  const confirmDeleteAppointment = async () => {
    if (showDeleteConfirm) {
      try {
        await axios.delete(`${API_URL}/${showDeleteConfirm.id}`, getAuthHeaders());
        setNotification({ message: "Cita eliminada correctamente", type: "success" });
        await loadData();
      } catch (err) {
        setNotification({ message: err?.response?.data?.message || "Error al eliminar", type: "error" });
      }
      setShowDeleteConfirm(null);
    }
  };

  const handleSaveAppointment = async (formData) => {
    try {
      if (editingAppointment) {
        await axios.put(API_URL, { ...formData, id: editingAppointment.id }, getAuthHeaders());
      } else {
        await axios.post(API_URL, formData, getAuthHeaders());
      }
      setNotification({ message: editingAppointment ? "Cita actualizada" : "Cita agendada correctamente", type: "success" });
      await loadData();
      window.dispatchEvent(new CustomEvent("appointments:changed"));
      setIsAppointmentModalOpen(false);
      setEditingAppointment(null);
    } catch (err) {
      setNotification({ message: err?.response?.data?.message || "Error al guardar", type: "error" });
    }
  };

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
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push({ date: new Date(current), appointments: getAppointmentsForDate(current), isToday: current.toDateString() === new Date().toDateString(), isCurrentMonth: current.getMonth() === month });
      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800 capitalize">
            {currentDate.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))} className="p-2 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(d => (
            <div key={d} className="text-center text-sm font-semibold text-gray-600 uppercase pb-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => (
            <div key={i} onClick={() => { setSelectedDate(day.date); setIsDaySummaryModalOpen(true); }}
              className={`min-h-[100px] p-2 border rounded-lg cursor-pointer transition-all
                ${day.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"}
                ${day.isToday ? "ring-2 ring-blue-500" : ""}
                ${day.appointments.length > 0 ? "bg-blue-50/30" : "hover:border-blue-400 hover:shadow-md"}`}>
              <div className="text-sm font-bold mb-1">{day.date.getDate()}</div>
              {day.appointments.length > 0 && (
                <div className="text-blue-500 text-[11px] font-bold">{day.appointments.length} cita{day.appointments.length !== 1 ? "s" : ""}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAppointmentsList = () => {
    const filtered = appointments.filter(apt => {
      const matchSearch =
        (apt.pacienteNombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.servicioNombre || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (apt.medicoNombre || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "Todos" || apt.estadoNombre === statusFilter;
      return matchSearch && matchStatus;
    }).sort((a, b) => new Date(`${b.fecha}T${b.hora}`) - new Date(`${a.fecha}T${a.hora}`));

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Buscar cita..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none">
            <option value="Todos">Todos</option>
            {estados.map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className={`${currentUserRole === "Administrador" ? "bg-emerald-600" : "bg-blue-600"} text-white sticky top-0`}>
                <tr>
                  {["Paciente", "Fecha", "Servicio", "Precio", "Estado", "Acciones"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">Cargando citas...</td></tr>
                ) : currentItems.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">No hay citas registradas.</td></tr>
                ) : (
                  currentItems.map(apt => (
                    <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-800 text-sm">{apt.pacienteNombre}</div>
                        <div className="text-xs text-gray-500">{apt.medicoNombre}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(apt.fecha + "T00:00:00").toLocaleDateString()}
                        <span className="text-xs text-gray-400 block">{apt.hora}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{apt.servicioNombre || "-"}</td>
                      <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                        $ {Number(apt.precio || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(apt.estadoNombre)}`}>
                          {apt.estadoNombre}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center items-center gap-1">
                          <button onClick={() => { setSelectedAppointment(apt); setIsDetailModalOpen(true); }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Ver"><Eye size={16} /></button>
                          <button onClick={() => { setAppointmentToChangeStatus(apt); setIsStatusModalOpen(true); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Cambiar Estado"><Settings size={16} /></button>
                          <button onClick={() => { setEditingAppointment(apt); setIsAppointmentModalOpen(true); }}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Editar"><Edit size={16} /></button>
                          {(apt.estadoNombre || "").toLowerCase() !== "completada" && (
                            <button onClick={() => handleStatusChange(apt.id, "Completada")}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Completar"><CheckCircle size={16} /></button>
                          )}
                          {currentUserRole === "Administrador" && (
                            <button onClick={() => setShowDeleteConfirm(apt)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Eliminar"><Trash2 size={16} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-100 flex-shrink-0">
            <span className="text-xs text-gray-500">Página {currentPage} de {totalPages || 1} ({filtered.length} total)</span>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-1.5 text-gray-600 hover:bg-gray-200 disabled:opacity-50 rounded"><ChevronLeft size={16} /></button>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                className="p-1.5 text-gray-600 hover:bg-gray-200 disabled:opacity-50 rounded"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 font-sans p-6 min-h-screen bg-transparent">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Citas</h1>
          <p className="text-xs text-gray-500 mt-1">Control de agenda y citas médicas</p>
        </div>
        {(activeTab === "calendario" || activeTab === "citas") && (
          <button onClick={() => { setEditingAppointment(null); setIsAppointmentModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 text-sm">
            <Plus size={16} /> Nueva Cita
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: "calendario", icon: Calendar, label: "Calendario" },
          { id: "citas", icon: List, label: "Lista de Citas" },
          { id: "disponibilidad", icon: Settings, label: "Disponibilidad", adminOnly: true },
          { id: "medicos", icon: Users, label: "Médicos", adminOnly: true },
        ].map(tab => {
          if (tab.adminOnly && currentUserRole !== "Administrador") return null;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? "text-blue-600 border-blue-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* KPIs */}
      {(activeTab === "calendario" || activeTab === "citas") && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700 text-sm">Resumen</h3>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {[{ val: "dia", label: "Día" }, { val: "semana", label: "Semana" }, { val: "mes", label: "Mes" }, { val: "año", label: "Año" }].map(p => (
                <button key={p.val} onClick={() => setPeriodFilter(p.val)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${periodFilter === p.val ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase mb-2"><Calendar size={16} /> Citas</div>
              <span className="text-3xl font-bold text-blue-900">{financialSummary.totalCitas}</span>
            </div>
            <div className="p-4 rounded-xl border border-green-100 bg-green-50/50">
              <div className="flex items-center gap-2 text-green-700 font-bold text-xs uppercase mb-2"><TrendingUp size={16} /> Ingresos</div>
              <span className="text-3xl font-bold text-green-900">$ {financialSummary.ingresos.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1">
        {activeTab === "calendario" && renderCalendar()}
        {activeTab === "citas" && renderAppointmentsList()}
        {activeTab === "disponibilidad" && <AvailabilityConfigPage />}
        {activeTab === "medicos" && <DoctorsPage />}
      </div>

      {notification && <StatusNotification message={notification.message} type={notification.type || "success"} duration={3000} onClose={() => setNotification(null)} />}

      {isAppointmentModalOpen && (
        <AppointmentFormModal isOpen={isAppointmentModalOpen}
          onClose={() => { setIsAppointmentModalOpen(false); setEditingAppointment(null); }}
          onSave={handleSaveAppointment} appointment={editingAppointment} doctors={doctors} />
      )}

      {isDetailModalOpen && selectedAppointment && (
        <AppointmentDetailModal isOpen={isDetailModalOpen}
          onClose={() => { setIsDetailModalOpen(false); setSelectedAppointment(null); }}
          appointment={selectedAppointment} />
      )}

      {isDaySummaryModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="font-bold text-gray-800">
                {selectedDate.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
              </h3>
              <button onClick={() => setIsDaySummaryModalOpen(false)}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
            </div>
            <div className="space-y-3">
              {getAppointmentsForDate(selectedDate).length === 0 ? (
                <p className="text-center text-gray-400 py-4">No hay citas para este día.</p>
              ) : (
                getAppointmentsForDate(selectedDate).map(apt => (
                  <div key={apt.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-gray-800">{apt.hora} - {apt.pacienteNombre}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(apt.estadoNombre)}`}>{apt.estadoNombre}</span>
                    </div>
                    <p className="text-xs text-gray-500">{apt.servicioNombre} - {apt.medicoNombre}</p>
                    {(apt.estadoNombre || "").toLowerCase() !== "completada" && (
                      <button onClick={() => handleStatusChange(apt.id, "Completada")}
                        className="mt-2 w-full py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200">
                        Marcar como Completada
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isStatusModalOpen && appointmentToChangeStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="bg-green-50 px-5 py-3 border-b border-green-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <CheckCircle size={18} className="text-green-600" /> Cambiar Estado
              </h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-2">
              {estados.map(e => (
                <button key={e.id} onClick={() => confirmStatusChange(e.nombre)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm border transition-all ${
                    appointmentToChangeStatus.estadoNombre === e.nombre
                      ? "bg-green-50 border-green-500 text-green-700 font-bold"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}>
                  {e.nombre}
                </button>
              ))}
            </div>
            <div className="bg-green-50 border-t border-green-200 p-4">
              <button onClick={() => setIsStatusModalOpen(false)} className="w-full py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-red-50 px-5 py-4 border-b border-red-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <AlertCircle size={18} className="text-red-600" /> Eliminar Cita
              </h3>
              <button onClick={() => setShowDeleteConfirm(null)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5">
              <p className="text-sm text-gray-700">¿Eliminar la cita de <strong>{showDeleteConfirm.pacienteNombre}</strong>?</p>
              <p className="text-xs text-gray-500 mt-2">Fecha: {new Date(showDeleteConfirm.fecha + "T00:00:00").toLocaleDateString()} a las {showDeleteConfirm.hora}</p>
            </div>
            <div className="bg-red-50 border-t border-red-200 px-5 py-3 flex justify-end gap-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-xs font-medium text-gray-600 bg-white hover:bg-gray-50 rounded-lg border border-gray-200">Cancelar</button>
              <button onClick={confirmDeleteAppointment} className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-1.5">
                <Trash2 size={14} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;