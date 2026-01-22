import React, { useState } from "react";
import { 
  Plus, Search, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, Filter, Building2, Phone, Mail
} from "lucide-react";

// ✅ IMPORTAMOS EL MODAL DESDE LA CARPETA COMPONENTS
import ProviderFormModal from "./components/ProviderFormModal";

export const ProvidersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  
  // Estado para abrir/cerrar el modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Paginación (5 items para no scroll)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const [providers] = useState([
    { id: "PRV-001", empresa: "Farmacéutica Global S.A.", contacto: "Carlos Ruiz", telefono: "+506 2222-1111", email: "ventas@fglobal.com", estado: "Activo" },
    { id: "PRV-002", empresa: "Distribuidora MedRx", contacto: "Ana Gómez", telefono: "+506 2222-3333", email: "ana.g@medrx.cr", estado: "Activo" },
    { id: "PRV-003", empresa: "Laboratorios Pfizer", contacto: "Roberto Díaz", telefono: "+506 2222-5555", email: "rdiaz@pfizer.com", estado: "Activo" },
    { id: "PRV-004", empresa: "Insumos Médicos CR", contacto: "María Solís", telefono: "+506 8888-9999", email: "pedidos@insumoscr.com", estado: "Inactivo" },
    { id: "PRV-005", empresa: "Bayer Centroamérica", contacto: "Felipe Wong", telefono: "+506 2290-0000", email: "felipe.w@bayer.com", estado: "Activo" },
    { id: "PRV-006", empresa: "Genéricos del Valle", contacto: "Lucía Méndez", telefono: "+506 2440-1234", email: "info@genericosvalle.com", estado: "Activo" },
    { id: "PRV-007", empresa: "Droguería Central", contacto: "Pedro Torres", telefono: "+506 2256-7890", email: "p.torres@dcentral.com", estado: "Inactivo" },
    { id: "PRV-008", empresa: "Meditech Devices", contacto: "Sofía Castro", telefono: "+506 2222-8888", email: "sofia@meditech.com", estado: "Activo" },
  ]);

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

  return (
    <div className="h-full flex flex-col p-6 font-sans text-gray-800 bg-white md:bg-transparent relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Proveedores</h1>
          <p className="text-xs text-gray-500">Gestión de socios comerciales</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)} // ABRIR MODAL
          className="flex items-center gap-1.5 bg-[#34D399] hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm"
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
            <thead className="bg-[#5F9EA0] text-white sticky top-0 z-10"> 
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
                        <div className="w-5 h-5 rounded bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
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
                    
                    <td className="py-1.5 px-3 text-center">
                      {getStatusBadge(prov.estado)}
                    </td>

                    <td className="py-1.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1 rounded border border-blue-200 text-blue-600 hover:bg-blue-50" title="Ver">
                          <Eye size={14} />
                        </button>
                        <button className="p-1 rounded border border-green-200 text-green-600 hover:bg-green-50" title="Editar">
                          <Edit size={14} />
                        </button>
                        <button className="p-1 rounded border border-red-200 text-red-600 hover:bg-red-50" title="Eliminar">
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
      <ProviderFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

    </div>
  );
};

export default ProvidersPage;