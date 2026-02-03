import React, { useState, useEffect } from "react";
import { X, Save, Calendar, Clock, User, FileText, Phone } from "lucide-react";
import { appointmentService } from "../services/appointmentService";

const AppointmentFormModal = ({
  isOpen,
  onClose,
  onSave,
  appointment,
  doctors,
  availabilityService,
}) => {
  const [formData, setFormData] = useState({
    paciente: "",
    documento: "",
    telefono: "",
    doctorId: "",
    fecha: "",
    hora: "",
    servicio: "",
    notas: "",
  });

  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    if (appointment) {
      setFormData({
        paciente: appointment.paciente || "",
        documento: appointment.documento || "",
        telefono: appointment.telefono || "",
        doctorId: appointment.doctorId || "",
        fecha: appointment.fecha || "",
        hora: appointment.hora || "",
        servicio: appointment.servicio || "",
        notas: appointment.notas || "",
      });
    } else {
      setFormData({
        paciente: "",
        documento: "",
        telefono: "",
        doctorId: "",
        fecha: "",
        hora: "",
        servicio: "",
        notas: "",
      });
    }
  }, [appointment, isOpen, doctors]);

  // Cuando cambia el médico o la fecha, actualizar slots disponibles
  useEffect(() => {
    if (formData.doctorId && formData.fecha) {
      const slots = availabilityService.getAvailableSlotsForDate(
        formData.doctorId,
        formData.fecha,
      );
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
  }, [formData.doctorId, formData.fecha, availabilityService]);

  const handleDoctorChange = (e) => {
    const doctorId = parseInt(e.target.value);
    const doctor = doctors.find((d) => d.id === doctorId);
    setFormData({
      ...formData,
      doctorId: doctorId,
      servicio: doctor ? `Consulta con ${doctor.especialidad}` : "",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.paciente ||
      !formData.doctorId ||
      !formData.fecha ||
      !formData.hora
    ) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    const appointmentData = {
      ...formData,
      doctorId: parseInt(formData.doctorId),
    };

    if (appointment) {
      // Actualizar cita existente
      appointmentService.updateAppointment(appointment.id, appointmentData);
    } else {
      // Crear nueva cita
      appointmentService.createAppointment(appointmentData);
    }

    onSave();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {appointment ? "Editar Cita" : "Nueva Cita"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del Paciente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Paciente *
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
                  placeholder="Nombre completo"
                  value={formData.paciente}
                  onChange={(e) =>
                    setFormData({ ...formData, paciente: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documento *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
                placeholder="Número de documento"
                value={formData.documento}
                onChange={(e) =>
                  setFormData({ ...formData, documento: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <div className="relative">
              <Phone
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="tel"
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
                placeholder="Número de teléfono"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
              />
            </div>
          </div>

          {/* Profesional Médico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profesional Médico *
            </label>
            <select
              required
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
              value={formData.doctorId}
              onChange={handleDoctorChange}
            >
              <option value="">Seleccionar profesional</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.nombre} - {doctor.especialidad}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="date"
                  required
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
                  value={formData.fecha}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora *
              </label>
              <select
                required
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
                value={formData.hora}
                onChange={(e) =>
                  setFormData({ ...formData, hora: e.target.value })
                }
                disabled={!formData.doctorId || !formData.fecha}
              >
                <option value="">
                  {!formData.doctorId || !formData.fecha
                    ? "Seleccione médico y fecha primero"
                    : "Seleccionar hora disponible"}
                </option>
                {availableSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Servicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servicio *
            </label>
            <div className="relative">
              <FileText
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                required
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
                placeholder="Tipo de consulta o servicio"
                value={formData.servicio}
                onChange={(e) =>
                  setFormData({ ...formData, servicio: e.target.value })
                }
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 text-sm"
              rows={2}
              placeholder="Observaciones adicionales..."
              value={formData.notas}
              onChange={(e) =>
                setFormData({ ...formData, notas: e.target.value })
              }
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Save size={16} className="inline mr-2" />
              {appointment ? "Actualizar Cita" : "Crear Cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentFormModal;
