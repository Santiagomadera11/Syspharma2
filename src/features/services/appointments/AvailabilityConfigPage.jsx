import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Save,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { availabilityService } from "./services/availabilityService";
import { appointmentService } from "./services/appointmentService";
import { StatusNotification } from "/src/shared/ui/StatusNotification";

export const AvailabilityConfigPage = () => {
  const [availability, setAvailability] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [notification, setNotification] = useState(null);
  const [doctorSchedule, setDoctorSchedule] = useState({
    monday: {
      morning: { start: "08:00", end: "12:00" },
      afternoon: { start: "14:00", end: "18:00" },
    },
    tuesday: {
      morning: { start: "08:00", end: "12:00" },
      afternoon: { start: "14:00", end: "18:00" },
    },
    wednesday: {
      morning: { start: "08:00", end: "12:00" },
      afternoon: { start: "14:00", end: "18:00" },
    },
    thursday: {
      morning: { start: "08:00", end: "12:00" },
      afternoon: { start: "14:00", end: "18:00" },
    },
    friday: {
      morning: { start: "08:00", end: "12:00" },
      afternoon: { start: "14:00", end: "18:00" },
    },
    saturday: null,
    sunday: null,
  });
  const [newUnavailableDay, setNewUnavailableDay] = useState({
    date: "",
    reason: "",
  });
  const [unavailableDays, setUnavailableDays] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      const existingAvailability = availability.find(
        (a) => a.doctorId === selectedDoctor.id,
      );
      if (existingAvailability) {
        setDoctorSchedule(existingAvailability.schedule);
      } else {
        // Reset to default
        setDoctorSchedule({
          monday: {
            morning: { start: "08:00", end: "12:00" },
            afternoon: { start: "14:00", end: "18:00" },
          },
          tuesday: {
            morning: { start: "08:00", end: "12:00" },
            afternoon: { start: "14:00", end: "18:00" },
          },
          wednesday: {
            morning: { start: "08:00", end: "12:00" },
            afternoon: { start: "14:00", end: "18:00" },
          },
          thursday: {
            morning: { start: "08:00", end: "12:00" },
            afternoon: { start: "14:00", end: "18:00" },
          },
          friday: {
            morning: { start: "08:00", end: "12:00" },
            afternoon: { start: "14:00", end: "18:00" },
          },
          saturday: null,
          sunday: null,
        });
      }
    }
  }, [selectedDoctor?.id]);

  const loadData = async () => {
    const doctorsData = await appointmentService.getDoctors();
    setDoctors(doctorsData);
    setAvailability(availabilityService.getAvailability());
    setUnavailableDays(availabilityService.getUnavailableDays());
  };

  const handleScheduleChange = (day, period, field, value) => {
    setDoctorSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: {
          ...prev[day]?.[period],
          [field]: value,
        },
      },
    }));
  };

  const toggleDayAvailability = (day) => {
    setDoctorSchedule((prev) => ({
      ...prev,
      [day]: prev[day]
        ? null
        : {
            morning: { start: "08:00", end: "12:00" },
            afternoon: { start: "14:00", end: "18:00" },
          },
    }));
  };

  const handleSaveSchedule = () => {
    if (!selectedDoctor) return;

    try {
      availabilityService.updateAvailability(selectedDoctor.id, doctorSchedule);
      setNotification({
        message: "Horario guardado exitosamente",
        type: "success",
      });
      // Emitir evento para actualizar clientes en tiempo real
      window.dispatchEvent(new Event("availability:changed"));
      loadData(); // Recargar datos
    } catch {
      setNotification({
        message: "Error al guardar el horario",
        type: "error",
      });
    }
  };

  const handleAddUnavailableDay = () => {
    if (!newUnavailableDay.date) {
      setNotification({
        message: "Por favor seleccione una fecha",
        type: "error",
      });
      return;
    }

    try {
      availabilityService.addUnavailableDay(
        newUnavailableDay.date,
        newUnavailableDay.reason,
      );
      setNewUnavailableDay({ date: "", reason: "" });
      setNotification({
        message: "Día no disponible agregado correctamente",
        type: "success",
      });
      
      // Emitir evento para actualizar clientes en tiempo real
      window.dispatchEvent(new Event("availability:changed"));
      
      loadData(); // Recargar datos
    } catch {
      setNotification({
        message: "Error al agregar el día no disponible",
        type: "error",
      });
    }
  };

  const dayNames = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
  };

  return (
    <div className="bg-gray-50 h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto px-2 py-2">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Configuración de Disponibilidad
          </h2>

          <div className="space-y-3">
            {/* Selección de Médico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Profesional Médico
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                value={selectedDoctor?.id || ""}
                onChange={(e) => {
                  const doctor = doctors.find(
                    (d) => d.id === parseInt(e.target.value),
                  );
                  setSelectedDoctor(doctor);
                }}
              >
                <option value="">Seleccionar médico</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.nombre} - {doctor.especialidad}
                  </option>
                ))}
              </select>
            </div>

            {/* Configuración de Horarios */}
            {selectedDoctor && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-800">
                    Horarios de {selectedDoctor.nombre}
                  </h3>
                  <button
                    onClick={handleSaveSchedule}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <Save size={16} />
                    Guardar Horario
                  </button>
                </div>

                <div className="grid gap-2">
                  {Object.entries(dayNames).map(([dayKey, dayName]) => (
                    <div key={dayKey} className="border rounded-lg p-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-800">{dayName}</h4>
                        <button
                          onClick={() => toggleDayAvailability(dayKey)}
                          className={`px-3 py-1 rounded text-sm ${
                            doctorSchedule[dayKey]
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {doctorSchedule[dayKey]
                            ? "Disponible"
                            : "No disponible"}
                        </button>
                      </div>

                      {doctorSchedule[dayKey] && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {/* Mañana */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Mañana
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="time"
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                                value={
                                  doctorSchedule[dayKey].morning?.start || ""
                                }
                                onChange={(e) =>
                                  handleScheduleChange(
                                    dayKey,
                                    "morning",
                                    "start",
                                    e.target.value,
                                  )
                                }
                              />
                              <span className="flex items-center text-gray-500">
                                a
                              </span>
                              <input
                                type="time"
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                                value={
                                  doctorSchedule[dayKey].morning?.end || ""
                                }
                                onChange={(e) =>
                                  handleScheduleChange(
                                    dayKey,
                                    "morning",
                                    "end",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>

                          {/* Tarde */}
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Tarde
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="time"
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                                value={
                                  doctorSchedule[dayKey].afternoon?.start || ""
                                }
                                onChange={(e) =>
                                  handleScheduleChange(
                                    dayKey,
                                    "afternoon",
                                    "start",
                                    e.target.value,
                                  )
                                }
                              />
                              <span className="flex items-center text-gray-500">
                                a
                              </span>
                              <input
                                type="time"
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                                value={
                                  doctorSchedule[dayKey].afternoon?.end || ""
                                }
                                onChange={(e) =>
                                  handleScheduleChange(
                                    dayKey,
                                    "afternoon",
                                    "end",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Días No Disponibles */}
            <div className="border-t pt-2">
              <h3 className="text-base font-semibold text-gray-800 mb-2">
                Días No Disponibles
              </h3>

              {/* Agregar nuevo día no disponible */}
              <div className="bg-gray-50 p-2 rounded-lg mb-2">
                <h4 className="font-medium text-gray-700 mb-2">
                  Agregar Día No Disponible
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                      value={newUnavailableDay.date}
                      onChange={(e) =>
                        setNewUnavailableDay({
                          ...newUnavailableDay,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Motivo (opcional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300"
                      placeholder="Ej: Vacaciones, Enfermedad..."
                      value={newUnavailableDay.reason}
                      onChange={(e) =>
                        setNewUnavailableDay({
                          ...newUnavailableDay,
                          reason: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleAddUnavailableDay}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de días no disponibles */}
              <div className="space-y-2">
                {unavailableDays.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No hay días marcados como no disponibles
                  </p>
                ) : (
                  unavailableDays.map((day) => (
                    <div
                      key={day.id}
                      className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-red-800">
                          {new Date(day.date).toLocaleDateString("es-ES", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        {day.reason && (
                          <div className="text-sm text-red-600">
                            {day.reason}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          availabilityService.removeUnavailableDay(day.id);
                          setNotification({
                            message: "Día removido de la lista",
                            type: "success",
                          });
                          // Emitir evento para actualizar clientes en tiempo real
                          window.dispatchEvent(new Event("availability:changed"));
                          loadData();
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <StatusNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};
