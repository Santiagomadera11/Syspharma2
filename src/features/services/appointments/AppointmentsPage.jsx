import React, { useState } from "react";
import { 
  Plus, Search, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, Filter, Calendar, User, Clock
} from "lucide-react";
import AppointmentFormModal from "./components/AppointmentFormModal";
import { useCrud } from "../../../shared/hooks/useCrud"; // Ajusta la ruta a tu hook

const INITIAL_APPOINTMENTS = [
  { id: "CIT-001", paciente: "Roberto Gómez", servicio: "Consulta General", profesional: "Dr. Juan Pérez", fecha: "2024-02-15", hora: "09:00", estado: "Confirmada" },
  { id: "CIT-002", paciente: "Ana Torres", servicio: "Inyectable", profesional: "Enf. María Gómez", fecha: "2024-02-15", hora: "10:30", estado: "Pendiente" },
  { id: "CIT-003", paciente: "Carlos Ruiz", servicio: "Toma de Presión", profesional: "Enf. María Gómez", fecha: "2024-02-16", hora: "08:00", estado: "Completada" },
  { id: "CIT-004", paciente: "Lucía Méndez", servicio: "Consulta General", profesional: "Dr. Juan Pérez", fecha: "2024-02-16", hora: "11:00", estado: "Cancelada" },
  { id: "CIT-005", paciente: "Sofía Castro", servicio: "Curación", profesional: "Enf. María Gómez", fecha: "2024-02-17", hora: "14:00", estado: "Pendiente" }
];

export const AppointmentsPage = () => {
  const { items: appointments, addItem, updateItem, deleteItem } = useCrud("sys_appointments", INITIAL_APPOINTMENTS);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  
  // Estados Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  // --- CRUD ACTIONS ---
  const handleCreate = () => {
    setEditingItem(null);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleEdit = (cita) => {
    setEditingItem(cita);
    setIsViewMode(false);
    setIsModalOpen(true);
  };

  const handleView = (cita) => {
    setEditingItem(cita);
    setIsViewMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    deleteItem(id);
  };

  const handleSave = (formData) => {
    if (editingItem) updateItem(editingItem.id, formData);
    else addItem({ ...formData, id: `CIT-${Date.now().toString().slice(-4)}` });
  };

  // Filtros
  const filteredItems = appointments.filter((cita) => {
    const texto = searchTerm.toLowerCase();
    const matchTexto = cita.paciente.toLowerCase().includes(texto) || cita.servicio.toLowerCase().includes(texto);
    const matchEstado = statusFilter === "Todos" || cita.estado === statusFilter;
    return matchTexto && matchEstado;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const nextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const prevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  const getStatusBadge = (estado) => {
    const base = "px-2 py-0.5 rounded text-[10px] font-bold border";
    switch(estado) {
        case "Confirmada": return <span className={`${base} bg-blue-50 text-blue-700 border-blue-200`}>Confirmada</span>;
        case "Completada": return <span className={`${base} bg-green-50 text-green-700 border-green-200`}>Completada</span>;
        case "Pendiente": return <span className={`${base} bg-yellow-50 text-yellow-700 border-yellow-200`}>Pendiente</span>;
        case "Cancelada": return <span className={`${base} bg-red-50 text-red-700 border-red-200`}>Cancelada</span>;
        default: return <span className={`${base} bg-gray-100 text-gray-700`}>{estado}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col p-6 font-sans text-gray-800 bg-white md:bg-transparent relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Agenda de Citas</h1>
          <p className="text-xs text-gray-500">Programación de servicios médicos</p>
        </div>
        <button onClick={handleCreate} className="flex items-center gap-1.5 bg-[#34D399] hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-sm transition-colors">
          <Plus size={16} /> Nueva Cita
        </button>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 mb-3 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Buscar paciente o servicio..." className="w-full pl-9 pr-3 py-1.5 rounded-md border border-gray-300 text-sm focus:outline-none focus:border-emerald-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="relative w-36">
          <select 
            className="w-full pl-3 pr-8 py-1.5 rounded-md border border-gray-300 text-sm bg-white appearance-none cursor-pointer focus:outline-none focus:border-emerald-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Confirmada">Confirmada</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Completada">Completada</option>
            <option value="Cancelada">Cancelada</option>
          </select>
          <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
        </div>
      </div>

      {/* TABLA */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#5F9EA0] text-white sticky top-0 z-10"> 
              <tr>
                <th className="py-2 px-3 text-[10px] font-bold uppercase">ID</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase">Paciente</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase">Servicio</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase">Fecha / Hora</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase">Profesional</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase text-center">Estado</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((cita) => (
                <tr key={cita.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-1.5 px-3 text-xs font-medium text-gray-900">{cita.id}</td>
                  
                  <td className="py-1.5 px-3">
                    <div className="flex items-center gap-2">
                        <User size={12} className="text-gray-400"/>
                        <span className="text-xs font-bold text-gray-700">{cita.paciente}</span>
                    </div>
                  </td>

                  <td className="py-1.5 px-3 text-xs text-gray-600">{cita.servicio}</td>
                  
                  <td className="py-1.5 px-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <Calendar size={10}/> {cita.fecha} <Clock size={10} className="ml-1"/> {cita.hora}
                    </div>
                  </td>

                  <td className="py-1.5 px-3 text-xs text-gray-600">{cita.profesional}</td>
                  
                  <td className="py-1.5 px-3 text-center">{getStatusBadge(cita.estado)}</td>

                  <td className="py-1.5 px-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => handleView(cita)} className="p-1 rounded border border-blue-200 text-blue-600 hover:bg-blue-50" title="Ver"><Eye size={14} /></button>
                      <button onClick={() => handleEdit(cita)} className="p-1 rounded border border-green-200 text-green-600 hover:bg-green-50" title="Editar"><Edit size={14} /></button>
                      <button onClick={() => handleDelete(cita.id)} className="p-1 rounded border border-red-200 text-red-600 hover:bg-red-50" title="Eliminar"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] text-gray-500">Pág {currentPage} de {totalPages || 1}</span>
            <div className="flex gap-1">
                <button onClick={prevPage} disabled={currentPage === 1} className="p-1 rounded border border-gray-300 bg-white disabled:opacity-50"><ChevronLeft size={14}/></button>
                <button onClick={nextPage} disabled={currentPage === totalPages} className="p-1 rounded border border-gray-300 bg-white disabled:opacity-50"><ChevronRight size={14}/></button>
            </div>
        </div>
      </div>

      <AppointmentFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave} 
        initialData={editingItem}
        isViewMode={isViewMode} 
      />
    </div>
  );
};

export default AppointmentsPage;