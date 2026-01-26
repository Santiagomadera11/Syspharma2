import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const ProductModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    proveedor: "",
    precio: "",
    stock: "",
    estado: "Activo"
  });

  useEffect(() => {
    if (initialData) setFormData(initialData);
    else setFormData({ nombre: "", categoria: "", proveedor: "", precio: "", stock: "", estado: "Activo" });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if(!formData.nombre) return alert("Nombre requerido");
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-sm">{initialData ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500"><X size={18} /></button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
            <input type="text" className="w-full text-sm border border-gray-300 rounded px-3 py-2" 
              value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Categoría</label>
            <select className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                <option value="">Seleccionar...</option>
                <option value="Antibióticos">Antibióticos</option>
                <option value="Analgésicos">Analgésicos</option>
            </select>
          </div>
          <div>
             <label className="block text-xs font-bold text-gray-700 mb-1">Proveedor</label>
             <select className="w-full text-sm border border-gray-300 rounded px-3 py-2"
               value={formData.proveedor} onChange={e => setFormData({...formData, proveedor: e.target.value})}>
                <option value="">Seleccionar...</option>
                <option value="Farmacéutica Global">Farmacéutica Global</option>
             </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Precio (₡)</label>
            <input type="number" className="w-full text-sm border border-gray-300 rounded px-3 py-2" 
              value={formData.precio} onChange={e => setFormData({...formData, precio: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Stock</label>
            <input type="number" className="w-full text-sm border border-gray-300 rounded px-3 py-2" 
              value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded">Cancelar</button>
          <button onClick={handleSubmit} className="px-3 py-1.5 text-xs font-bold text-white bg-[#34D399] hover:bg-emerald-500 rounded flex items-center gap-1"><Save size={14} /> Guardar</button>
        </div>
      </div>
    </div>
  );
};
export default ProductModal;