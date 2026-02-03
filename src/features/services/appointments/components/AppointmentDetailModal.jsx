import React from "react";
import {
  X,
  User,
  Phone,
  Calendar,
  Clock,
  FileText,
  Stethoscope,
  CheckCircle,
  Clock as ClockIcon,
  XCircle,
} from "lucide-react";

const AppointmentDetailModal = ({ isOpen, onClose, appointment, doctors }) => {
  if (!isOpen || !appointment) return null;

  const doctor = doctors.find((d) => d.id === appointment.doctorId);

  const getStatusColor = (estado) => {
    switch (estado) {
      case "Confirmada":
        return "bg-green-100 text-green-700";
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

  const getStatusIcon = (estado) => {
    switch (estado) {
      case "Confirmada":
        return <CheckCircle size={16} />;
      case "En Consulta":
        return <ClockIcon size={16} />;
      case "Completada":
        return <CheckCircle size={16} />;
      case "No Asistió":
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Detalle de Cita</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Estado de la cita */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Estado:</span>
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.estado)}`}
            >
              {getStatusIcon(appointment.estado)}
              {appointment.estado}
            </span>
          </div>

          {/* Información del Paciente */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User size={20} />
              Información del Paciente
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Nombre:
                </span>
                <p className="text-gray-900">{appointment.paciente}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Documento:
                </span>
                <p className="text-gray-900">{appointment.documento}</p>
              </div>
              {appointment.telefono && (
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Teléfono:
                  </span>
                  <p className="text-gray-900 flex items-center gap-2">
                    <Phone size={14} />
                    {appointment.telefono}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información de la Cita */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Stethoscope size={20} />
              Información de la Cita
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Profesional:
                </span>
                <p className="text-gray-900">
                  {doctor?.nombre} - {doctor?.especialidad}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Fecha:
                </span>
                <p className="text-gray-900 flex items-center gap-2">
                  <Calendar size={14} />
                  {new Date(appointment.fecha).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Hora:</span>
                <p className="text-gray-900 flex items-center gap-2">
                  <Clock size={14} />
                  {appointment.hora}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Servicio:
                </span>
                <p className="text-gray-900">{appointment.servicio}</p>
              </div>
            </div>
          </div>

          {/* Notas */}
          {appointment.notas && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FileText size={20} />
                Notas
              </h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {appointment.notas}
              </p>
            </div>
          )}

          {/* Fecha de creación */}
          {appointment.fechaCreacion && (
            <div className="border-t pt-4">
              <div className="text-xs text-gray-500">
                Cita creada el:{" "}
                {new Date(appointment.fechaCreacion).toLocaleString("es-ES")}
              </div>
            </div>
          )}
        </div>

        {/* Botón cerrar */}
        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailModal;
