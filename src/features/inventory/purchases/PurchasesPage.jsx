import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, Filter, ShoppingBag, Settings,
  CheckCircle, AlertCircle, X, Printer
} from "lucide-react";

// ✅ IMPORTACIÓN CORRECTA DEL COMPONENTE
import PurchaseModal from "./components/PurchaseFormModal";
import { purchaseService } from "./services/purchaseService";

export const PurchasesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- CONFIGURACIÓN COMPACTA ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  const [compras, setCompras] = useState([]);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'view' | 'edit'
  const [dateFilter, setDateFilter] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [purchaseToChangeStatus, setPurchaseToChangeStatus] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Cargar compras desde el servicio
  useEffect(() => {
    const loadPurchases = () => {
      const data = purchaseService.getAll();
      setCompras(data);
    };

    loadPurchases();

    // Escuchar cambios en compras
    const handlePurchaseChange = () => {
      loadPurchases();
    };
    window.addEventListener("purchases:changed", handlePurchaseChange);

    return () => {
      window.removeEventListener("purchases:changed", handlePurchaseChange);
    };
  }, []);

  // Auto-descartar notificación
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filtered = compras.filter(c => {
    const texto = searchTerm.toLowerCase();
    const matchText = c.proveedor.toLowerCase().includes(texto) || String(c.id).toLowerCase().includes(texto);
    const matchStatus = statusFilter === "Todos" || c.estado === statusFilter;
    const matchDate = !dateFilter || c.fecha === dateFilter;
    return matchText && matchStatus && matchDate;
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

  const handleView = (compra) => {
    // Si la compra tiene un campo 'items' que es un número, buscar la compra completa en el storage
    let compraCompleta = compra;
    if (!Array.isArray(compra.items)) {
      const comprasAll = purchaseService.getAll();
      const encontrada = comprasAll.find(c => c.id === compra.id);
      if (encontrada && Array.isArray(encontrada.items)) {
        compraCompleta = encontrada;
      }
    }
    setSelectedPurchase(compraCompleta);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleEdit = (compra) => {
    // Si la compra tiene un campo 'items' que es un número, buscar la compra completa en el storage
    let compraCompleta = compra;
    if (!Array.isArray(compra.items)) {
      const comprasAll = purchaseService.getAll();
      const encontrada = comprasAll.find(c => c.id === compra.id);
      if (encontrada && Array.isArray(encontrada.items)) {
        compraCompleta = encontrada;
      }
    }
    setSelectedPurchase(compraCompleta);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleDelete = (compra) => {
    setShowDeleteConfirm(compra);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      purchaseService.delete(showDeleteConfirm.id);
      setCompras(purchaseService.getAll());
      setNotification({
        message: `Compra ${showDeleteConfirm.id} eliminada correctamente`,
        type: "success",
      });
      setShowDeleteConfirm(null);
    }
  };

  const handleSave = (data) => {
    if (modalMode === "edit") {
      purchaseService.update(data);
      setNotification({
        message: `Compra ${data.id} actualizada correctamente`,
        type: "success",
      });
    } else { 
      purchaseService.create(data);
      setNotification({
        message: `Compra registrada correctamente`,
        type: "success",
      });
    }
    setCompras(purchaseService.getAll());
    setIsModalOpen(false);
    setSelectedPurchase(null);
    setModalMode("create");
  };

  const handleChangeStatus = (compraId, newStatus) => {
    purchaseService.changeStatus(compraId, newStatus);
    setCompras(purchaseService.getAll());
  };

  const confirmStatusChange = (newStatus) => {
    if (purchaseToChangeStatus) {
      purchaseService.changeStatus(purchaseToChangeStatus.id, newStatus);
      setCompras(purchaseService.getAll());
      setNotification({
        message: `Estado actualizado a ${newStatus}`,
        type: "success",
      });
      setIsStatusModalOpen(false);
      setPurchaseToChangeStatus(null);
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
          onClick={() => { 
            setSelectedPurchase(null); 
            setModalMode("create"); 
            setIsModalOpen(true); 
          }}
          className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm"
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
        <div className="w-40">
          <input
            type="date"
            className="w-full pl-3 pr-3 py-1.5 rounded-md border border-gray-300 focus:outline-none focus:border-emerald-400 text-sm bg-white"
            value={dateFilter}
            onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
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
                    <td className="py-1.5 px-3 text-xs font-bold text-emerald-600 text-right">$ {compra.total.toLocaleString()}</td>
                    <td className="py-1.5 px-3 text-xs text-center text-gray-600 font-medium bg-gray-50 mx-auto rounded">{Array.isArray(compra.items) ? compra.items.length : compra.items}</td>
                    <td className="py-1.5 px-3 text-center">{getStatusBadge(compra.estado)}</td>
                    <td className="py-1.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => { setPurchaseToChangeStatus(compra); setIsStatusModalOpen(true); }}
                          className="p-1 rounded text-gray-600 hover:bg-gray-100"
                          title="Cambiar Estado"
                        >
                          <Settings size={14} />
                        </button>
                        <button onClick={() => handleView(compra)} className="p-1 rounded border border-emerald-200 text-emerald-600 hover:bg-emerald-50" title="Ver"><Eye size={14} /></button>
                        <button onClick={() => handleEdit(compra)} className="p-1 rounded border border-green-200 text-green-600 hover:bg-green-50" title="Editar"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(compra)} className="p-1 rounded border border-red-200 text-red-600 hover:bg-red-50" title="Eliminar"><Trash2 size={14} /></button>
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
      <PurchaseModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedPurchase(null); setModalMode('create'); }}
        initialData={selectedPurchase}
        mode={modalMode}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {isStatusModalOpen && purchaseToChangeStatus && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Green Header */}
            <div className="bg-green-50 px-6 py-4 border-b border-green-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">Cambiar Estado</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="space-y-2">
                {["Recibido", "Pendiente", "En Camino", "Cancelado"].map((status) => (
                  <button
                    key={status}
                    onClick={() => confirmStatusChange(status)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm border transition-all ${
                      purchaseToChangeStatus.estado === status
                        ? "bg-green-50 border-green-500 text-green-700 font-bold"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-green-50 border-t border-green-200 p-4">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="w-full py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Red Header */}
            <div className="bg-red-50 px-6 py-4 border-b border-red-200 flex items-center gap-3">
              <AlertCircle size={24} className="text-red-600" />
              <h3 className="font-bold text-gray-900 text-lg">Eliminar Compra</h3>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-gray-700 text-sm font-medium mb-1">¿Estás seguro de que deseas eliminar</p>
              <p className="text-gray-900 font-bold text-sm mb-4">la compra #{showDeleteConfirm.id}?</p>
              <p className="text-gray-500 text-xs">Esta acción no se puede deshacer.</p>
            </div>

            {/* Footer */}
            <div className="bg-red-50 border-t border-red-200 p-4 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 size={16} /> Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Notificación */}
      {notification && (
        <div className="fixed bottom-4 left-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 max-w-xs shadow-lg z-40">
          <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
          <span className="text-sm text-green-700">{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default PurchasesPage;