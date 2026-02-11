import React, { useState, useEffect } from "react";
import { X, Save, ShoppingCart, Plus, Trash2 } from "lucide-react";

const PurchaseModal = ({ isOpen, onClose, initialData = null, mode = 'create', onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    proveedor: "",
    fecha: new Date().toISOString().slice(0,10),
    factura: "",
    total: 25000,
    items: 1,
    estado: "Pendiente",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        proveedor: initialData.proveedor || "",
        fecha: initialData.fecha || new Date().toISOString().slice(0,10),
        factura: initialData.factura || "",
        total: initialData.total || 0,
        items: initialData.items || 0,
        estado: initialData.estado || "Pendiente",
        id: initialData.id,
      });
    } else {
      setFormData({
        proveedor: "",
        fecha: new Date().toISOString().slice(0,10),
        factura: "",
        total: 0,
        items: 0,
        estado: "Pendiente",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const handleSubmit = () => {
    const payload = {
      id: formData.id,
      proveedor: formData.proveedor,
      fecha: formData.fecha,
      total: Number(formData.total) || 0,
      items: Number(formData.items) || 0,
      estado: formData.estado || 'Pendiente',
      factura: formData.factura || ''
    };
    if (onSave) onSave(payload);
  };

  const handleDelete = () => {
    if (onDelete && formData.id) onDelete({ id: formData.id });
  };

  const title = isView ? 'Ver Compra' : (mode === 'edit' ? 'Editar Compra' : 'Registrar Compra');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* max-h-[90vh] permite que el modal tenga su propio scroll si es necesario, sin afectar la página de atrás */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <ShoppingCart size={16} className="text-primary-500"/> {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body (Scrollable internamente) */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* 1. Datos Generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Proveedor</label>
              <select 
                disabled={isView}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500 bg-white"
                value={formData.proveedor}
                onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                <option>Farmacéutica Global</option>
                <option>Laboratorios Pfizer</option>
                <option>Droguería Central</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de Compra</label>
              <input 
                disabled={isView}
                type="date" 
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">N° Factura</label>
              <input 
                disabled={isView}
                type="text" 
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500" 
                placeholder="FAC-0000"
                value={formData.factura}
                onChange={(e) => setFormData({...formData, factura: e.target.value})}
              />
            </div>
          </div>

          {/* 2. Barra para Agregar Productos */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
             <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 border-b border-gray-200 pb-1">Agregar Items</h4>
             <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                   <label className="block text-[10px] font-bold text-gray-600 mb-1">Producto</label>
                   <select className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:border-emerald-500 bg-white">
                     <option>Buscar producto...</option>
                     <option>Amoxicilina 500mg</option>
                   </select>
                </div>
                <div className="w-full md:w-32">
                   <label className="block text-[10px] font-bold text-gray-600 mb-1">Costo Unit.</label>
                   <input type="number" className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:border-emerald-500" placeholder="0.00" />
                </div>
                <div className="w-full md:w-24">
                   <label className="block text-[10px] font-bold text-gray-600 mb-1">Cantidad</label>
                   <input type="number" className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:border-emerald-500" placeholder="1" />
                </div>
                 <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-1.5 rounded-md text-sm font-medium h-[34px] flex items-center justify-center gap-1 shadow-sm transition-colors w-full md:w-auto">
                   <Plus size={14}/> Agregar
                 </button>
             </div>
          </div>

          {/* 3. Tabla de Productos Agregados */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold">
                  <tr>
                     <th className="px-4 py-2">Producto</th>
                     <th className="px-4 py-2 text-center">Cant</th>
                     <th className="px-4 py-2 text-right">Costo</th>
                     <th className="px-4 py-2 text-right">Subtotal</th>
                     <th className="px-4 py-2 text-center"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {/* Ejemplo de item agregado */}
                  <tr>
                       <td className="px-4 py-2 text-xs font-medium text-gray-700">Amoxicilina 500mg</td>
                       <td className="px-4 py-2 text-center text-xs text-gray-600">{formData.items || 1}</td>
                       <td className="px-4 py-2 text-right text-xs text-gray-600">{(formData.total && formData.items) ? Math.round(formData.total / formData.items).toLocaleString() : '0'}</td>
                       <td className="px-4 py-2 text-right text-xs font-bold text-gray-800">{(formData.total).toLocaleString()}</td>
                       <td className="px-4 py-2 text-center">
                         <button className="text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                       </td>
                    </tr>
                  {/* Fila vacía para relleno visual */}
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-xs text-gray-400 italic bg-gray-50/30">
                      No hay más productos en la lista
                    </td>
                  </tr>
               </tbody>
               <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total a Pagar:</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-primary-500">$ { (formData.total || 0).toLocaleString() }</td>
                    <td></td>
                  </tr>
               </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end gap-2 flex-shrink-0">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancelar
          </button>
           {!isView && (
            <button onClick={handleSubmit} className="px-4 py-2 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-md flex items-center gap-1 shadow-sm transition-colors">
              <Save size={16} /> {mode === 'edit' ? 'Guardar' : 'Finalizar Compra'}
            </button>
           )}
        </div>

      </div>
    </div>
  );
};

export default PurchaseModal;