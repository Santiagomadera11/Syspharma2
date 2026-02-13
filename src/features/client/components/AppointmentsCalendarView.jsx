import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const AppointmentsCalendarView = ({ appointments, doctors, availabilityService }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDoctorId, setSelectedDoctorId] = useState(doctors.length > 0 ? doctors[0].id : null);  const [refreshKey, setRefreshKey] = useState(0);

  // Escuchar cambios en disponibilidad desde el administrador
  useEffect(() => {
    const handleAvailabilityChange = () => {
      // Forzar re-render del calendario
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener("availability:changed", handleAvailabilityChange);
    // También escuchar cambios en storage para sincronizar entre pestañas
    window.addEventListener("storage", handleAvailabilityChange);

    return () => {
      window.removeEventListener("availability:changed", handleAvailabilityChange);
      window.removeEventListener("storage", handleAvailabilityChange);
    };
  }, []);

  // Validar y refrescar cuando cambia el médico seleccionado
  useEffect(() => {
    // Refrescar datos cuando cambia el médico
    setRefreshKey((prev) => prev + 1);
  }, [selectedDoctorId]);
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getDateString = (day) => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const isDayUnavailable = (day) => {
    if (!selectedDoctorId || !availabilityService) return false;

    const dateStr = getDateString(day);
    
    // Verificar si el día está globalmente no disponible
    if (availabilityService.isDayUnavailable(dateStr)) {
      return true;
    }

    // Verificar si el médico no trabaja ese día - usar datos frescos del service
    const doctorAvailability = availabilityService.getAvailabilityByDoctor(parseInt(selectedDoctorId));
    
    if (doctorAvailability && doctorAvailability.schedule) {
      const dayNum = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
      const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const dayName = dayNames[dayNum];
      
      // Si el schedule para ese día es null, no está disponible
      const daySchedule = doctorAvailability.schedule[dayName];
      if (daySchedule === null || daySchedule === undefined) {
        return true;
      }
    }

    return false;
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Agregar celdas vacías
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Agregar días del mes
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentDate.toLocaleString("es-ES", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col h-full gap-4" key={`calendar-${refreshKey}`}>
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        {/* Selector de Médico */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Selecciona Médico para ver Disponibilidad:
          </label>
          <select
            value={selectedDoctorId}
            onChange={(e) => setSelectedDoctorId(parseInt(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-emerald-400"
          >
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.nombre} — {doctor.especialidad}
              </option>
            ))}
          </select>
        </div>

        {/* Mes y Navegación */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Mes anterior"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-lg font-bold text-gray-800 capitalize flex-1 text-center">
            {monthName}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Próximo mes"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Leyenda */}
        <div className="flex gap-4 mb-4 p-3 bg-gray-50 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-white border-2 border-emerald-300" />
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500" />
            <span>No Disponible</span>
          </div>
        </div>

        {/* Calendario */}
        <div className="grid grid-cols-7 gap-2">
          {/* Encabezados de días */}
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-600 text-xs py-2"
            >
              {day}
            </div>
          ))}

          {/* Días del mes */}
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const unavailable = isDayUnavailable(day);

            return (
              <div
                key={day}
                className={`
                  aspect-square p-3 rounded-lg border-2 font-bold text-sm
                  flex items-center justify-center
                  transition-all
                  ${
                    unavailable
                      ? "bg-red-500 border-red-600 text-white shadow-sm"
                      : "bg-white border-emerald-300 text-gray-800"
                  }
                `}
                title={unavailable ? "Médico no disponible" : "Disponible"}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsCalendarView;
