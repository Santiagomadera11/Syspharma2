import React, { useState } from "react";
import { X, Save, Calendar, Clock, Stethoscope, User } from "lucide-react";

const ClientAppointmentModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    servicio: "",
    profesional: "",
    fecha: "",
    hora: "",
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.servicio || !formData.fecha || !formData.hora) {
      alert("Por favor completa los datos de la cita");
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 px-5 py-4 border-b border-blue-700 flex justify-between items-center">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Calendar size={18}/> Agendar Nueva Cita
          </h3>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">¿Qué servicio necesitas?</label>
            <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select 
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                  value={formData.servicio}
                  onChange={(e) => setFormData({...formData, servicio: e.target.value})}
                >
                  <option value="">Selecciona un servicio...</option>
                  <option>Consulta General</option>
                  <option>Inyectable</option>
                  <option>Toma de Presión</option>
                  <option>Curación</option>
                  <option>Certificado Médico</option>
                </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">Preferencia de Profesional (Opcional)</label>
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select 
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                  value={formData.profesional}
                  onChange={(e) => setFormData({...formData, profesional: e.target.value})}
                >
                  <option value="">Cualquiera disponible</option>
                  <option>Dr. Juan Pérez</option>
                  <option>Enf. María Gómez</option>
                </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Fecha</label>
                <input 
                  type="date" 
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Hora</label>
                <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="time" 
                      className="w-full pl-9 pr-2 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                      value={formData.hora}
                      onChange={(e) => setFormData({...formData, hora: e.target.value})}
                    />
                </div>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 border border-blue-100">
            <p>ℹ️ La cita quedará en estado <strong>Pendiente</strong> hasta que sea confirmada por nuestro personal.</p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 shadow-md transition-transform hover:scale-105"
          >
            <Save size={16} /> Confirmar Cita
          </button>
        </div>

      </div>
    </div>
  );
};

export default ClientAppointmentModal;