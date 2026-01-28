import React, { useState, useEffect } from "react";
import { X, Save, DollarSign, FileText, Calendar, Tag, CreditCard, TrendingDown } from "lucide-react";

const ExpenseFormModal = ({ isOpen, onClose, onSave, initialData, isViewMode }) => {
  const [formData, setFormData] = useState({
    concepto: "",
    monto: "",
    categoria: "Servicios Básicos",
    fecha: new Date().toISOString().split('T')[0], // Fecha de hoy por defecto
    metodoPago: "Efectivo",
    observaciones: ""
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        concepto: "",
        monto: "",
        categoria: "Servicios Básicos",
        fecha: new Date().toISOString().split('T')[0],
        metodoPago: "Efectivo",
        observaciones: ""
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.concepto || !formData.monto) {
      alert("Concepto y Monto son obligatorios");
      return;
    }
    onSave({ ...formData, monto: Number(formData.monto) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        
        {/* Header Rojo para indicar Gasto */}
        <div className="bg-red-50 px-5 py-3 border-b border-red-100 flex justify-between items-center">
          <h3 className="font-bold text-red-800 text-sm flex items-center gap-2">
            <TrendingDown size={16} className="text-red-600"/> 
            {isViewMode ? "Detalle del Gasto" : (initialData ? "Editar Gasto" : "Registrar Salida de Dinero")}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6 space-y-4">
          
          {/* Concepto y Categoría */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">Concepto / Descripción</label>
                <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input type="text" disabled={isViewMode} className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-red-500 disabled:bg-gray-100" 
                      placeholder="Ej: Pago de Luz Marzo" value={formData.concepto} onChange={(e) => setFormData({...formData, concepto: e.target.value})} />
                </div>
            </div>
            
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Categoría</label>
                <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select disabled={isViewMode} className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-red-500 bg-white disabled:bg-gray-100"
                      value={formData.categoria} onChange={(e) => setFormData({...formData, categoria: e.target.value})}>
                      <option>Servicios Básicos</option>
                      <option>Nómina</option>
                      <option>Mantenimiento</option>
                      <option>Insumos Oficina</option>
                      <option>Impuestos</option>
                      <option>Otros</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha</label>
                <div className="relative">
                    <input type="date" disabled={isViewMode} className="w-full pl-3 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-red-500 disabled:bg-gray-100" 
                      value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} />
                </div>
            </div>
          </div>

          {/* Monto y Método */}
          <div className="bg-red-50/50 p-4 rounded-lg border border-red-100 grid grid-cols-2 gap-4">
             <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Monto ($)</label>
                <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" size={14} />
                    <input type="number" disabled={isViewMode} className="w-full pl-8 pr-3 py-2 text-sm font-bold text-red-800 border border-gray-300 rounded focus:outline-none focus:border-red-500 disabled:bg-gray-100" 
                      placeholder="0.00" value={formData.monto} onChange={(e) => setFormData({...formData, monto: e.target.value})} />
                </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Método de Pago</label>
                <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <select disabled={isViewMode} className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-red-500 bg-white disabled:bg-gray-100"
                      value={formData.metodoPago} onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}>
                      <option>Efectivo</option>
                      <option>Transferencia</option>
                      <option>Tarjeta Corporativa</option>
                      <option>Cheque</option>
                    </select>
                </div>
             </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Observaciones</label>
            <textarea disabled={isViewMode} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-red-500 h-16 resize-none disabled:bg-gray-100" 
              placeholder="Detalles adicionales..." value={formData.observaciones} onChange={(e) => setFormData({...formData, observaciones: e.target.value})} />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">
            {isViewMode ? "Cerrar" : "Cancelar"}
          </button>
          {!isViewMode && (
            <button onClick={handleSubmit} className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md flex items-center gap-1 shadow-sm transition-colors">
              <Save size={16} /> Registrar Gasto
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseFormModal;