import React, { useState, useEffect } from "react";
import {
  Calendar,
  List,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle,
  Clock as ClockIcon,
  XCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { appointmentService } from "../services/appointments/services/appointmentService";
import { availabilityService } from "../services/appointments/services/availabilityService";
import AppointmentFormModal from "../services/appointments/components/AppointmentFormModal";
import AppointmentDetailModal from "../services/appointments/components/AppointmentDetailModal";

export const EmployeeAppointmentsPage = () => {
  const [activeTab, setActiveTab] = useState("calendario");
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Modales
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDaySummaryModalOpen, setIsDaySummaryModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [appointmentToChangeStatus, setAppointmentToChangeStatus] =
    useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAppointments(appointmentService.getAppointments());
    setDoctors(appointmentService.getDoctors());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmada":
        return "bg-green-100 text-green-700";
      case "Pendiente":
        return "bg-yellow-100 text-yellow-700";
      case "Cancelada":
        return "bg-red-100 text-red-700";
      case "Completada":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Confirmada":
        return <CheckCircle size={14} className="inline" />;
      case "Pendiente":
        return <AlertCircle size={14} className="inline" />;
      case "Cancelada":
        return <XCircle size={14} className="inline" />;
      case "Completada":
        return <CheckCircle size={14} className="inline" />;
      default:
        return null;
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty days
    for (let i = 0; i < firstDay; i++) {
      days.push({
        date: null,
        isCurrentMonth: false,
        isToday: false,
        isUnavailable: false,
        appointments: [],
      });
    }

    // Days of month
    for (let date = 1; date <= daysInMonth; date++) {
      const dayDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        date,
      );
      const isToday =
        dayDate.toDateString() === new Date().toDateString();
      const dayAppointments = appointments.filter(
        (apt) =>
          new Date(apt.fecha).toDateString() === dayDate.toDateString(),
      );

      days.push({
        date: dayDate,
        isCurrentMonth: true,
        isToday,
        isUnavailable: false,
        appointments: dayAppointments,
      });
    }

    return (
      <div className="space-y-2">
        {/* Contenedor del calendario */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          {/* Header del calendario */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-800">
              {currentDate.toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => navigateMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => navigateMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div
                key={day}
                className="p-1 text-center text-xs font-semibold text-gray-600"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day, index) => (
              <div
                key={index}
                onClick={() => day.isCurrentMonth && handleDateClick(day.date)}
                className={`
                  min-h-[60px] p-1 border rounded-lg cursor-pointer transition-colors
                  ${day.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"}
                  ${day.isToday ? "ring-2 ring-green-500" : ""}
                  ${day.isUnavailable ? "bg-red-50 cursor-not-allowed opacity-50" : "hover:bg-green-50"}
                  ${day.appointments.length > 0 ? "bg-green-50 border-green-200" : ""}
                `}
              >
                <div className="text-xs font-medium mb-0.5">
                  {day.date?.getDate()}
                </div>
                {day.appointments.length > 0 && (
                  <div className="text-xs text-green-700 font-medium">
                    {day.appointments.length} cita
                    {day.appointments.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal de resumen del día */}
        {selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  Citas del{" "}
                  {selectedDate.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <button
                  onClick={() => {
                    setIsDaySummaryModalOpen(false);
                    setSelectedDate(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-3">
                {getAppointmentsForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No hay citas programadas para este día
                  </p>
                ) : (
                  getAppointmentsForDate(selectedDate).map((appointment) => (
                    <div
                      key={appointment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {appointment.paciente}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.estado)}`}
                        >
                          {getStatusIcon(appointment.estado)}
                          <span className="ml-1">{appointment.estado}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          {appointment.hora}
                        </div>
                        <div className="flex items-center gap-2">
                          <User size={14} />
                          {doctors.find((d) => d.id === appointment.doctorId)
                            ?.nombre || "N/A"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsDaySummaryModalOpen(true);
  };

  const getAppointmentsForDate = (date) => {
    return appointments.filter(
      (apt) => new Date(apt.fecha).toDateString() === date.toDateString(),
    );
  };

  const renderAppointmentsList = () => {
    const filteredAppointments = appointments.filter(
      (apt) =>
        (apt.paciente && apt.paciente.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (apt.telefono && apt.telefono.includes(searchTerm)) ||
        (apt.email && apt.email.toLowerCase().includes(searchTerm.toLowerCase())),
    );

    return (
      <div className="space-y-4">
        <div>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-3 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-300"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-green-600 text-white">
              <tr>
                <th className="px-4 py-2.5 text-left text-sm font-semibold">
                  Paciente
                </th>
                <th className="px-4 py-2.5 text-left text-sm font-semibold">
                  Fecha
                </th>
                <th className="px-4 py-2.5 text-left text-sm font-semibold">
                  Hora
                </th>
                <th className="px-4 py-2.5 text-left text-sm font-semibold">
                  Médico
                </th>
                <th className="px-4 py-2.5 text-left text-sm font-semibold">
                  Estado
                </th>
                <th className="px-4 py-2.5 text-left text-sm font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-t border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-4 py-2.5 text-sm text-gray-800">
                    {appointment.paciente}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">
                    {new Date(appointment.fecha).toLocaleDateString("es-ES")}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">
                    {appointment.hora}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-600">
                    {doctors.find((d) => d.id === appointment.doctorId)
                      ?.nombre || "N/A"}
                  </td>
                  <td className="px-4 py-2.5 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getStatusColor(appointment.estado)}`}
                    >
                      {getStatusIcon(appointment.estado)}
                      {appointment.estado}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setIsDetailModalOpen(true);
                        }}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingAppointment(appointment);
                          setIsAppointmentModalOpen(true);
                        }}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Editar"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              "¿Estás seguro de que deseas eliminar esta cita?",
                            )
                          ) {
                            appointmentService.deleteAppointment(appointment.id);
                            loadData();
                          }
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header con tabs y botón */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("calendario")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "calendario"
                ? "text-green-600 border-green-600"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
          >
            <Calendar size={16} />
            Calendario
          </button>
          <button
            onClick={() => setActiveTab("citas")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "citas"
                ? "text-green-600 border-green-600"
                : "text-gray-600 border-transparent hover:text-gray-800"
            }`}
          >
            <List size={16} />
            Lista de Citas
          </button>
        </div>

        {(activeTab === "calendario" || activeTab === "citas") && (
          <button
            onClick={() => {
              setEditingAppointment(null);
              setIsAppointmentModalOpen(true);
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 h-fit"
          >
            <Plus size={16} />
            Nueva Cita
          </button>
        )}
      </div>

      {/* Contenido de las tabs */}
      <div className="flex-1 overflow-auto">
        {activeTab === "calendario" && renderCalendar()}
        {activeTab === "citas" && renderAppointmentsList()}
      </div>

      {/* Modales */}
      {isAppointmentModalOpen && (
        <AppointmentFormModal
          isOpen={isAppointmentModalOpen}
          onClose={() => {
            setIsAppointmentModalOpen(false);
            setEditingAppointment(null);
          }}
          onSave={() => {
            loadData();
            setIsAppointmentModalOpen(false);
            setEditingAppointment(null);
          }}
          appointment={editingAppointment}
          doctors={doctors}
          availabilityService={availabilityService}
        />
      )}

      {/* Modal de detalles */}
      {isDetailModalOpen && selectedAppointment && (
        <AppointmentDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          doctor={doctors.find((d) => d.id === selectedAppointment.doctorId)}
          onMarkCompleted={() => {
            appointmentService.updateAppointment(selectedAppointment.id, {
              ...selectedAppointment,
              estado: "Completada",
            });
            loadData();
            setIsDetailModalOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeAppointmentsPage;
