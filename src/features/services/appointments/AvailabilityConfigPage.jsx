import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { availabilityService } from "./services/availabilityService";
import { appointmentService } from "./services/appointmentService";
import { StatusNotification } from "/src/shared/ui/StatusNotification";

export const AvailabilityConfigPage = () => {
  const navigate = useNavigate();
  const [availability, setAvailability] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setDoctors(appointmentService.getDoctors());
    setAvailability(availabilityService.getAvailability());
  };

  const handleSave = () => {
    try {
      availabilityService.updateAvailability(availability);
      setNotification({
        message: "Disponibilidad guardada correctamente",
        type: "success",
      });
    } catch {
      setNotification({
        message: "Error al guardar la disponibilidad",
        type: "error",
      });
    }
  };

  if (!selectedDoctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate("/admin/citas")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">
                Configuración de Disponibilidad
              </h1>
            </div>

            <div className="text-center py-12">
              <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Seleccionar Profesional
              </h3>
              <p className="text-gray-500 mb-6">
                Elija un profesional para configurar su disponibilidad
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                {doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctor(doctor.id)}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-emerald-300 hover:shadow-md transition-all text-left"
                  >
                    <div className="font-medium text-gray-900">
                      {doctor.nombre}
                    </div>
                    <div className="text-sm text-gray-500">
                      {doctor.especialidad}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedDoctor("")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Configuración de Disponibilidad
                </h1>
                <p className="text-gray-600">
                  {doctors.find((d) => d.id === selectedDoctor)?.nombre}
                </p>
              </div>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Save size={18} />
              Guardar Cambios
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DAYS_OF_WEEK.map((day) => (
              <div
                key={day.key}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">{day.label}</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={availability[selectedDoctor]?.[day.key]?.enabled || false}
                      onChange={(e) =>
                        setAvailability((prev) => ({
                          ...prev,
                          [selectedDoctor]: {
                            ...prev[selectedDoctor],
                            [day.key]: {
                              ...prev[selectedDoctor]?.[day.key],
                              enabled: e.target.checked,
                            },
                          },
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                {availability[selectedDoctor]?.[day.key]?.enabled && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora Inicio
                      </label>
                      <input
                        type="time"
                        value={availability[selectedDoctor]?.[day.key]?.startTime || ""}
                        onChange={(e) =>
                          setAvailability((prev) => ({
                            ...prev,
                            [selectedDoctor]: {
                              ...prev[selectedDoctor],
                              [day.key]: {
                                ...prev[selectedDoctor]?.[day.key],
                                startTime: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora Fin
                      </label>
                      <input
                        type="time"
                        value={availability[selectedDoctor]?.[day.key]?.endTime || ""}
                        onChange={(e) =>
                          setAvailability((prev) => ({
                            ...prev,
                            [selectedDoctor]: {
                              ...prev[selectedDoctor],
                              [day.key]: {
                                ...prev[selectedDoctor]?.[day.key],
                                endTime: e.target.value,
                              },
                            },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
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

const DAYS_OF_WEEK = [
  { key: "monday", label: "Lunes" },
  { key: "tuesday", label: "Martes" },
  { key: "wednesday", label: "Miércoles" },
  { key: "thursday", label: "Jueves" },
  { key: "friday", label: "Viernes" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];