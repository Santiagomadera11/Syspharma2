import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const ProductFormModal = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [formData, setFormData] = useState({
    codigo: '', nombre: '', laboratorio: '', categoria: '',
    precio: '', stock: '', vencimiento: '', estado: true
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData(productToEdit);
    } else {
      setFormData({
        codigo: '', nombre: '', laboratorio: '', categoria: '',
        precio: '', stock: '', vencimiento: '', estado: true
      });
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
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
          <h2 className="text-sm font-bold text-gray-800">{productToEdit ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={18} /></button>
        </div>

        {/* Formulario Scroll Invisible */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className={labelClass}>Código *</label>
              <input type="text" name="codigo" value={formData.codigo} onChange={handleChange} className={inputClass} required />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Nombre Producto *</label>
              <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className={inputClass} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Laboratorio</label>
              <input type="text" name="laboratorio" value={formData.laboratorio} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Categoría</label>
              <select name="categoria" value={formData.categoria} onChange={handleChange} className={inputClass} required>
                <option value="">Seleccionar</option>
                <option value="Analgésicos">Analgésicos</option>
                <option value="Antibióticos">Antibióticos</option>
                <option value="Vitaminas">Vitaminas</option>
                <option value="Cuidado Personal">Cuidado Personal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Precio Venta ($)</label>
              <input type="number" name="precio" value={formData.precio} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Stock Inicial</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className={inputClass} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className={labelClass}>Fecha Vencimiento</label>
              <input type="date" name="vencimiento" value={formData.vencimiento} onChange={handleChange} className={inputClass} />
            </div>
            
            {/* Switch Estado */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg h-[34px]">
              <span className="text-[10px] font-bold text-gray-600 uppercase">Disponible</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" name="estado" checked={formData.estado} onChange={handleChange} className="sr-only peer" />
                <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-50 text-xs">Cancelar</button>
          <button onClick={handleSubmit} className="flex-1 bg-[#34D399] hover:bg-emerald-500 text-white font-bold py-2 rounded-lg shadow-sm text-xs">
            {productToEdit ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </div>
      </div>
    </div>
  );
};