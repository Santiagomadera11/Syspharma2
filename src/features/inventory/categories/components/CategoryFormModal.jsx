import React, { useState, useEffect } from "react";
import { X, Save, Tag, FileText, Activity } from "lucide-react";

const CategoryFormModal = ({ isOpen, onClose, initialData = null, mode = 'create', onSave, onDelete }) => {
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', estado: true });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        estado: typeof initialData.estado === 'boolean' ? initialData.estado : (initialData.estado === 'Activo')
      });
    } else {
      setFormData({ nombre: '', descripcion: '', estado: true });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const handleSubmit = () => {
    if (onSave) {
      onSave({
        ...formData,
        estado: formData.estado // Asegurar que sea booleano
      });
    }
  };

  const handleDelete = () => {
    if (onDelete && formData.id) onDelete(formData);
  };

  const title = mode === 'create' ? 'Nueva Categoría' : (mode === 'edit' ? 'Editar Categoría' : 'Detalle de Categoría');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <Tag size={16} className="text-primary-500"/> {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la Categoría</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                disabled={isView}
                type="text" 
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                placeholder="Ej: Antibióticos" 
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Descripción</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-gray-400" size={16} />
              <textarea 
                disabled={isView}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 h-24 resize-none" 
                placeholder="Descripción breve de la categoría..." 
                value={formData.descripcion}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Estado</label>
            <div className="relative">
              <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select 
                disabled={isView}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 bg-white appearance-none cursor-pointer"
                value={formData.estado ? 'true' : 'false'}
                onChange={(e) => setFormData({...formData, estado: e.target.value === 'true'})}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancelar
          </button>
          {!isView && (
            <button onClick={handleSubmit} className="px-4 py-2 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-md flex items-center gap-1 shadow-sm transition-colors">
              <Save size={16} /> Guardar
            </button>
          )}
          {mode === 'edit' && (
            <button onClick={handleDelete} className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md ml-2">
              Eliminar
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default CategoryFormModal;