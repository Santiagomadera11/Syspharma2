import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  List,
  Settings,
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  X,
} from "lucide-react";
import { appointmentService } from "./services/appointmentService";
import { availabilityService } from "./services/availabilityService";
import AppointmentFormModal from "./components/AppointmentFormModal";
import AppointmentDetailModal from "./components/AppointmentDetailModal";

export const AppointmentsPage = () => {
  const navigate = useNavigate();
  // Usuario actual (simulado - en producción vendría de auth)
  const currentUser = JSON.parse(
    localStorage.getItem("syspharma_user") || "{}",
  );
  const currentUserRole = currentUser.rol || "Empleado"; // Administrador o Empleado

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

  // Helper para obtener citas de un día específico
  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((apt) => apt.fecha === dateStr);
  };

  // Helper para colores de estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case "Confirmar Asistencia":
        return "bg-yellow-100 text-yellow-700";
      case "En Consulta":
        return "bg-blue-100 text-blue-700";
      case "Completada":
        return "bg-green-100 text-green-700";
      case "No Asistió":
        return "bg-red-100 text-red-700";
      case "Cancelada":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  // Helper para iconos de estado
  const getStatusIcon = (estado) => {
    switch (estado) {
      case "Confirmar Asistencia":
        return <Clock size={14} />;
      case "En Consulta":
        return <ClockIcon size={14} />;
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

  // Cambiar estado de cita
  const handleStatusChange = (appointmentId, newStatus) => {
    appointmentService.updateAppointmentStatus(appointmentId, newStatus);
    loadData();
  };

  // Eliminar cita (solo ADMIN)
  const handleDeleteAppointment = (appointmentId) => {
    if (currentUserRole === "Administrador") {
      appointmentService.deleteAppointment(appointmentId);
      loadData();
    }
  };

  // Abrir modal de detalle
  const handleViewAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  // Abrir modal de edición
  const handleEditAppointment = (appointment) => {
    setEditingAppointment(appointment);
    setIsAppointmentModalOpen(true);
  };

  // Abrir modal de cambio de estado
  const handleStatusChangeAppointment = (appointment) => {
    setAppointmentToChangeStatus(appointment);
    setIsStatusModalOpen(true);
  };

  // Confirmar cambio de estado
  const confirmStatusChange = (newStatus) => {
    if (appointmentToChangeStatus) {
      handleStatusChange(appointmentToChangeStatus.id, newStatus);
      setIsStatusModalOpen(false);
      setAppointmentToChangeStatus(null);
    }
  };

  // Crear nueva cita
  const handleCreateAppointment = () => {
    setEditingAppointment(null);
    setIsAppointmentModalOpen(true);
  };

  // Calendario: navegar meses
  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  // Calendario: seleccionar día
  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsDaySummaryModalOpen(true);
  };

  // Renderizar calendario
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
      const dayAppointments = getAppointmentsForDate(current);
      const isToday = current.toDateString() === new Date().toDateString();
      const isCurrentMonth = current.getMonth() === month;
      const isUnavailable = availabilityService.isDayUnavailable(
        current.toISOString().split("T")[0],
      );

      days.push({
        date: new Date(current),
        appointments: dayAppointments,
        isToday,
        isCurrentMonth,
        isUnavailable,
      });

      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {/* Header del calendario */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
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
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-semibold text-gray-600"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid de días */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => !day.isUnavailable && handleDateClick(day.date)}
              className={`
                min-h-[80px] p-2 border rounded-lg cursor-pointer transition-colors
                ${day.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"}
                ${day.isToday ? "ring-2 ring-blue-500" : ""}
                ${day.isUnavailable ? "bg-red-50 cursor-not-allowed opacity-50" : "hover:bg-blue-50"}
                ${day.appointments.length > 0 ? "bg-green-50 border-green-200" : ""}
              `}
            >
              <div className="text-sm font-medium mb-1">
                {day.date.getDate()}
              </div>
              {day.appointments.length > 0 && (
                <div className="text-xs text-green-700 font-medium">
                  {day.appointments.length} cita
                  {day.appointments.length !== 1 ? "s" : ""}
                </div>
              )}
              {day.isUnavailable && (
                <div className="text-xs text-red-600 font-medium">
                  No disponible
                </div>
              )}
            </div>
          ))}
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
                  onClick={() => setSelectedDate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {getAppointmentsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay citas programadas para este día
                </p>
              ) : (
                <div className="space-y-3">
                  {getAppointmentsForDate(selectedDate).map((apt) => {
                    const doctor = doctors.find((d) => d.id === apt.doctorId);
                    return (
                      <div
                        key={apt.id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-600" />
                            <span className="font-medium">{apt.paciente}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(apt.estado)}
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(apt.estado)}`}
                            >
                              {apt.estado}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Profesional:</span>{" "}
                            {doctor?.nombre}
                          </div>
                          <div>
                            <span className="font-medium">Hora:</span>{" "}
                            {apt.hora}
                          </div>
                          <div>
                            <span className="font-medium">Servicio:</span>{" "}
                            {apt.servicio}
                          </div>
                          <div>
                            <span className="font-medium">Teléfono:</span>{" "}
                            {apt.telefono}
                          </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => {
                              handleViewAppointment(apt);
                              setSelectedDate(null);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                          >
                            Ver detalle
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renderizar lista de citas
  const renderAppointmentsList = () => {
    const filteredAppointments = appointments.filter(
      (apt) =>
        (apt.paciente?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (apt.servicio?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (
          doctors.find((d) => d.id === apt.doctorId)?.nombre?.toLowerCase() ||
          ""
        ).includes(searchTerm.toLowerCase()),
    );

    return (
      <div className="space-y-4">
        {/* Header con búsqueda y botón crear */}
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar por paciente, servicio o profesional..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={handleCreateAppointment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2"
          >
            <Plus size={16} />
            Nueva Cita
          </button>
        </div>

        {/* Tabla de citas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold">
                    Paciente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">
                    Profesional
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">
                    Hora
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">
                    Servicio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.map((apt) => {
                  const doctor = doctors.find((d) => d.id === apt.doctorId);
                  return (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {apt.paciente}
                          </div>
                          <div className="text-xs text-gray-500">
                            {apt.documento}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {doctor?.nombre}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(apt.fecha).toLocaleDateString("es-ES")}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {apt.hora}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {apt.servicio}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.estado)}`}
                        >
                          {getStatusIcon(apt.estado)}
                          {apt.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStatusChangeAppointment(apt)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Cambiar estado"
                          >
                            <Settings size={16} />
                          </button>

                          <button
                            onClick={() => handleEditAppointment(apt)}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            title="Editar cita"
                          >
                            <Edit size={16} />
                          </button>

                          {currentUserRole === "Empleado" && (
                            <>
                              {apt.estado === "Confirmar Asistencia" && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(apt.id, "En Consulta")
                                  }
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Marcar en consulta"
                                >
                                  <Clock size={16} />
                                </button>
                              )}
                              {apt.estado === "En Consulta" && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(apt.id, "Completada")
                                  }
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Marcar completada"
                                >
                                  <CheckCircle size={16} />
                                </button>
                              )}
                              {(apt.estado === "Confirmada" ||
                                apt.estado === "En Consulta") && (
                                <button
                                  onClick={() =>
                                    handleStatusChange(apt.id, "No Asistió")
                                  }
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Marcar no asistió"
                                >
                                  <XCircle size={16} />
                                </button>
                              )}
                            </>
                          )}

                          {currentUserRole === "Administrador" && (
                            <button
                              onClick={() => handleDeleteAppointment(apt.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Eliminar cita"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron citas
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Citas</h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Sistema completo de agendamiento y seguimiento de citas médicas
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={() => setActiveTab("calendario")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "calendario"
              ? "text-blue-600 border-blue-600"
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
              ? "text-blue-600 border-blue-600"
              : "text-gray-600 border-transparent hover:text-gray-800"
          }`}
        >
          <List size={16} />
          Lista de Citas
        </button>
        <button
          onClick={() => navigate("/admin/citas/disponibilidad")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${"text-gray-600 border-transparent hover:text-gray-800"} ${currentUserRole !== "Administrador" ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={currentUserRole !== "Administrador"}
        >
          <Settings size={16} />
          Configuración de Disponibilidad
        </button>
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

      {/* Modal de resumen del día */}
      {isDaySummaryModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Citas del{" "}
                {selectedDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
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

            <div className="space-y-4">
              {getAppointmentsForDate(selectedDate).length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay citas programadas para este día
                </p>
              ) : (
                getAppointmentsForDate(selectedDate).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border border-gray-200 rounded-lg p-4"
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
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Hora:</strong> {appointment.hora}
                      </p>
                      <p>
                        <strong>Servicio:</strong> {appointment.servicio}
                      </p>
                      <p>
                        <strong>Doctor:</strong>{" "}
                        {doctors.find((d) => d.id === appointment.doctorId)
                          ?.nombre || "N/A"}
                      </p>
                      {appointment.notas && (
                        <p>
                          <strong>Notas:</strong> {appointment.notas}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setIsDetailModalOpen(true);
                          setIsDaySummaryModalOpen(false);
                        }}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Ver detalle
                      </button>
                      {currentUserRole === "Empleado" &&
                        appointment.estado === "Confirmar Asistencia" && (
                          <button
                            onClick={() => {
                              handleStatusChange(appointment.id, "En Consulta");
                              setIsDaySummaryModalOpen(false);
                            }}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                          >
                            Confirmar asistencia
                          </button>
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
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

      {/* Modal de Cambio de Estado */}
      {isStatusModalOpen && appointmentToChangeStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Cambiar Estado de la Cita
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Cita de{" "}
              <span className="font-semibold">
                {appointmentToChangeStatus.paciente}
              </span>{" "}
              - {appointmentToChangeStatus.servicio}
            </p>
            <div className="space-y-2 mb-6">
              {[
                "Confirmar Asistencia",
                "En Consulta",
                "Completada",
                "No Asistió",
                "Cancelada",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() => confirmStatusChange(status)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                    appointmentToChangeStatus.estado === status
                      ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsStatusModalOpen(false);
                  setAppointmentToChangeStatus(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
