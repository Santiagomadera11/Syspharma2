import React, { useState, useEffect } from "react";
import { X, Save, Calendar, Clock, User, FileText, DollarSign, CreditCard, Stethoscope } from "lucide-react";

// Simulación de Precios de Servicios (Esto vendría de tu base de datos de Servicios)
const SERVICE_PRICES = {
  "Consulta General": 25000,
  "Inyectable": 2500,
  "Toma de Presión": 1000,
  "Curación": 8000,
  "Certificado Médico": 15000
};

const AppointmentFormModal = ({ isOpen, onClose, onSave, initialData, isViewMode }) => {
  const [formData, setFormData] = useState({
    paciente: "",
    servicio: "",
    profesional: "",
    fecha: "",
    hora: "",
    estadoCita: "Pendiente", // Programada, Confirmada, Cancelada
    precio: "",
    estadoPago: "Pendiente", // Pendiente, Pagado
    metodoPago: "Efectivo",
    notas: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        paciente: "", servicio: "", profesional: "", fecha: "", hora: "",
        estadoCita: "Pendiente", precio: "", estadoPago: "Pendiente", metodoPago: "Efectivo", notas: ""
      });
    }
  }, [initialData, isOpen]);

  // Lógica: Al cambiar servicio, actualizar precio sugerido
  const handleServiceChange = (e) => {
    const serviceName = e.target.value;
    const suggestedPrice = SERVICE_PRICES[serviceName] || "";
    setFormData({
      ...formData,
      servicio: serviceName,
      precio: suggestedPrice // El admin puede editarlo luego si quiere
    });
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.paciente || !formData.servicio || !formData.precio) {
      alert("Campos obligatorios: Paciente, Servicio y Precio");
      return;
    }
    onSave({ ...formData, precio: Number(formData.precio) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <Calendar size={16} className="text-emerald-600"/> 
            {isViewMode ? "Detalle de la Transacción" : (initialData ? "Editar Cita / Venta" : "Nueva Cita")}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* SECCIÓN 1: DATOS MÉDICOS */}
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 border-b pb-1">Información de la Cita</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Paciente</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input type="text" disabled={isViewMode} className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 disabled:bg-gray-100" 
                      placeholder="Nombre del paciente" value={formData.paciente} onChange={(e) => setFormData({...formData, paciente: e.target.value})} />
                </div>
            </div>
            <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Profesional</label>
                <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select disabled={isViewMode} className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 bg-white disabled:bg-gray-100"
                      value={formData.profesional} onChange={(e) => setFormData({...formData, profesional: e.target.value})}>
                      <option value="">Asignar Médico...</option>
                      <option>Dr. Juan Pérez</option>
                      <option>Enf. María Gómez</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha</label>
                <input type="date" disabled={isViewMode} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 disabled:bg-gray-100" 
                  value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Hora</label>
                    <input type="time" disabled={isViewMode} className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 disabled:bg-gray-100" 
                      value={formData.hora} onChange={(e) => setFormData({...formData, hora: e.target.value})} />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Estado Cita</label>
                    <select disabled={isViewMode} className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 bg-white disabled:bg-gray-100"
                      value={formData.estadoCita} onChange={(e) => setFormData({...formData, estadoCita: e.target.value})}>
                      <option>Pendiente</option><option>Confirmada</option><option>Atendida</option><option>Cancelada</option>
                    </select>
                </div>
            </div>
          </div>

          {/* SECCIÓN 2: DATOS FINANCIEROS (LA VENTA) */}
          <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 border-b pb-1 mt-6">Información Financiera</h4>
          <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100 grid grid-cols-2 gap-4">
             <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-bold text-gray-700 mb-1">Servicio (Producto)</label>
                <select disabled={isViewMode} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 bg-white disabled:bg-gray-100"
                  value={formData.servicio} onChange={handleServiceChange}>
                  <option value="">Seleccionar Servicio...</option>
                  {Object.keys(SERVICE_PRICES).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
             </div>
             
             <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Precio ($)</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                    <input type="number" disabled={isViewMode} className="w-full pl-8 pr-3 py-2 text-sm font-bold text-gray-800 border border-gray-300 rounded focus:outline-none focus:border-emerald-500 disabled:bg-gray-100" 
                      placeholder="0.00" value={formData.precio} onChange={(e) => setFormData({...formData, precio: e.target.value})} />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Estado de Pago</label>
                <select disabled={isViewMode} className={`w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 disabled:bg-gray-100 font-medium ${formData.estadoPago === 'Pagado' ? 'text-green-700 bg-green-50' : 'text-orange-700 bg-orange-50'}`}
                  value={formData.estadoPago} onChange={(e) => setFormData({...formData, estadoPago: e.target.value})}>
                  <option value="Pendiente">Pendiente de Cobro</option>
                  <option value="Pagado">Pagado</option>
                </select>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Método de Pago</label>
                <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select disabled={isViewMode} className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 bg-white disabled:bg-gray-100"
                      value={formData.metodoPago} onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}>
                      <option>Efectivo</option><option>Tarjeta</option><option>Transferencia</option><option>Seguro</option>
                    </select>
                </div>
             </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-gray-700 mb-1">Observaciones</label>
            <textarea disabled={isViewMode} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-emerald-500 h-16 resize-none disabled:bg-gray-100" 
              placeholder="Notas internas..." value={formData.notas} onChange={(e) => setFormData({...formData, notas: e.target.value})} />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">
            {isViewMode ? "Cerrar" : "Cancelar"}
          </button>
          {!isViewMode && (
            <button onClick={handleSubmit} className="px-4 py-2 text-xs font-bold text-white bg-[#34D399] hover:bg-emerald-500 rounded-md flex items-center gap-1 shadow-sm transition-colors">
              <Save size={16} /> Guardar Transacción
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentFormModal;