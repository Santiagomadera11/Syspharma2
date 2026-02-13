import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const CalendarPicker = ({
  selectedDate,
  onDateSelect,
  disabledDates = [],
  minDate,
  maxDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const [year, month] = selectedDate.split("-");
      return new Date(parseInt(year), parseInt(month) - 1);
    }
    return new Date();
  });

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    const today = new Date();
    if (currentMonth > today) {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateDisabled = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = getDateString(date);
    
    // Validar rango de fechas
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    
    // Validar si está en la lista de días no disponibles
    if (disabledDates.includes(dateStr)) return true;
    
    return false;
  };

  const handleDateClick = (day) => {
    if (!isDateDisabled(day)) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      onDateSelect(getDateString(date));
    }
  };

  const days = [];
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  // Agregar celdas vacías al inicio
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Agregar días del mes
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthName = currentMonth.toLocaleString("es-ES", { month: "long", year: "numeric" });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-1 hover:bg-gray-100 rounded text-gray-600"
          type="button"
        >
          <ChevronLeft size={18} />
        </button>
        <h3 className="text-sm font-semibold text-gray-700 capitalize">
          {monthName}
        </h3>
        <button
          onClick={handleNextMonth}
          className="p-1 hover:bg-gray-100 rounded text-gray-600"
          type="button"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((dayName) => (
          <div
            key={dayName}
            className="text-center text-[10px] font-semibold text-gray-500 py-1"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendario */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const isDisabled = isDateDisabled(day);
          const isSelected = selectedDate === getDateString(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
          );

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
              type="button"
              className={`
                aspect-square rounded-lg text-xs font-medium
                transition-all duration-150
                flex items-center justify-center
                ${isSelected
                  ? "bg-emerald-600 text-white border border-emerald-700"
                  : isDisabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-300"
                }
              `}
              title={isDisabled ? "Médico no disponible" : ""}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-600" />
          <span className="text-[10px] text-gray-600">Día seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300" />
          <span className="text-[10px] text-gray-600">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100" />
          <span className="text-[10px] text-gray-600">No disponible</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarPicker;
