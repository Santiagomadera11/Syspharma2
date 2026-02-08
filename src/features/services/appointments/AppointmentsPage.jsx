import React, { useState, useEffect, useMemo } from "react";
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
  Users,
} from "lucide-react";
import { appointmentService } from "./services/appointmentService";
import { availabilityService } from "./services/availabilityService";
import AppointmentFormModal from "./components/AppointmentFormModal";
import AppointmentDetailModal from "./components/AppointmentDetailModal";
import ExpenseFormModal from "./components/ExpenseFormModal";
import { AvailabilityConfigPage } from "./AvailabilityConfigPage";
import DoctorsPage from "../doctors/DoctorsPage";

export const AppointmentsPage = () => {
  const navigate = useNavigate();
  // Usuario actual (simulado - en producción vendría de auth)
  const currentUser = JSON.parse(
    localStorage.getItem("syspharma_user") || "{}",
  );
  const currentUserRole = currentUser.rol || "Empleado"; // Administrador o Empleado

  const [activeTab, setActiveTab] = useState("calendario");
  const [periodFilter, setPeriodFilter] = useState("dia"); // dia, semana, mes
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
  const [expenses, setExpenses] = useState([]);
  const [dailyExpense, setDailyExpense] = useState("");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setAppointments(appointmentService.getAppointments());
    setDoctors(appointmentService.getDoctors());
  };

  // Función para obtener fecha del inicio del período
  const getPeriodStartDate = (period) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === "dia") {
      return today;
    } else if (period === "semana") {
      // Lunes de la semana actual
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      const startDate = new Date(today);
      startDate.setDate(diff);
      return startDate;
    } else if (period === "mes") {
      // Primer día del mes
      return new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (period === "año") {
      // Primer día del año
      return new Date(today.getFullYear(), 0, 1);
    }
  };

  // Filtrar citas según el período
  const filteredAppointmentsByPeriod = useMemo(() => {
    const periodStart = getPeriodStartDate(periodFilter);
    const today = new Date();

    return appointments.filter((apt) => {
      const aptDate = new Date(apt.fecha);
      aptDate.setHours(0, 0, 0, 0);

      if (periodFilter === "dia") {
        const todayNormalized = new Date();
        todayNormalized.setHours(0, 0, 0, 0);
        return aptDate.getTime() === todayNormalized.getTime();
      } else if (periodFilter === "semana") {
        const endOfWeek = new Date(periodStart);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        return aptDate >= periodStart && aptDate <= endOfWeek;
      } else if (periodFilter === "mes") {
        return (
          aptDate.getFullYear() === today.getFullYear() &&
          aptDate.getMonth() === today.getMonth()
        );
      } else if (periodFilter === "año") {
        return aptDate.getFullYear() === today.getFullYear();
      }
    });
  }, [appointments, periodFilter]);

  // Métricas
  const totalAppointments = filteredAppointmentsByPeriod.length;
  const totalValue = useMemo(
    () =>
      filteredAppointmentsByPeriod.reduce(
        (sum, a) => sum + (Number(a.valor) || 0),
        0
      ),
    [filteredAppointmentsByPeriod]
  );

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
        return "bg-green-100 text-green-700";
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
                onClick={() => !day.isUnavailable && handleDateClick(day.date)}
                className={`
                  min-h-[60px] p-1 border rounded-lg cursor-pointer transition-colors
                  ${day.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-400"}
                  ${day.isToday ? "ring-2 ring-green-500" : ""}
                  ${day.isUnavailable ? "bg-red-50 cursor-not-allowed opacity-50" : "hover:bg-blue-50"}
                  ${day.appointments.length > 0 ? "bg-green-50 border-green-200" : ""}
                `}
              >
                <div className="text-xs font-medium mb-0.5">
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
        </div>

        {/* Modal de resumen del día */}
        {selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto no-scrollbar">
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
                            className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
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
        {/* Header con búsqueda */}
        <div className="flex items-center gap-4">
          <div className="flex-1 max-w-md relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar por paciente, servicio o profesional..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabla de citas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-green-600 text-white">
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
                            onClick={() => handleViewAppointment(apt)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                          </button>

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
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
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
        {(activeTab === "calendario" || activeTab === "citas") && (
          <div className="flex gap-2">
            <button
              onClick={handleCreateAppointment}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 h-fit"
            >
              <Plus size={16} />
              Nueva Cita
            </button>
            <button
              onClick={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 h-fit"
            >
              <Plus size={16} />
              Agregar Gasto
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 flex-shrink-0 flex-wrap">
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
          onClick={() => setActiveTab("disponibilidad")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "disponibilidad"
              ? "text-blue-600 border-blue-600"
              : "text-gray-600 border-transparent hover:text-gray-800"
          } ${currentUserRole !== "Administrador" ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={currentUserRole !== "Administrador"}
        >
          <Settings size={16} />
          Disponibilidad
        </button>
        <button
          onClick={() => setActiveTab("medicos")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "medicos"
              ? "text-blue-600 border-blue-600"
              : "text-gray-600 border-transparent hover:text-gray-800"
          } ${currentUserRole !== "Administrador" ? "opacity-50 cursor-not-allowed" : ""}`}
          disabled={currentUserRole !== "Administrador"}
        >
          <Users size={16} />
          Médicos
        </button>
      </div>

      {/* Cards - KPIs (mostrar solo en tabs de calendario y citas) */}
      {(activeTab === "calendario" || activeTab === "citas") && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Estadísticas</h3>
            {/* Selector de Período */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              {[
                { value: "dia", label: "Día" },
                { value: "semana", label: "Semana" },
                { value: "mes", label: "Mes" },
                { value: "año", label: "Año" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPeriodFilter(option.value)}
                  className={`px-3 py-1 rounded-md font-medium text-xs transition-colors ${
                    periodFilter === option.value
                      ? "bg-blue-600 text-white"
                      : "bg-transparent text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {/* Card 1: Total de Citas */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-cyan-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-cyan-600" size={18} />
                <h3 className="text-xs font-bold text-gray-800">
                  Citas {periodFilter === "dia" ? "del día" : periodFilter === "semana" ? "de la semana" : periodFilter === "mes" ? "del mes" : "del año"}
                </h3>
              </div>
              <div className="text-2xl font-bold text-cyan-600">
                {totalAppointments}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {totalAppointments === 1 ? "cita" : "citas"} registradas
              </div>
            </div>
            {/* Card 2: Ingresos totales (monto en pesos) */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-600">$</span>
                <h3 className="text-xs font-bold text-gray-800">Ingresos {periodFilter === "dia" ? "del día" : periodFilter === "semana" ? "de la semana" : periodFilter === "mes" ? "del mes" : "del año"}</h3>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {totalValue.toLocaleString("es-ES", { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-gray-500 mt-1">Pesos</div>
            </div>
            {/* Card 3: Gastos del día */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-orange-600\">$</span>
                <h3 className="text-xs font-bold text-gray-800\">Gastos del día</h3>
              </div>
              <div className="text-2xl font-bold text-orange-600\">
                {expenses
                  .filter(e => {
                    const today = new Date().toISOString().split('T')[0];
                    const expDate = typeof e.fecha === 'string' ? e.fecha.split('T')[0] : new Date(e.fecha).toISOString().split('T')[0];
                    return expDate === today;
                  })
                  .reduce((sum, e) => sum + (Number(e.monto) || 0), 0)
                  .toLocaleString("es-ES", { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-gray-500 mt-1\">Pesos</div>
            </div>          </div>
        </div>
      )}

      {/* Contenido de las tabs */}
      <div className="flex-1 overflow-auto no-scrollbar">
        {activeTab === "calendario" && renderCalendar()}
        {activeTab === "citas" && renderAppointmentsList()}
        {activeTab === "disponibilidad" && <AvailabilityConfigPage />}
        {activeTab === "medicos" && <DoctorsPage />}
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
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto no-scrollbar">
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
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-cyan-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Total del día en pesos:</span>
                      <span className="text-2xl font-bold text-cyan-600">
                        ${getAppointmentsForDate(selectedDate)
                          .reduce((sum, apt) => sum + (Number(apt.valor) || 0), 0)
                          .toLocaleString("es-ES", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                  {getAppointmentsForDate(selectedDate).map((appointment) => (
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
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
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
                  }
                </>
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

      {/* Modal de Gastos */}
      <ExpenseFormModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={(expenseData) => {
          if (editingExpense) {
            setExpenses(expenses.map(e => e.id === expenseData.id ? expenseData : e));
          } else {
            setExpenses([...expenses, expenseData]);
          }
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        initialData={editingExpense}
      />
    </div>
  );
};

export default AppointmentsPage;
