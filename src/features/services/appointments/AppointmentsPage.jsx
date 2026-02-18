import React, { useState, useEffect, useMemo } from "react";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog";
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

// Helper para obtener gastos del storage
const getExpensesFromStorage = () => {
  try {
    return JSON.parse(localStorage.getItem("sys_expenses_db") || "[]");
  } catch {
    return [];
  }
};

export const AppointmentsPage = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(
    localStorage.getItem("syspharma_user") || "{}",
  );
  const currentUserRole = currentUser.rol || "Empleado";

  const [activeTab, setActiveTab] = useState("calendario");
  const [periodFilter, setPeriodFilter] = useState("dia");
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");

  // Modales
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDaySummaryModalOpen, setIsDaySummaryModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  const [appointmentToChangeStatus, setAppointmentToChangeStatus] =
    useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  
  // ✅ Paginación para lista de citas
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    loadData();
    const onChange = () => loadData();
    window.addEventListener("appointments:changed", onChange);
    return () => window.removeEventListener("appointments:changed", onChange);
  }, []);

  // ✅ Reset página cuando cambia la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const loadData = () => {
    setAppointments(appointmentService.getAppointments());
    setDoctors(appointmentService.getDoctors());
    setExpenses(getExpensesFromStorage());
  };

  // --- LÓGICA FINANCIERA (CORREGIDA) ---
  const filterByPeriod = (items, dateField) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return items.filter((item) => {
      // ✅ TRUCO: Agregamos T00:00:00 para forzar interpretación local
      // Si la fecha ya viene completa, no importa, pero si es "2026-02-08" evita el bug
      const dateString = item[dateField];
      const itemDate = new Date(
        dateString.includes("T") ? dateString : dateString + "T00:00:00",
      );
      itemDate.setHours(0, 0, 0, 0);

      const itemDateStr = itemDate.toISOString().split("T")[0];
      const todayStr = today.toISOString().split("T")[0];

      if (periodFilter === "dia") return itemDateStr === todayStr;

      if (periodFilter === "semana") {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const startOfWeek = new Date(today);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return itemDate >= startOfWeek && itemDate <= endOfWeek;
      } else if (periodFilter === "mes")
        return (
          itemDate.getMonth() === today.getMonth() &&
          itemDate.getFullYear() === today.getFullYear()
        );
      else if (periodFilter === "año")
        return itemDate.getFullYear() === today.getFullYear();

      return true;
    });
  };

  const financialSummary = useMemo(() => {
    const periodAppointments = filterByPeriod(appointments, "fecha");
    const periodExpenses = filterByPeriod(expenses, "fecha");

    // ✅ SUMAR SOLO COMPLETADAS Y LIMPIAR PRECIO
    const ingresos = periodAppointments
      .filter((apt) => apt.estado === "Completada")
      .reduce((sum, apt) => {
        // Quita todo lo que no sea número o punto decimal (ej: "50.000" -> "50000")
        const cleanPrice = String(apt.precio).replace(/[^0-9.]/g, "");
        return sum + (Number(cleanPrice) || 0);
      }, 0);

    const totalCitas = periodAppointments.length;

    const totalGastos = periodExpenses.reduce((sum, exp) => {
      const cleanMonto = String(exp.monto).replace(/[^0-9.]/g, "");
      return sum + (Number(cleanMonto) || 0);
    }, 0);

    return {
      ingresos,
      gastos: totalGastos,
      balance: ingresos - totalGastos,
      totalCitas,
    };
  }, [appointments, expenses, periodFilter]);

  // --- HELPERS ---
  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((apt) => apt.fecha === dateStr);
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

  // --- HANDLERS ---
  const handleStatusChange = (appointmentId, newStatus) => {
    appointmentService.updateAppointmentStatus(appointmentId, newStatus);
    loadData();
  };

  const confirmStatusChange = (newStatus) => {
    if (appointmentToChangeStatus) {
      handleStatusChange(appointmentToChangeStatus.id, newStatus);
      setIsStatusModalOpen(false);
      setAppointmentToChangeStatus(null);
    }
  };

  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "Confirmar eliminación",
    message: "",
    onConfirm: null,
  });

  const handleDeleteAppointment = (appointmentId) => {
    setConfirmConfig({
      open: true,
      title: "Confirmar eliminación",
      message: "¿Estás seguro de eliminar esta cita?",
      onConfirm: () => {
        appointmentService.deleteAppointment(appointmentId);
        loadData();
      },
    });
  };

  const handleCreateAppointment = () => {
    setEditingAppointment(null);
    setIsAppointmentModalOpen(true);
  };

  const handleCreateExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  // --- RENDERIZADO CALENDARIO ---
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 capitalize">
            {currentDate.toLocaleDateString("es-ES", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <div className="flex gap-1">
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() - 1)),
                )
              }
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(currentDate.setMonth(currentDate.getMonth() + 1)),
                )
              }
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              onClick={() => !day.isUnavailable && handleDateClick(day.date)}
              className={`
                min-h-[70px] p-2 border rounded-lg cursor-pointer transition-all relative
                ${day.isCurrentMonth ? "bg-white" : "bg-gray-50 text-gray-300"}
                ${day.isToday ? "ring-2 ring-emerald-500 z-10" : "border-gray-100"}
                ${day.isUnavailable ? "bg-red-50/50 cursor-not-allowed" : "hover:shadow-md hover:border-emerald-200"}
              `}
            >
              <div className="text-xs font-bold mb-1">{day.date.getDate()}</div>
              {day.appointments.length > 0 && (
                <div className="text-[9px] text-emerald-600 font-semibold mt-1">
                  {day.appointments.length} {day.appointments.length === 1 ? 'cita' : 'citas'}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setIsDaySummaryModalOpen(true);
  };

  // --- RENDERIZADO LISTA ---
  const renderAppointmentsList = () => {
    const filtered = appointments.filter(
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

    // ✅ Ordenar por fecha y hora (más nuevo primero)
    const sorted = filtered.sort((a, b) => {
      const dateA = new Date(`${a.fecha}T${a.hora || "00:00"}`);
      const dateB = new Date(`${b.fecha}T${b.hora || "00:00"}`);
      return dateB - dateA;
    });

    // ✅ Paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sorted.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sorted.length / itemsPerPage);

    const nextPage = () => {
      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    const prevPage = () => {
      if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar cita..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${currentUserRole === "Administrador" ? "bg-emerald-600" : "bg-blue-600"} text-white`}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold">
                    Paciente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold">
                    Servicio
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentItems.length > 0 ? (
                  currentItems.map((apt) => (
                    <tr
                      key={apt.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-800 text-sm">
                          {apt.paciente}
                        </div>
                        <div className="text-xs text-gray-500">
                          {doctors.find((d) => d.id === apt.doctorId)?.nombre}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {/* ✅ FIX FECHA: Forzamos la interpretación local con T00:00:00 */}
                        {new Date(apt.fecha + "T00:00:00").toLocaleDateString()}
                        <span className="text-xs text-gray-400 block">
                          {apt.hora}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {apt.servicio}
                      </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                        $ {Number(apt.precio || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(apt.estado)}`}
                        >
                          {getStatusIcon(apt.estado)} {apt.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center items-center gap-1">
                          <button
                            onClick={() => {
                              setAppointmentToChangeStatus(apt);
                              setIsStatusModalOpen(true);
                            }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Cambiar Estado"
                          >
                            <Settings size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingAppointment(apt);
                              setIsAppointmentModalOpen(true);
                            }}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          {apt.estado !== "Completada" && (
                            <button
                              onClick={() =>
                                handleStatusChange(apt.id, "Completada")
                              }
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Marcar Completada"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {currentUserRole === "Administrador" && (
                            <button
                              onClick={() => handleDeleteAppointment(apt.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-400 text-sm">
                      No hay citas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ✅ Footer de Paginación */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Página {currentPage} de {totalPages || 1} ({sorted.length} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="p-1.5 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                title="Anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1.5 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                title="Siguiente"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col gap-6 font-sans">
      {/* Header General */}
      <div className="flex justify-between items-start flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Citas</h1>
          <p className="text-xs text-gray-500 mt-1">
            Control de agenda y flujo financiero diario
          </p>
        </div>

        {(activeTab === "calendario" || activeTab === "citas") && (
          <div className="flex gap-2">
            <button
              onClick={handleCreateAppointment}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 text-sm transition-transform hover:scale-105"
            >
              <Plus size={16} /> Nueva Cita
            </button>
            <button
              onClick={handleCreateExpense}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 text-sm transition-transform hover:scale-105"
            >
              <Plus size={16} /> Agregar Gasto
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 flex-shrink-0 overflow-x-auto">
        {[
          { id: "calendario", icon: Calendar, label: "Calendario" },
          { id: "citas", icon: List, label: "Lista de Citas" },
          {
            id: "disponibilidad",
            icon: Settings,
            label: "Disponibilidad",
            adminOnly: true,
          },
          { id: "medicos", icon: Users, label: "Médicos", adminOnly: true },
        ].map((tab) => {
          if (tab.adminOnly && currentUserRole !== "Administrador") return null;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* --- SECCIÓN FINANCIERA (ESTADÍSTICAS) --- */}
      {(activeTab === "calendario" || activeTab === "citas") && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-700 text-sm">
              Resumen Financiero
            </h3>
            <div className="flex bg-gray-100 p-1 rounded-lg">
              {[
                { val: "dia", label: "Día" },
                { val: "semana", label: "Semana" },
                { val: "mes", label: "Mes" },
                { val: "año", label: "Año" },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => setPeriodFilter(p.val)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    periodFilter === p.val
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Citas Registradas */}
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex flex-col justify-between h-28">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase">
                <Calendar size={16} /> Citas ({periodFilter})
              </div>
              <div>
                <span className="text-3xl font-bold text-blue-900">
                  {financialSummary.totalCitas}
                </span>
                <p className="text-xs text-blue-600 mt-1">citas registradas</p>
              </div>
            </div>

            {/* 2. Ingresos (Solo Completadas) */}
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col justify-between h-28">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase">
                <TrendingUp size={16} /> Ingresos ({periodFilter})
              </div>
              <div>
                <span className="text-3xl font-bold text-emerald-900">
                  $ {financialSummary.ingresos.toLocaleString()}
                </span>
                <p className="text-xs text-emerald-600 mt-1">
                  Citas Completadas
                </p>
              </div>
            </div>

            {/* 3. Gastos y Balance */}
            <div className="p-4 rounded-xl border border-orange-100 bg-orange-50/50 flex flex-col justify-between h-28">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-700 font-bold text-xs uppercase">
                  <TrendingDown size={16} /> Gastos
                </div>
                <span className="text-xs font-bold text-orange-800">
                  $ {financialSummary.gastos.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-orange-200">
                <p className="text-xs text-gray-500">Balance Neto:</p>
                <span
                  className={`text-xl font-bold ${financialSummary.balance >= 0 ? "text-green-700" : "text-red-600"}`}
                >
                  $ {financialSummary.balance.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal (Outlet de Tabs) */}
      <div className="flex-1 overflow-auto no-scrollbar">
        {activeTab === "calendario" && renderCalendar()}
        {activeTab === "citas" && renderAppointmentsList()}
        {activeTab === "disponibilidad" && <AvailabilityConfigPage />}
        {activeTab === "medicos" && <DoctorsPage />}
      </div>

      {/* --- MODALES --- */}

      {isAppointmentModalOpen && (
        <AppointmentFormModal
          isOpen={isAppointmentModalOpen}
          onClose={() => {
            setIsAppointmentModalOpen(false);
            setEditingAppointment(null);
          }}
          onSave={() => {
            loadData();
            window.dispatchEvent(new CustomEvent('appointments:changed'));
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

      {isDaySummaryModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b pb-2">
              <h3 className="font-bold text-gray-800">
                {selectedDate.toLocaleDateString("es-ES", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h3>
              <button onClick={() => setIsDaySummaryModalOpen(false)}>
                <X size={20} className="text-gray-400 hover:text-red-500" />
              </button>
            </div>

            <div className="space-y-3">
              {getAppointmentsForDate(selectedDate).length === 0 ? (
                <p className="text-center text-gray-400 py-4">
                  No hay citas para este día.
                </p>
              ) : (
                getAppointmentsForDate(selectedDate).map((apt) => (
                  <div
                    key={apt.id}
                    className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-gray-800">
                        {apt.hora} - {apt.paciente}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${getStatusColor(apt.estado)}`}
                      >
                        {apt.estado}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {apt.servicio} -{" "}
                      {doctors.find((d) => d.id === apt.doctorId)?.nombre}
                    </p>
                    {apt.estado !== "Completada" && (
                      <button
                        onClick={() => handleStatusChange(apt.id, "Completada")}
                        className="mt-2 w-full py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                      >
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-bold text-gray-800 mb-4">Cambiar Estado</h3>
            <div className="space-y-2">
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
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm border transition-all ${
                    appointmentToChangeStatus.estado === status
                      ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsStatusModalOpen(false)}
              className="mt-4 w-full py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {isExpenseModalOpen && (
        <ExpenseFormModal
          isOpen={isExpenseModalOpen}
          onClose={() => {
            setIsExpenseModalOpen(false);
            setEditingExpense(null);
          }}
          onSave={(expenseData) => {
            const currentExpenses = getExpensesFromStorage();
            let updatedExpenses;
            if (editingExpense) {
              updatedExpenses = currentExpenses.map((e) =>
                e.id === expenseData.id ? expenseData : e,
              );
            } else {
              updatedExpenses = [
                ...currentExpenses,
                { ...expenseData, id: Date.now() },
              ];
            }
            localStorage.setItem(
              "sys_expenses_db",
              JSON.stringify(updatedExpenses),
            );
            window.dispatchEvent(new CustomEvent('expenses:changed'));
            loadData();
            setIsExpenseModalOpen(false);
            setEditingExpense(null);
          }}
          initialData={editingExpense}
        />
      )}

      <ConfirmDialog
        open={confirmConfig.open}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onCancel={() => setConfirmConfig((c) => ({ ...c, open: false }))}
        onConfirm={() => {
          confirmConfig.onConfirm && confirmConfig.onConfirm();
          setConfirmConfig((c) => ({ ...c, open: false }));
        }}
      />
    </div>
  );
};

export default AppointmentsPage;
