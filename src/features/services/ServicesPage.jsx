import React, { useState, useEffect, useCallback } from "react";
import {
  Plus, Search, Eye, Edit, Trash2,
  ChevronLeft, ChevronRight, Filter, Stethoscope, Clock
} from "lucide-react";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog.jsx";
import ServiceFormModal from "./components/ServiceFormModal";
import axios from "axios";

const API_URL = "http://localhost:5055/api/Servicio";
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("syspharma_token")}` },
});

export const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const itemsPerPage = 5;

  const [confirmConfig, setConfirmConfig] = useState({
    open: false, title: "", message: "", confirmText: "Confirmar", danger: true, onConfirm: null,
  });

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, getAuthHeaders());
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch { setServices([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadServices();
    const onChange = () => loadServices();
    window.addEventListener("services:changed", onChange);
    return () => window.removeEventListener("services:changed", onChange);
  }, [loadServices]);

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const handleCreate = () => { setEditingItem(null); setIsViewMode(false); setIsModalOpen(true); };

  const handleEdit = (srv) => {
    setConfirmConfig({
      open: true, title: "Editar Servicio",
      message: <><b>¿Editar el servicio "{srv.nombre}"?</b></>,
      confirmText: "Editar", danger: false,
      onConfirm: () => { setEditingItem(srv); setIsViewMode(false); setIsModalOpen(true); },
    });
  };

  const handleView = (srv) => { setEditingItem(srv); setIsViewMode(true); setIsModalOpen(true); };

  const handleDelete = (srv) => {
    setConfirmConfig({
      open: true, title: "Eliminar Servicio",
      message: <><b>¿Eliminar el servicio "{srv.nombre}"?</b><br /><span className="text-xs text-gray-500">Esta acción no se puede deshacer.</span></>,
      confirmText: "Eliminar", danger: true,
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/${srv.id}`, getAuthHeaders());
          setNotification({ message: "Servicio eliminado correctamente", type: "success" });
          await loadServices();
        } catch (err) {
          setNotification({ message: err?.response?.data?.message || "Error al eliminar", type: "error" });
        }
      },
    });
  };

  const handleToggleEstado = (srv) => {
    const newEstado = !srv.estado;
    setConfirmConfig({
      open: true, title: `Cambiar estado`,
      message: `¿Cambiar el estado de "${srv.nombre}" a ${newEstado ? "Activo" : "Inactivo"}?`,
      confirmText: newEstado ? "Activar" : "Desactivar", danger: false,
      onConfirm: async () => {
        try {
          const config = getAuthHeaders();
          config.headers["Content-Type"] = "application/json";
          await axios.patch(`${API_URL}/${srv.id}/estado`, newEstado, config);
          await loadServices();
        } catch (err) {
          setNotification({ message: err?.response?.data?.message || "Error al cambiar estado", type: "error" });
        }
      },
    });
  };

  const handleSave = async (formData) => {
    try {
      if (editingItem) {
        await axios.put(API_URL, { ...formData, id: editingItem.id }, getAuthHeaders());
        setNotification({ message: "Servicio actualizado correctamente", type: "success" });
      } else {
        await axios.post(API_URL, formData, getAuthHeaders());
        setNotification({ message: "Servicio creado correctamente", type: "success" });
      }
      await loadServices();
      setIsModalOpen(false);
      setEditingItem(null);
      window.dispatchEvent(new CustomEvent("services:changed"));
    } catch (err) {
      setNotification({ message: err?.response?.data?.message || "Error al guardar", type: "error" });
    }
  };

  const filteredItems = services.filter((srv) => {
    const texto = searchTerm.toLowerCase();
    const matchTexto = (srv.nombre || "").toLowerCase().includes(texto) ||
      (srv.categoriaNombre || "").toLowerCase().includes(texto);
    const matchEstado = statusFilter === "Todos" ||
      (statusFilter === "Activo" ? srv.estado : !srv.estado);
    return matchTexto && matchEstado;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="h-full flex flex-col p-6 font-sans text-gray-800 bg-white md:bg-transparent relative">
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Servicios</h1>
          <p className="text-xs text-gray-500">Catálogo de procedimientos</p>
        </div>
        <button onClick={handleCreate}
          className="flex items-center gap-1.5 bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors">
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div className="flex gap-3 mb-3 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Buscar servicio..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:border-emerald-500"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="relative w-36">
          <select className="w-full pl-3 pr-8 py-1.5 rounded-md border border-gray-300 text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:border-emerald-500"
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-600 text-white sticky top-0 z-10">
              <tr>
                {["ID", "Nombre", "Categoría", "Precio", "Duración", "Estado", "Acciones"].map(h => (
                  <th key={h} className="py-2 px-3 text-[10px] font-bold uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-xs">Cargando servicios...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-xs">No se encontraron servicios.</td></tr>
              ) : (
                currentItems.map((srv) => (
                  <tr key={srv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-1.5 px-3 text-xs font-medium text-gray-900">{srv.id}</td>
                    <td className="py-1.5 px-3">
                      <div className="flex items-center gap-2">
                        <Stethoscope size={12} className="text-emerald-600" />
                        <span className="text-xs font-bold text-gray-700">{srv.nombre}</span>
                      </div>
                    </td>
                    <td className="py-1.5 px-3 text-xs text-gray-600">{srv.categoriaNombre}</td>
                    <td className="py-1.5 px-3 text-xs font-bold text-emerald-600 text-right">$ {Number(srv.precio).toLocaleString()}</td>
                    <td className="py-1.5 px-3 text-xs text-center text-gray-500">
                      <div className="flex items-center justify-center gap-1"><Clock size={10} /> {srv.duracion} min</div>
                    </td>
                    <td className="py-1.5 px-3">
                      <button onClick={() => handleToggleEstado(srv)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${srv.estado ? "bg-emerald-600" : "bg-gray-400"}`}>
                        <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${srv.estado ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </td>
                    <td className="py-1.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleView(srv)} className="p-1 rounded border border-emerald-200 text-emerald-600 hover:bg-emerald-50"><Eye size={14} /></button>
                        <button onClick={() => handleEdit(srv)} className="p-1 rounded border border-green-200 text-green-600 hover:bg-green-50"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(srv)} className="p-1 rounded border border-red-200 text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <span className="text-[10px] text-gray-500">Pág {currentPage} de {totalPages || 1}</span>
          <div className="flex gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="p-1 rounded border border-gray-300 bg-white disabled:opacity-50"><ChevronLeft size={14} /></button>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded border border-gray-300 bg-white disabled:opacity-50"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      <ServiceFormModal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
        onSave={handleSave} initialData={editingItem} isViewMode={isViewMode} />

      <ConfirmDialog open={confirmConfig.open} title={confirmConfig.title} message={confirmConfig.message}
        confirmText={confirmConfig.confirmText} danger={confirmConfig.danger}
        onCancel={() => setConfirmConfig(c => ({ ...c, open: false }))}
        onConfirm={() => { confirmConfig.onConfirm && confirmConfig.onConfirm(); setConfirmConfig(c => ({ ...c, open: false })); }} />

      {notification && (
        <div className={`fixed bottom-4 left-4 px-4 py-3 rounded-lg shadow-lg z-50 text-sm font-medium ${notification.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;