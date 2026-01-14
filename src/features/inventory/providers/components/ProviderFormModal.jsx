import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const ProviderFormModal = ({ isOpen, onClose, onSave, itemToEdit }) => {
  const [formData, setFormData] = useState({ nit: '', nombre: '', contacto: '', telefono: '', email: '', estado: true });

  useEffect(() => {
    if (itemToEdit) setFormData(itemToEdit);
    else setFormData({ nit: '', nombre: '', contacto: '', telefono: '', email: '', estado: true });
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); onClose(); };
  const inputClass = "w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary-400 bg-gray-50 focus:bg-white";
  const labelClass = "block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in-up flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <h2 className="text-sm font-bold text-gray-800">{itemToEdit ? 'Editar' : 'Nuevo'} Proveedor</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-red-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto no-scrollbar max-h-[70vh]">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className={labelClass}>NIT *</label>
              <input type="text" value={formData.nit} onChange={(e) => setFormData({...formData, nit: e.target.value})} className={inputClass} required />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Razón Social *</label>
              <input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className={inputClass} required />
            </div>
          </div>
          <div>
            <label className={labelClass}>Persona de Contacto</label>
            <input type="text" value={formData.contacto} onChange={(e) => setFormData({...formData, contacto: e.target.value})} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Teléfono</label>
              <input type="tel" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className={inputClass} />
            </div>
          </div>
          <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
            <span className="text-[10px] font-bold text-gray-600 uppercase">Activo</span>
            <input type="checkbox" checked={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.checked})} className="accent-primary-600 w-4 h-4" />
          </div>
          <div className="pt-2 flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-2 rounded-lg text-xs hover:bg-gray-50">Cancelar</button>
            <button type="submit" className="flex-1 bg-[#34D399] hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};