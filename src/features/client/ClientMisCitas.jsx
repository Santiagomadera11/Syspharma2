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
  const [filterView, setFilterView] = useState("futuras");

  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    loadData();
    const onChange = () => loadData();
    window.addEventListener("appointments:changed", onChange);
    return () => window.removeEventListener("appointments:changed", onChange);
  }, []);

  const loadData = () => {
    setDoctors(appointmentService.getDoctors());
    const all = appointmentService.getAppointments();
    const currentUser = JSON.parse(localStorage.getItem("syspharma_user") || "{}");

    

    // Filtrar citas pertenecientes al cliente actual por `userId` cuando esté disponible.
    const filtered = all.filter((a) => {
      if (!currentUser) return false;
      // 1) Match por userId si existe
      if (a.userId && currentUser.id) return a.userId === currentUser.id;

      // 2) Match por documento o teléfono si el usuario los tiene
      if (a.documento && currentUser.documento && String(a.documento) === String(currentUser.documento)) return true;
      if (a.telefono && currentUser.telefono && String(a.telefono) === String(currentUser.telefono)) return true;

      // 3) Match por email si la cita lo incluyera
      if (a.email && currentUser.email && a.email === currentUser.email) return true;

      // 4) Fallback por nombre (comparación parcial, insensible)
      if (currentUser.nombre && a.paciente && a.paciente.toLowerCase().includes(currentUser.nombre.toLowerCase())) return true;

      return false;
    });

    setAppointments(filtered);
  };

  const openNewAppointment = () => {
    const currentUser = JSON.parse(localStorage.getItem("syspharma_user") || "{}");
    // Prellenar paciente si hay nombre
    if (currentUser && currentUser.nombre) {
      setEditingAppointment({ paciente: currentUser.nombre });
    } else {
      setEditingAppointment(null);
    }
    setIsAppointmentModalOpen(true);
  };

  const handleCancelAppointment = (id) => {
    if (!window.confirm("¿Deseas cancelar esta cita?")) return;
    appointmentService.cancelAppointment(id);
    loadData();
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case "Confirmar Asistencia":
        return "bg-yellow-100 text-yellow-700";
      case "En Consulta":
        return "bg-blue-100 text-blue-700";
      case "Completada":
        return "bg-emerald-100 text-emerald-700";
      case "No Asistió":
        return "bg-red-100 text-red-700";
      case "Cancelada":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (estado) => {
    switch (estado) {
      case "Confirmar Asistencia":
        return <Clock size={14} />;
      case "En Consulta":
        return <Clock size={14} />;
      case "Completada":
        return <CheckCircle size={14} />;
      case "No Asistió":
        return <XCircle size={14} />;
      case "Cancelada":
        return <AlertCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const renderCalendar = () => {
    // Calendario simple: mostrar días con número de citas
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
          {days.map((d, i) => (
            <div key={i} className="min-h-[70px] p-2 border rounded-lg text-sm">
              <div className="font-bold">{d.date.getDate()}</div>
              {d.count > 0 && <div className="text-xs text-gray-500 mt-1">{d.count} cita(s)</div>}
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
        // Filtrado por vista (historial / futuras / todas)
        const aptDate = new Date((apt.fecha || "") + "T00:00:00");
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
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="hidden sm:flex items-center bg-gray-100 rounded-md p-1">
              {[
                { id: "futuras", label: "Futuras" },
                { id: "historial", label: "Historial" },
                { id: "todas", label: "Todas" },
              ].map((v) => (
                <button key={v.id} onClick={() => setFilterView(v.id)} className={`px-3 py-1 text-xs rounded-md ${filterView === v.id ? "bg-white text-emerald-600 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}>
                  {v.label}
                </button>
              ))}
            </div>
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
                    <td className="px-4 py-3 text-sm text-gray-600">{apt.fecha}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{apt.hora}</td>
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
                          className="px-2 py-1 text-xs border rounded-lg"
                        >
                          Ver
                        </button>
                        {apt.estado !== "Completada" && apt.estado !== "Cancelada" && (
                          <button onClick={() => handleCancelAppointment(apt.id)} className="px-2 py-1 text-xs border rounded-lg text-red-600">
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
          {filtered.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">No tienes citas registradas.</div>}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6 font-sans">
      <div className="flex justify-between items-start flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mis Citas</h1>
          <p className="text-xs text-gray-500 mt-1">Aquí puedes ver y gestionar tus citas personales</p>
        </div>
        <div className="flex gap-2">
          <button onClick={openNewAppointment} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 text-sm">
            <Plus size={16} /> Agendar Cita
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 flex-shrink-0 overflow-x-auto">
        {[{ id: "citas", icon: List, label: "Lista" }, { id: "calendario", icon: Calendar, label: "Calendario" }].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? "text-emerald-600 border-emerald-600" : "text-gray-500 border-transparent hover:text-gray-700"}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto no-scrollbar">
        {activeTab === "calendario" && renderCalendar()}
        {activeTab === "citas" && renderAppointmentsList()}
      </div>

      {isAppointmentModalOpen && (
        <AppointmentFormModal
          isOpen={isAppointmentModalOpen}
          onClose={() => {
            setIsAppointmentModalOpen(false);
            setEditingAppointment(null);
          }}
          onSave={(created) => {
            // If a created appointment object is provided, insert it immediately
            if (created && created.id) {
              setAppointments((prev) => [...prev, created]);
            }
            // Refrescar desde storage por si hay cambios adicionales
            loadData();
            setTimeout(() => loadData(), 120);
            setIsAppointmentModalOpen(false);
            setEditingAppointment(null);
          }}
          appointment={editingAppointment}
          doctors={doctors}
          availabilityService={availabilityService}
        />
      )}

      {isDetailModalOpen && selectedAppointment && (
        <AppointmentDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          doctors={doctors}
        />
      )}
    </div>
  );
};

export default ClientMisCitas;
