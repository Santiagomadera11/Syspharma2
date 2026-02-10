import React, { useState } from "react";
import { 
  Plus, Search, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, Filter, ShoppingBag
} from "lucide-react";

// ✅ IMPORTACIÓN CORRECTA DEL COMPONENTE
import PurchaseModal from "./components/PurchaseFormModal";

export const PurchasesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- CONFIGURACIÓN COMPACTA ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  const [compras] = useState([
    { id: "CMP-101", proveedor: "Farmacéutica Global", fecha: "2024-01-15", total: 450000, items: 12, estado: "Recibido" },
    { id: "CMP-102", proveedor: "Distribuidora MedRx", fecha: "2024-01-18", total: 125500, items: 5, estado: "Pendiente" },
    { id: "CMP-103", proveedor: "Laboratorios Pfizer", fecha: "2024-01-20", total: 890000, items: 24, estado: "En Camino" },
    { id: "CMP-104", proveedor: "Insumos Médicos CR", fecha: "2024-01-21", total: 35000, items: 2, estado: "Cancelado" },
    { id: "CMP-105", proveedor: "Bayer S.A.", fecha: "2024-01-22", total: 210000, items: 8, estado: "Pendiente" },
    { id: "CMP-106", proveedor: "Genéricos del Valle", fecha: "2024-01-23", total: 15000, items: 1, estado: "Recibido" },
    { id: "CMP-107", proveedor: "Droguería Central", fecha: "2024-01-24", total: 67000, items: 3, estado: "Recibido" },
    { id: "CMP-108", proveedor: "Meditech Devices", fecha: "2024-01-25", total: 540000, items: 10, estado: "En Camino" },
  ]);

  const filtered = compras.filter(c => {
    const texto = searchTerm.toLowerCase();
    const matchText = c.proveedor.toLowerCase().includes(texto) || c.id.toLowerCase().includes(texto);
    const matchStatus = statusFilter === "Todos" || c.estado === statusFilter;
    return matchText && matchStatus;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  const getStatusBadge = (estado) => {
    const baseClass = "px-2 py-0.5 rounded text-[10px] font-bold border";
    switch (estado) {
      case "Recibido": return <span className={`${baseClass} bg-green-50 text-green-700 border-green-200`}>Recibido</span>;
      case "Pendiente": return <span className={`${baseClass} bg-blue-50 text-blue-700 border-blue-200`}>Pendiente</span>;
      case "En Camino": return <span className={`${baseClass} bg-yellow-50 text-yellow-700 border-yellow-200`}>En Camino</span>;
      case "Cancelado": return <span className={`${baseClass} bg-red-50 text-red-700 border-red-200`}>Cancelado</span>;
      default: return <span className={`${baseClass} bg-gray-50 text-gray-700 border-gray-200`}>{estado}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col p-6 font-sans text-gray-800 bg-white md:bg-transparent relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Compras</h1>
          <p className="text-xs text-gray-500">Gestión de adquisiciones</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#34D399] hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} /> Nueva
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 mb-3 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar compra..." 
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:border-emerald-400 text-sm bg-white"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="relative w-36">
           <select 
             className="w-full pl-3 pr-8 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:border-emerald-400 text-sm bg-white appearance-none cursor-pointer"
             value={statusFilter}
             onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
           >
             <option value="Todos">Todos</option>
             <option value="Recibido">Recibido</option>
             <option value="Pendiente">Pendiente</option>
             <option value="En Camino">En Camino</option>
             <option value="Cancelado">Cancelado</option>
           </select>
           <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* TABLA SIN SCROLL */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-600 text-white sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider">ID</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider">Proveedor</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider">Fecha</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-right">Total</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-center">Items</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-center">Estado</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length > 0 ? (
                currentItems.map((compra) => (
                  <tr key={compra.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-1.5 px-3 text-xs font-medium text-gray-900">{compra.id}</td>
                    
                    <td className="py-1.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                           <ShoppingBag size={12} />
                        </div>
                        <span className="text-xs font-bold text-gray-700 truncate max-w-[150px]">{compra.proveedor}</span>
                      </div>
                    </td>

                    <td className="py-1.5 px-3 text-xs text-gray-500">{compra.fecha}</td>
                    <td className="py-1.5 px-3 text-xs font-bold text-emerald-600 text-right">₡ {compra.total.toLocaleString()}</td>
                    <td className="py-1.5 px-3 text-xs text-center text-gray-600 font-medium bg-gray-50 mx-auto rounded">{compra.items}</td>
                    <td className="py-1.5 px-3 text-center">{getStatusBadge(compra.estado)}</td>
                    <td className="py-1.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1 rounded border border-emerald-200 text-emerald-600 hover:bg-emerald-50" title="Ver"><Eye size={14} /></button>
                        <button className="p-1 rounded border border-green-200 text-green-600 hover:bg-green-50" title="Editar"><Edit size={14} /></button>
                        <button className="p-1 rounded border border-red-200 text-red-600 hover:bg-red-50" title="Eliminar"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400 text-xs">
                    No se encontraron compras.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] text-gray-500">Pág {currentPage} de {totalPages || 1}</span>
            <div className="flex gap-1">
                <button onClick={prevPage} disabled={currentPage===1} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={14}/></button>
                <button onClick={nextPage} disabled={currentPage===totalPages || totalPages===0} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={14}/></button>
            </div>
        </div>
      </div>

      {/* ✅ RENDERIZADO DEL MODAL */}
      <PurchaseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
};

export default PurchasesPage;