import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Stethoscope,
  Clock,
  AlertCircle,
} from "lucide-react";

// ✅ REUTILIZAMOS EL MODAL QUE YA CREASTE PARA EL ADMIN
// Así, si cambias el diseño del formulario, cambia para todos.
import ServiceFormModal from "../services/components/ServiceFormModal";
import { OpenShiftModal } from "../sales/components/OpenShiftModal";

// ✅ USAMOS EL MISMO HOOK Y LA MISMA "KEY" (sys_services)
// Esto asegura que el Empleado vea LOS MISMOS datos que el Admin.
import { useCrud } from "../../shared/hooks/useCrud";
import { turnService } from "../sales/services/turnService";

const INITIAL_SERVICES = [
  {
    id: "SRV-001",
    nombre: "Inyectable Intramuscular",
    categoria: "Enfermería",
    precio: 2500,
    duracion: 10,
    estado: "Activo",
  },
  {
    id: "SRV-002",
    nombre: "Toma de Presión Arterial",
    categoria: "Enfermería",
    precio: 1000,
    duracion: 5,
    estado: "Activo",
  },
];

export const EmployeeServicesPage = () => {
  // Usamos "sys_services" para compartir la base de datos con el Admin
  const {
    items: services,
    addItem,
    updateItem,
    deleteItem,
  } = useCrud("sys_services", INITIAL_SERVICES);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");

  // Estados Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [hasActiveTurn, setHasActiveTurn] = useState(turnService.hasActiveTurn());
  const [showTurnTooltip, setShowTurnTooltip] = useState(false);
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [user] = useState(JSON.parse(localStorage.getItem("syspharma_user") || "{}"));

  // Escuchar cambios en servicios y estado de turno desde otras páginas
  useEffect(() => {
    const handleServicesChange = () => {
      // Forzar re-renderizado leyendo del localStorage
      const stored = localStorage.getItem("sys_services");
      if (stored) {
        // El hook se re-subscribirá automáticamente
        setCurrentPage(1);
      }
    };

    const handleTurnChange = () => {
      // Actualizar estado del turno cuando cambie
      setHasActiveTurn(turnService.hasActiveTurn());
    };

    window.addEventListener("services:changed", handleServicesChange);
    window.addEventListener("turn:changed", handleTurnChange);
    return () => {
      window.removeEventListener("services:changed", handleServicesChange);
      window.removeEventListener("turn:changed", handleTurnChange);
    };
  }, []);

  // --- ACCIONES ---
  const handleCreate = () => {
    // Intercepción: Solo empleados deben chequear turno
    if (user.rol !== "Administrador" && !turnService.hasActiveTurn()) {
      setShowOpenShiftModal(true);
      return;
    }
    setEditingItem(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleShiftOpenedThenCreate = () => {
    setShowOpenShiftModal(false);
    // Después de abrir turno, abrir modal de crear servicio
    setTimeout(() => {
      setEditingItem(null);
      setIsViewMode(false);
      setIsModalOpen(true);
    }, 300);
  };

  const handleEdit = (service) => {
    setEditingItem(service);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleView = (service) => {
    setEditingItem(service);
    setIsViewMode(true); // Modo lectura activado
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    deleteItem(id);
    window.dispatchEvent(new CustomEvent('services:changed'));
  };

  const handleSave = (formData) => {
    if (editingItem) updateItem(editingItem.id, formData);
    else addItem({ ...formData, id: `SRV-${Date.now().toString().slice(-4)}` });
    window.dispatchEvent(new CustomEvent('services:changed'));
  };

  // --- FILTROS Y PAGINACIÓN ---
  const filteredItems = services.filter((srv) => {
    const texto = searchTerm.toLowerCase();
    const matchTexto =
      srv.nombre.toLowerCase().includes(texto) ||
      srv.categoria.toLowerCase().includes(texto);
    const matchEstado = statusFilter === "Todos" || srv.estado === statusFilter;
    return matchTexto && matchEstado;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getStatusBadge = (estado) => {
    return (
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${estado === "Activo" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
      >
        {estado}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col p-6 font-sans text-gray-800 bg-white md:bg-transparent relative">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Servicios</h1>
          <p className="text-xs text-gray-500">Gestión de procedimientos</p>
        </div>
        <div className="relative">
          <button
            onClick={handleCreate}
            disabled={!hasActiveTurn}
            onMouseEnter={() => !hasActiveTurn && setShowTurnTooltip(true)}
            onMouseLeave={() => setShowTurnTooltip(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors ${
              hasActiveTurn
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Plus size={16} /> Nuevo
          </button>
          {showTurnTooltip && !hasActiveTurn && (
            <div className="absolute top-full mt-2 right-0 bg-gray-800 text-white text-xs rounded-md px-3 py-2 whitespace-nowrap shadow-lg z-50 flex items-center gap-1.5">
              <AlertCircle size={14} />
              Debes abrir caja para realizar esta operación
            </div>
          )}
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 mb-3 flex-shrink-0">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar servicio..."
            className="w-full pl-9 pr-3 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative w-36">
          <select
            className="w-full pl-3 pr-8 py-1.5 rounded-md border border-gray-300 text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
          </select>
          <Filter
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={14}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-600 text-white sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 text-[10px] font-bold uppercase">
                  ID
                </th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase">
                  Nombre
                </th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase">
                  Categoría
                </th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase text-right">
                  Precio
                </th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase text-center">
                  Duración
                </th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase text-center">
                  Estado
                </th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase text-center">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((srv) => (
                <tr key={srv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-1.5 px-3 text-xs font-medium text-gray-900">
                    {srv.id}
                  </td>
                  <td className="py-1.5 px-3">
                    <div className="flex items-center gap-2">
                      <Stethoscope size={12} className="text-blue-600" />
                      <span className="text-xs font-bold text-gray-700">
                        {srv.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="py-1.5 px-3 text-xs text-gray-600">
                    {srv.categoria}
                  </td>
                  <td className="py-1.5 px-3 text-xs font-bold text-blue-600 text-right">
                    $ {Number(srv.precio).toLocaleString()}
                  </td>
                  <td className="py-1.5 px-3 text-xs text-center text-gray-500">
                    <div className="flex items-center justify-center gap-1">
                      <Clock size={10} /> {srv.duracion} min
                    </div>
                  </td>
                  <td className="py-1.5 px-3 text-center">
                    {getStatusBadge(srv.estado)}
                  </td>
                  <td className="py-1.5 px-3">
                    <div className="flex items-center justify-center gap-1">
                      {/* VER DETALLE */}
                      <button
                        onClick={() => handleView(srv)}
                        className="p-1 rounded border border-blue-200 text-blue-600 hover:bg-blue-50"
                        title="Ver detalle"
                      >
                        <Eye size={14} />
                      </button>
                      {/* EDITAR */}
                      <button
                        onClick={() => handleEdit(srv)}
                        className="p-1 rounded border border-green-200 text-green-600 hover:bg-green-50"
                        title="Editar"
                      >
                        <Edit size={14} />
                      </button>
                      {/* ELIMINAR */}
                      <button
                        onClick={() => handleDelete(srv.id)}
                        className="p-1 rounded border border-red-200 text-red-600 hover:bg-red-50"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <span className="text-[10px] text-gray-500">
            Pág {currentPage} de {totalPages || 1}
          </span>
          <div className="flex gap-1">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className="p-1 rounded border border-gray-300 bg-white disabled:opacity-50"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className="p-1 rounded border border-gray-300 bg-white disabled:opacity-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ✅ MODAL REUTILIZADO */}
      <ServiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
        isViewMode={isViewMode}
      />

      {/* Modal para abrir caja si no hay turno */}
      <OpenShiftModal
        isOpen={showOpenShiftModal}
        onShiftOpened={handleShiftOpenedThenCreate}
        user={user}
        canClose={user.rol === "Administrador"}
        onCancel={() => setShowOpenShiftModal(false)}
      />
    </div>
  );
};

export default EmployeeServicesPage;
