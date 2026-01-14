import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Trash2, ChevronLeft, ChevronRight, FileText, Filter } from 'lucide-react';
import { purchaseService } from './services/purchaseService';
import { PurchaseFormModal } from './components/PurchaseFormModal';
import { ToastNotification } from '../../../shared/ui/ToastNotification';

export const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 7;

  useEffect(() => {
    setPurchases(purchaseService.getAll());
  }, []);

  const showToast = (msg) => setNotification(msg);

  const handleSave = (data) => {
    const newList = purchaseService.create(data);
    setPurchases(newList);
    setIsFormOpen(false);
    showToast("Compra registrada correctamente");
  };

  const handleDelete = (id) => {
    if(window.confirm("¿Eliminar registro de compra?")) {
      const newList = purchaseService.delete(id);
      setPurchases(newList);
      showToast("Registro eliminado");
    }
  };

  // Filtros
  const filteredData = purchases.filter(p => 
    p.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.factura.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayedData = filteredData.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  const formatCurrency = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="h-full flex flex-col gap-3 font-sans relative">
      
      {notification && <ToastNotification message={notification} onClose={() => setNotification(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Compras</h1>
          <p className="text-gray-500 text-xs">Registro de ingresos y facturas</p>
        </div>
        <button onClick={() => setIsFormOpen(true)} className="bg-[#34D399] hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-bold shadow-sm text-xs flex items-center gap-1.5 transition-all">
          <Plus size={16} /> Nueva Compra
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por proveedor o número de factura..." 
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-300 text-xs bg-gray-50 focus:bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
        <div className="overflow-auto custom-scrollbar no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#5D9C96] text-white text-xs uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-semibold">Factura</th>
                <th className="px-4 py-3 font-semibold">Proveedor</th>
                <th className="px-4 py-3 font-semibold">Fecha</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold text-center">Items</th>
                <th className="px-4 py-3 font-semibold text-center">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {displayedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-gray-600 font-bold">{item.factura}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-700">{item.proveedor}</td>
                  <td className="px-4 py-2.5 text-gray-500">{item.fecha}</td>
                  <td className="px-4 py-2.5 font-bold text-gray-800">{formatCurrency(item.total)}</td>
                  <td className="px-4 py-2.5 text-center text-gray-500">{item.items}</td>
                  
                  {/* Estado Badge */}
                  <td className="px-4 py-2.5 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      item.estado === 'Recibido' ? 'bg-green-50 text-green-600 border-green-200' : 
                      item.estado === 'Pendiente' ? 'bg-orange-50 text-orange-600 border-orange-200' : 
                      'bg-red-50 text-red-600 border-red-200'
                    }`}>
                      {item.estado}
                    </span>
                  </td>

                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded-md border border-blue-200"><Eye size={14} /></button>
                      <button onClick={() => handleDelete(item.id)} className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-md border border-red-200"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredData.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400">
              <FileText size={40} className="mb-2 opacity-20" />
              <p className="text-sm">No se encontraron registros de compra</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {filteredData.length > 0 && (
          <div className="border-t border-gray-100 p-2.5 bg-gray-50 flex items-center justify-between flex-shrink-0">
             <span className="text-[10px] text-gray-500 font-medium">Página {currentPage + 1} de {totalPages}</span>
             <div className="flex gap-2">
                <button onClick={() => currentPage > 0 && setCurrentPage(p => p - 1)} disabled={currentPage === 0} className="p-1 rounded bg-white border border-gray-200"><ChevronLeft size={14}/></button>
                <button onClick={() => currentPage < totalPages - 1 && setCurrentPage(p => p + 1)} disabled={currentPage === totalPages - 1} className="p-1 rounded bg-white border border-gray-200"><ChevronRight size={14}/></button>
             </div>
          </div>
        )}
      </div>

      <PurchaseFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSave} />
    </div>
  );
};