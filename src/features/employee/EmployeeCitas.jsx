import React, { useState, useMemo, useEffect } from "react";
import { Calendar, CheckCircle, Clock, Settings } from "lucide-react";
import { appointmentService } from "../services/appointments/services/appointmentService";

// Parse date-only strings as local dates to avoid timezone shifts
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
};

export const EmployeeCitas = () => {
  const [periodFilter, setPeriodFilter] = useState("dia"); // dia, semana, mes

  // Obtener todas las citas y sus actualizaciones // 
  const [allAppointments, setAllAppointments] = useState(
    appointmentService.getAppointments(),
  );

  useEffect(() => {
    const reload = () =>
      setAllAppointments(appointmentService.getAppointments());
    window.addEventListener("appointments:changed", reload);
    return () => window.removeEventListener("appointments:changed", reload);
  }, []);

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
      const startDate = new Date(today.setDate(diff));
      return startDate;
    } else if (period === "mes") {
      // Primer día del mes
      return new Date(today.getFullYear(), today.getMonth(), 1);
    }
  };

  // Filtrar citas según el período
  const filteredAppointments = useMemo(() => {
    const periodStart = getPeriodStartDate(periodFilter);
    const today = new Date();

    return allAppointments.filter((apt) => {
      const aptDate = parseLocalDate(apt.fecha);
      if (!aptDate) return false;
      aptDate.setHours(0, 0, 0, 0);

      if (periodFilter === "dia") {
        const todayNormalized = new Date();
        todayNormalized.setHours(0, 0, 0, 0);
        return aptDate.getTime() === todayNormalized.getTime();
      } else if (periodFilter === "semana") {
        const endOfWeek = new Date(periodStart);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return aptDate >= periodStart && aptDate <= endOfWeek;
      } else if (periodFilter === "mes") {
        return (
          aptDate.getFullYear() === today.getFullYear() &&
          aptDate.getMonth() === today.getMonth()
        );
      }
    });
  }, [allAppointments, periodFilter]);

  // Métricas
  const totalAppointments = filteredAppointments.length;
  const completedAppointments = useMemo(
    () => filteredAppointments.filter((a) => a.estado === "Completada").length,
    [filteredAppointments],
  );
  const pendingAppointments = useMemo(
    () =>
      filteredAppointments.filter((a) => a.estado === "Confirmar Asistencia")
        .length,
    [filteredAppointments],
  );

  const periodLabels = {
    dia: "del día",
    semana: "de la semana",
    mes: "del mes",
  };

  return (
    <div className="h-full flex flex-col gap-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Citas</h2>
          <p className="text-gray-600">Gestión y control de citas</p>
        </div>

        {/* Selector de Período */}
        <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
          {[
            { value: "dia", label: "Día" },
            { value: "semana", label: "Semana" },
            { value: "mes", label: "Mes" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriodFilter(option.value)}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                periodFilter === option.value
                  ? "bg-blue-600 text-white"
                  : "bg-transparent text-gray-700 hover:bg-gray-100"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards - KPIs */}
      <div className="grid grid-cols-3 gap-3 flex-shrink-0">
        {/* Card 1: Total de Citas */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-cyan-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-cyan-600" size={18} />
            <h3 className="text-sm font-bold text-gray-800">
              Citas {periodLabels[periodFilter]}
            </h3>
          </div>
          <div className="text-2xl font-bold text-cyan-600">
            {totalAppointments}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {totalAppointments} {totalAppointments === 1 ? "cita" : "citas"}
          </div>
        </div>

        {/* Card 2: Completadas */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="text-green-600" size={18} />
            <h3 className="text-sm font-bold text-gray-800">Completadas</h3>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {completedAppointments}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {totalAppointments > 0
              ? `${Math.round((completedAppointments / totalAppointments) * 100)}% completado`
              : "Sin citas"}
          </div>
        </div>

        {/* Card 3: Pendientes */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-yellow-600" size={18} />
            <h3 className="text-sm font-bold text-gray-800">Por confirmar</h3>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {pendingAppointments}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {pendingAppointments}{" "}
            {pendingAppointments === 1 ? "cita pendiente" : "citas pendientes"}
          </div>
        </div>
      </div>

      {/* Listado de Citas */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-800">
            Citas {periodLabels[periodFilter]}
          </h3>
        </div>

        {filteredAppointments.length > 0 ? (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Paciente
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Médico
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Fecha
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Hora
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Servicio
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors relative"
                  >
                    <td className="px-4 py-2">{apt.paciente}</td>
                    <td className="px-4 py-2">
                      {apt.doctorId === 1
                        ? "Dr. Andrés López"
                        : "Enf. María Ruiz"}
                    </td>
                    <td className="px-4 py-2">{apt.fecha}</td>
                    <td className="px-4 py-2 font-medium">{apt.hora}</td>
                    <td className="px-4 py-2">{apt.servicio}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          apt.estado === "Completada"
                            ? "bg-green-100 text-green-700"
                            : apt.estado === "Confirmar Asistencia"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {apt.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <StatusMenuButton appointment={apt} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>No hay citas {periodLabels[periodFilter]}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeCitas;

// Small inline component to show a settings button and status menu per appointment
const StatusMenuButton = ({ appointment }) => {
  const [open, setOpen] = useState(false);

  const statuses = [
    "Confirmar Asistencia",
    "En Consulta",
    "Completada",
    "No Asistió",
    "Cancelada",
  ];

  const changeStatus = (status) => {
    try {
      appointmentService.updateAppointmentStatus(appointment.id, status);
    } catch (e) {}
    // appointmentService dispatches appointments:changed, parent component listens and reloads
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded"
        title="Cambiar estado"
      >
        <Settings size={14} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-100 rounded-md shadow-md z-20">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => changeStatus(s)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b last:border-0"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
