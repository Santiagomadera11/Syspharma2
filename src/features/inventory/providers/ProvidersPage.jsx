import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, Filter, Building2, Phone, Mail,
  CheckCircle, AlertCircle, X
} from "lucide-react";

import ProviderFormModal from "./components/ProviderFormModal";
import { providerService } from "./services/providerService";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog.jsx";

export const ProvidersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  
  // Estado para abrir/cerrar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'view' | 'edit'

  // Paginación (5 items para no scroll)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  // Usar providerService como fuente de verdad (localStorage).
  // Inicialmente la lista estará vacía — sólo aparecerán proveedores que el usuario añada.
  const [providers, setProviders] = useState(() => providerService.getAll());

  // Estados para modales de confirmación
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [providerToToggle, setProviderToToggle] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filtros
  const filteredItems = providers.filter((prov) => {
    const texto = searchTerm.toLowerCase();
    const matchTexto = prov.empresa.toLowerCase().includes(texto) || prov.contacto.toLowerCase().includes(texto);
    const matchEstado = statusFilter === "Todos" || prov.estado === statusFilter;
    return matchTexto && matchEstado;
  });

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  const getStatusBadge = (estado) => {
    const baseClass = "px-2 py-0.5 rounded text-[10px] font-bold border";
    return estado === "Activo" 
      ? <span className={`${baseClass} bg-green-50 text-green-700 border-green-200`}>Activo</span>
      : <span className={`${baseClass} bg-red-50 text-red-700 border-red-200`}>Inactivo</span>;
  };

  const handleView = (prov) => {
    setSelectedProvider(prov);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (prov) => {
    setSelectedProvider(prov);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (prov) => {
    setProviderToDelete(prov);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (providerToDelete) {
      const updated = providerService.delete(providerToDelete.id);
      setProviders(updated);
      setNotification({
        message: `Proveedor "${providerToDelete.empresa}" eliminado correctamente`,
        type: "success",
      });
      setIsDeleteConfirmOpen(false);
      setProviderToDelete(null);
    }
  };

  const handleSave = (data) => {
    if (modalMode === 'edit') {
      const updated = providerService.update(data);
      setProviders(updated);
      setNotification({
        message: `Proveedor "${data.empresa}" actualizado correctamente`,
        type: "success",
      });
    } else {
      const updated = providerService.create(data);
      setProviders(updated);
      setNotification({
        message: `Proveedor "${data.empresa}" creado correctamente`,
        type: "success",
      });
    }

    setIsModalOpen(false);
    setSelectedProvider(null);
    setModalMode('create');
  };

  const handleToggleStatus = (prov) => {
    setProviderToToggle(prov);
    setIsStatusConfirmOpen(true);
  };

  const confirmStatusChange = () => {
    if (providerToToggle) {
      const newStatus = providerToToggle.estado === 'Activo' ? 'Inactivo' : 'Activo';
      const updatedProv = { ...providerToToggle, estado: newStatus };
      const updated = providerService.update(updatedProv);
      setProviders(updated);
      setNotification({
        message: `Proveedor "${providerToToggle.empresa}" ${newStatus === 'Activo' ? 'activado' : 'desactivado'} correctamente`,
        type: "success",
      });
      setIsStatusConfirmOpen(false);
      setProviderToToggle(null);
    }
  };

  // Auto-dismiss notification después de 3 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="h-full flex flex-col p-6 font-sans text-gray-800 bg-white md:bg-transparent relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Proveedores</h1>
          <p className="text-xs text-gray-500">Gestión de socios comerciales</p>
        </div>
        <button 
          onClick={() => { setSelectedProvider(null); setModalMode('create'); setIsModalOpen(true); }}
          className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 mb-3 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar empresa o contacto..." 
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
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-600 text-white sticky top-0 z-10"> 
              <tr>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider">ID</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider">Empresa</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider">Contacto</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider">Teléfono / Email</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-center">Estado</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {currentItems.length > 0 ? (
                currentItems.map((prov) => (
                  <tr key={prov.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-1.5 px-3 text-xs font-medium text-gray-900">{prov.id}</td>
                    
                    <td className="py-1.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                          <Building2 size={12} />
                        </div>
                        <span className="text-xs font-bold text-gray-700 truncate max-w-[180px]">{prov.empresa}</span>
                      </div>
                    </td>

                    <td className="py-1.5 px-3 text-xs text-gray-600">{prov.contacto}</td>
                    
                    <td className="py-1.5 px-3">
                      <div className="flex flex-col gap-0.5">
                         <div className="flex items-center gap-1 text-[10px] text-gray-500">
                            <Phone size={10} /> {prov.telefono}
                         </div>
                         <div className="flex items-center gap-1 text-[10px] text-gray-500 truncate max-w-[150px]">
                            <Mail size={10} /> {prov.email}
                         </div>
                      </div>
                    </td>
                    
                    <td className="py-1.5 px-3">
                      <button
                        onClick={() => handleToggleStatus(prov)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                          prov.estado === 'Activo'
                            ? 'bg-emerald-600'
                            : 'bg-gray-400'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                            prov.estado === 'Activo' ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-1.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleView(prov)} className="p-1 rounded border border-emerald-200 text-emerald-600 hover:bg-emerald-50" title="Ver">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleEdit(prov)} className="p-1 rounded border border-green-200 text-green-600 hover:bg-green-50" title="Editar">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(prov)} className="p-1 rounded border border-red-200 text-red-600 hover:bg-red-50" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">
                    No hay proveedores registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER PAGINACIÓN */}
        <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] text-gray-500">Pág {currentPage} de {totalPages || 1}</span>
            <div className="flex gap-1">
                <button onClick={prevPage} disabled={currentPage === 1} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50">
                    <ChevronLeft size={14} className="text-gray-600" />
                </button>
                <button onClick={nextPage} disabled={currentPage === totalPages || totalPages === 0} className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50">
                    <ChevronRight size={14} className="text-gray-600" />
                </button>
            </div>
        </div>
      </div>

      {/* ✅ RENDERIZAMOS EL MODAL AQUÍ */}
      <ProviderFormModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedProvider(null); setModalMode('create'); }}
        initialData={selectedProvider}
        mode={modalMode}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {/* 🔋 Modal de Confirmación de Estado */}
      {isStatusConfirmOpen && providerToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className={`px-6 py-4 border-b flex justify-between items-center ${
              providerToToggle.estado === 'Activo'
                ? 'bg-red-50 border-red-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                {providerToToggle.estado === 'Activo' ? (
                  <>
                    <AlertCircle size={20} className="text-red-600" />
                    Desactivar Proveedor
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} className="text-green-600" />
                    Activar Proveedor
                  </>
                )}
              </h3>
              <button 
                onClick={() => setIsStatusConfirmOpen(false)} 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex-1">
              <p className="text-gray-700 font-medium text-sm mb-2">
                {providerToToggle.empresa}
              </p>
              <p className="text-gray-600 text-sm">
                {providerToToggle.estado === 'Activo'
                  ? `¿Desactivar este proveedor? Dejará de estar disponible para nuevas compras.`
                  : `¿Activar este proveedor? Volverá a estar disponible para nuevas compras.`
                }
              </p>
            </div>

            {/* Footer */}
            <div className={`px-6 py-3 border-t flex gap-2 ${
              providerToToggle.estado === 'Activo'
                ? 'bg-red-50 border-red-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <button 
                onClick={() => setIsStatusConfirmOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-bold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmStatusChange}
                className={`flex-1 px-4 py-2 text-sm font-bold text-white rounded transition-colors ${
                  providerToToggle.estado === 'Activo'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {providerToToggle.estado === 'Activo' ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🗑️ Modal de Confirmación de Eliminación */}
      <ConfirmDialog
        open={isDeleteConfirmOpen && !!providerToDelete}
        title="Eliminar Proveedor"
        message={<span>¿Estás seguro de eliminar el proveedor <b>"{providerToDelete?.empresa}"</b>?<br/>Esta acción eliminará permanentemente el proveedor y todos sus registros.</span>}
        onCancel={() => setIsDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger={true}
      />

      {/* 📢 Notificación en esquina inferior izquierda */}
      {notification && (
        <div className="fixed bottom-4 left-4 z-40 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className={`px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 max-w-xs ${
            notification.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            )}
            <p className="text-sm font-medium">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProvidersPage;