import React, { useState, useEffect } from "react";
import { X, Save, Calendar, Clock, User, FileText, Eye, CheckCircle } from "lucide-react";

const AppointmentFormModal = ({ isOpen, onClose, onSave, initialData, isViewMode }) => {
  const [formData, setFormData] = useState({
    paciente: "",
    servicio: "",
    profesional: "",
    fecha: "",
    hora: "",
    estado: "Pendiente",
    notas: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        paciente: "",
        servicio: "",
        profesional: "",
        fecha: "",
        hora: "",
        estado: "Pendiente",
        notas: ""
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.paciente || !formData.fecha || !formData.hora) {
      alert("Por favor completa los campos obligatorios (Paciente, Fecha, Hora)");
      return;
    }
    onSave(formData);
    onClose();
  };

  const getTitle = () => {
    if (isViewMode) return "Detalles de la Cita";
    return initialData ? "Reprogramar / Editar Cita" : "Agendar Nueva Cita";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <Calendar size={16} className="text-emerald-600"/> {getTitle()}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Paciente y Servicio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Paciente</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text" 
                      disabled={isViewMode}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 disabled:bg-gray-100" 
                      placeholder="Nombre completo"
                      value={formData.paciente}
                      onChange={(e) => setFormData({...formData, paciente: e.target.value})}
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Servicio</label>
                <select 
                  disabled={isViewMode}
                  className="w-full pl-2 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 bg-white disabled:bg-gray-100"
                  value={formData.servicio}
                  onChange={(e) => setFormData({...formData, servicio: e.target.value})}
                >
                  <option value="">Seleccionar...</option>
                  <option>Consulta General</option>
                  <option>Inyectable</option>
                  <option>Toma de Presión</option>
                  <option>Curación</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Profesional</label>
                <select 
                  disabled={isViewMode}
                  className="w-full pl-2 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 bg-white disabled:bg-gray-100"
                  value={formData.profesional}
                  onChange={(e) => setFormData({...formData, profesional: e.target.value})}
                >
                  <option value="">Cualquiera</option>
                  <option>Dr. Juan Pérez</option>
                  <option>Enf. María Gómez</option>
                </select>
            </div>
          </div>

          {/* Fecha, Hora y Estado */}
          <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-md border border-gray-100">
            <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Fecha</label>
                <input 
                  type="date" 
                  disabled={isViewMode}
                  className="w-full pl-2 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 disabled:bg-gray-100" 
                  value={formData.fecha}
                  onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Hora</label>
                <div className="relative">
                    <Clock className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="time" 
                      disabled={isViewMode}
                      className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 disabled:bg-gray-100" 
                      value={formData.hora}
                      onChange={(e) => setFormData({...formData, hora: e.target.value})}
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Estado</label>
                <select 
                  disabled={isViewMode}
                  className="w-full pl-1 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 bg-white disabled:bg-gray-100"
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value})}
                >
                  <option>Pendiente</option>
                  <option>Confirmada</option>
                  <option>Completada</option>
                  <option>Cancelada</option>
                </select>
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Notas Adicionales</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={16} />
              <textarea 
                disabled={isViewMode}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 h-20 resize-none disabled:bg-gray-100" 
                placeholder="Motivo de la consulta, síntomas, etc..."
                value={formData.notas}
                onChange={(e) => setFormData({...formData, notas: e.target.value})}
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
          >
            {isViewMode ? "Cerrar" : "Cancelar"}
          </button>
          
          {!isViewMode && (
            <button 
              onClick={handleSubmit}
              className="px-4 py-2 text-xs font-bold text-white bg-[#34D399] hover:bg-emerald-500 rounded-md flex items-center gap-1 shadow-sm transition-colors"
            >
              <Save size={16} /> Agendar
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default AppointmentFormModal;