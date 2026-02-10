import React, { useEffect, useState } from "react";
import { Search, Calendar, List, Plus, X, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { appointmentService } from "../services/appointments/services/appointmentService";
import AppointmentFormModal from "../services/appointments/components/AppointmentFormModal";
import AppointmentDetailModal from "../services/appointments/components/AppointmentDetailModal";
import { availabilityService } from "../services/appointments/services/availabilityService";

export const ClientMisCitas = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("citas");
  const [filterView, setFilterView] = useState("todas");

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    loadData();
    // Escuchar eventos para sincronización en tiempo real
    const onChange = () => loadData();
    window.addEventListener("appointments:changed", onChange);
    window.addEventListener("storage", onChange); // Sincroniza entre pestañas
    
    return () => {
        window.removeEventListener("appointments:changed", onChange);
        window.removeEventListener("storage", onChange);
    };
  }, []);

  const loadData = () => {
    setDoctors(appointmentService.getDoctors());
    const all = appointmentService.getAppointments();
    const currentUser = JSON.parse(localStorage.getItem("syspharma_user") || "{}");

    if (!currentUser || !currentUser.id) return;

    // LÓGICA DE FILTRADO ROBUSTA
    const filtered = all.filter((a) => {
      // 1. Coincidencia por ID de usuario (Prioridad)
      if (a.userId && String(a.userId) === String(currentUser.id)) return true;

      // 2. Coincidencia por Documento (Si el usuario tiene documento registrado)
      if (a.documento && currentUser.documento && String(a.documento).trim() === String(currentUser.documento).trim()) return true;

      // 3. Coincidencia por Email (Respaldo)
      if (a.email && currentUser.email && a.email.toLowerCase() === currentUser.email.toLowerCase()) return true;

      return false;
    });

    // Ordenar: Más recientes primero
    setAppointments(filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)));
  };

  // ✅ AQUÍ ESTÁ LA MAGIA: PRE-LLENAR DATOS
  const openNewAppointment = () => {
    const currentUser = JSON.parse(localStorage.getItem("syspharma_user") || "{}");
    
    setEditingAppointment({
      userId: currentUser.id,
      paciente: currentUser.nombre || currentUser.name || "",
      documento: currentUser.documento || "",
      telefono: currentUser.telefono || "",
      email: currentUser.email || "",
      fecha: "",
      hora: "",
      servicio: "",
      doctorId: "",
      notas: ""
    });
    
    setIsAppointmentModalOpen(true);
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case "Confirmar Asistencia": return "bg-yellow-100 text-yellow-700";
      case "En Consulta": return "bg-blue-100 text-blue-700";
      case "Completada": return "bg-emerald-100 text-emerald-700";
      case "No Asistió": return "bg-red-100 text-red-700";
      case "Cancelada": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case "Confirmar Asistencia": return <Clock size={14} />;
      case "En Consulta": return <Clock size={14} />;
      case "Completada": return <CheckCircle size={14} />;
      case "No Asistió": return <XCircle size={14} />;
      case "Cancelada": return <AlertCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const renderCalendar = () => {
    const currentDate = new Date();
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
      // Ajuste de zona horaria para comparación simple de strings
      const dateStr = current.toISOString().split("T")[0];
      const dayAppointments = appointments.filter((a) => a.fecha === dateStr);
      days.push({ date: new Date(current), count: dayAppointments.length });
      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Calendario</h2>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {["D", "L", "M", "M", "J", "V", "S"].map(d => <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>)}
          {days.map((d, i) => (
            <div key={i} className={`min-h-[70px] p-2 border rounded-lg text-sm ${d.count > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-white'}`}>
              <div className="font-bold text-gray-700">{d.date.getDate()}</div>
              {d.count > 0 && <div className="text-xs text-emerald-600 mt-1 font-medium">{d.count} cita(s)</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAppointmentsList = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const filtered = appointments
      .filter((apt) => {
        // Corrección de fecha para evitar problemas de zona horaria (-5h)
        const dateParts = apt.fecha.split('-');
        const aptDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]); 
        
        if (filterView === "futuras") return aptDate >= today && apt.estado !== "Cancelada";
        if (filterView === "historial") return aptDate < today || apt.estado === "Completada";
        return true;
      })
      .filter((apt) => {
        const q = searchTerm.toLowerCase();
        return (
          (apt.paciente || "").toLowerCase().includes(q) ||
          (apt.servicio || "").toLowerCase().includes(q) ||
          (doctors.find((d) => d.id === apt.doctorId)?.nombre || "").toLowerCase().includes(q)
        );
      });

    return (
      <div className="space-y-4">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar cita..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 bg-gray-100 rounded-md p-1">
             <button onClick={() => setFilterView("futuras")} className={`px-3 py-1 text-xs rounded-md ${filterView === "futuras" ? "bg-white shadow text-emerald-600" : "text-gray-600"}`}>Próximas</button>
             <button onClick={() => setFilterView("historial")} className={`px-3 py-1 text-xs rounded-md ${filterView === "historial" ? "bg-white shadow text-emerald-600" : "text-gray-600"}`}>Historial</button>
             <button onClick={() => setFilterView("todas")} className={`px-3 py-1 text-xs rounded-md ${filterView === "todas" ? "bg-white shadow text-emerald-600" : "text-gray-600"}`}>Todas</button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Servicio</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">Médico</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">Estado</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((apt) => (
                  <tr key={apt.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(apt.fecha + "T00:00:00").toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-bold">{apt.hora}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{apt.servicio}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{doctors.find((d) => d.id === apt.doctorId)?.nombre}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(apt.estado)}`}>
                        {getStatusIcon(apt.estado)} {apt.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2 py-1 text-xs border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Ver
                        </button>
                        {apt.estado !== "Completada" && apt.estado !== "Cancelada" && (
                          <button onClick={() => handleCancelAppointment(apt.id)} className="px-2 py-1 text-xs border border-red-200 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="p-10 text-center text-gray-400 text-sm">No tienes citas en esta sección.</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6 font-sans">
      <div className="flex justify-between items-start flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Citas</h1>
          <p className="text-xs text-gray-500 mt-1">Gestión de citas personales</p>
        </div>
        <button onClick={openNewAppointment} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 text-sm transition-transform hover:scale-105">
          <Plus size={16} /> Agendar Cita
        </button>
      </div>

      <div className="flex gap-2 border-b border-gray-200 flex-shrink-0">
        <button onClick={() => setActiveTab('citas')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'citas' ? 'text-emerald-600 border-emerald-600' : 'text-gray-500 border-transparent'}`}><List size={16}/> Lista</button>
        <button onClick={() => setActiveTab('calendario')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'calendario' ? 'text-emerald-600 border-emerald-600' : 'text-gray-500 border-transparent'}`}><Calendar size={16}/> Calendario</button>
      </div>

      <div className="flex-1 overflow-auto no-scrollbar">
        {activeTab === "citas" ? renderAppointmentsList() : <div className="p-4 text-center">Calendario (Vista Simple)</div>}
      </div>

      {isAppointmentModalOpen && (
        <AppointmentFormModal
          isOpen={isAppointmentModalOpen}
          onClose={() => setIsAppointmentModalOpen(false)}
          onSave={(created) => {
            loadData();
            window.dispatchEvent(new Event("appointments:changed")); 
            setIsAppointmentModalOpen(false);
          }}
          appointment={editingAppointment}
          doctors={doctors}
          availabilityService={availabilityService}
        />
      )}

      {isDetailModalOpen && selectedAppointment && (
        <AppointmentDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          appointment={selectedAppointment}
          doctors={doctors}
        />
      )}
    </div>
  );
};

export default ClientMisCitas;
