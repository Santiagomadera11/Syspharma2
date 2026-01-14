import React, { useState } from 'react';
import { X } from 'lucide-react';

export const PurchaseFormModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    factura: '', proveedor: '', fecha: '', total: '', estado: 'Pendiente', items: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  // Estilos compactos
  const inputClass = "w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all bg-gray-50 focus:bg-white";
  const labelClass = "block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] animate-fade-in-up">
        
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <h2 className="text-sm font-bold text-gray-800">Registrar Compra</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={18} /></button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>N° Factura *</label>
              <input type="text" name="factura" onChange={handleChange} className={inputClass} placeholder="F-0000" required />
            </div>
            <div>
              <label className={labelClass}>Fecha Compra *</label>
              <input type="date" name="fecha" onChange={handleChange} className={inputClass} required />
            </div>
          </div>

          <div>
            <label className={labelClass}>Proveedor *</label>
            <select name="proveedor" onChange={handleChange} className={inputClass} required>
              <option value="">Seleccionar Proveedor</option>
              <option value="Droguería Alemana">Droguería Alemana</option>
              <option value="Coopidrogas">Coopidrogas</option>
              <option value="Laboratorios Genfar">Laboratorios Genfar</option>
              <option value="Tecnoquímicas">Tecnoquímicas</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Total ($) *</label>
              <input type="number" name="total" onChange={handleChange} className={inputClass} placeholder="0" required />
            </div>
            <div>
              <label className={labelClass}>Cantidad Items</label>
              <input type="number" name="items" onChange={handleChange} className={inputClass} placeholder="0" />
            </div>
          </div>

          <div>
            <label className={labelClass}>Estado</label>
            <select name="estado" onChange={handleChange} className={inputClass}>
              <option value="Pendiente">Pendiente</option>
              <option value="Recibido">Recibido (Inventario Cargado)</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

        </form>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-50 text-xs">Cancelar</button>
          <button onClick={handleSubmit} className="flex-1 bg-[#34D399] hover:bg-emerald-500 text-white font-bold py-2 rounded-lg shadow-sm text-xs">Guardar Compra</button>
        </div>
      </div>
    </div>
  );
};