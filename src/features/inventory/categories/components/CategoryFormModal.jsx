import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const CategoryFormModal = ({ isOpen, onClose, onSave, itemToEdit }) => {
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', estado: true });

  useEffect(() => {
    if (itemToEdit) setFormData(itemToEdit);
    else setFormData({ nombre: '', descripcion: '', estado: true });
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); onClose(); };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm animate-fade-in-up flex flex-col">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <h2 className="text-sm font-bold text-gray-800">{itemToEdit ? 'Editar' : 'Nueva'} Categoría</h2>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-red-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase">Nombre *</label>
            <input type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-3 py-1.5 border rounded-lg text-xs outline-none focus:border-primary-400" required />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase">Descripción</label>
            <textarea rows="3" value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className="w-full px-3 py-1.5 border rounded-lg text-xs outline-none focus:border-primary-400 resize-none" />
          </div>
          <div className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
            <span className="text-[10px] font-bold text-gray-600 uppercase">Activa</span>
            <input type="checkbox" checked={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.checked})} className="accent-primary-600 w-4 h-4" />
          </div>
          <div className="pt-2 flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 font-bold py-2 rounded-lg text-xs">Cancelar</button>
            <button type="submit" className="flex-1 bg-[#34D399] hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-xs">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};