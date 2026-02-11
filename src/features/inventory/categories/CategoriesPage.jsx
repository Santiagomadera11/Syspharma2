import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, Filter, Tag
} from "lucide-react";

// ✅ IMPORTACIÓN CORRECTA DEL COMPONENTE
import CategoryFormModal from "./components/CategoryFormModal";
import { categoryService } from "./services/categoryService";

export const CategoriesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  
  // Estado del Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'view' | 'edit'

  // --- CONFIGURACIÓN COMPACTA (6 ITEMS) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  const [categories, setCategories] = useState([]);

  // Cargar categorías desde el servicio
  useEffect(() => {
    const loadCategories = () => {
      const data = categoryService.getAll();
      setCategories(data);
    };

    loadCategories();

    // Escuchar cambios en categorías
    const handleCategoryChange = () => {
      loadCategories();
    };
    window.addEventListener("categories:changed", handleCategoryChange);

    return () => {
      window.removeEventListener("categories:changed", handleCategoryChange);
    };
  }, []);

  // Filtrado
  const filteredItems = categories.filter((cat) => {
    const texto = searchTerm.toLowerCase();
    const matchTexto = cat.nombre.toLowerCase().includes(texto) || (cat.id && cat.id.toLowerCase().includes(texto));
    const matchEstado = statusFilter === "Todos" || 
      (statusFilter === "Activo" && cat.estado) || 
      (statusFilter === "Inactivo" && !cat.estado);
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
    return estado 
      ? <span className={`${baseClass} bg-green-50 text-green-700 border-green-200`}>Activo</span>
      : <span className={`${baseClass} bg-red-50 text-red-700 border-red-200`}>Inactivo</span>;
  };

  const handleView = (cat) => {
    setSelectedCategory(cat);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (cat) => {
    setSelectedCategory(cat);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = (cat) => {
    if (!window.confirm(`Eliminar categoría ${cat.nombre}?`)) return;
    categoryService.delete(cat.id);
    setCategories(categoryService.getAll());
  };

  const handleSave = (data) => {
    if (modalMode === 'edit') {
      categoryService.update(data);
    } else {
      // create
      categoryService.create(data);
    }
    setCategories(categoryService.getAll());
    setIsModalOpen(false);
    setSelectedCategory(null);
    setModalMode('create');
  };

  const confirmStatusChange = (cat) => {
    categoryService.toggleStatus(cat.id);
    setCategories(categoryService.getAll());
  };

  return (
    <div className="h-full flex flex-col p-6 font-sans text-gray-800 bg-white md:bg-transparent relative">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Categorías</h1>
          <p className="text-xs text-gray-500">Clasificación de productos</p>
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
            placeholder="Buscar categoría..." 
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

      {/* TABLA SIN SCROLL */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-600 text-white sticky top-0 z-10"> 
              <tr>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider">ID</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider">Nombre</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider">Descripción</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-center">Productos</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-center">Estado</th>
                <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-100">
              {currentItems.length > 0 ? (
                currentItems.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-1.5 px-3 text-xs font-medium text-gray-900">{cat.id}</td>
                    
                    <td className="py-1.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                           <Tag size={12} />
                        </div>
                        <span className="text-xs font-bold text-gray-700">{cat.nombre}</span>
                      </div>
                    </td>

                    <td className="py-1.5 px-3 text-xs text-gray-500 truncate max-w-[200px]">{cat.descripcion}</td>
                    <td className="py-1.5 px-3 text-xs text-center font-bold text-gray-600">{cat.productos}</td>
                    
                    <td className="py-1.5 px-3">
                      <button
                        onClick={() => confirmStatusChange(cat)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
                          cat.estado
                            ? 'bg-emerald-600'
                            : 'bg-gray-400'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                            cat.estado ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-1.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleView(cat)} className="p-1 rounded border border-emerald-200 text-emerald-600 hover:bg-emerald-50" title="Ver">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => handleEdit(cat)} className="p-1 rounded border border-green-200 text-green-600 hover:bg-green-50" title="Editar">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDelete(cat)} className="p-1 rounded border border-red-200 text-red-600 hover:bg-red-50" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">
                    No hay categorías registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] text-gray-500">Pág {currentPage} de {totalPages || 1}</span>
            <div className="flex gap-1">
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 1} 
                  className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronLeft size={14} className="text-gray-600" />
                </button>
                <button 
                  onClick={nextPage} 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  className="p-1 rounded border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
                >
                    <ChevronRight size={14} className="text-gray-600" />
                </button>
            </div>
        </div>
      </div>

      {/* ✅ MODAL INTEGRADO */}
      <CategoryFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        initialData={selectedCategory}
        mode={modalMode}
        onSave={handleSave}
        onDelete={handleDelete}
      />

    </div>
  );
};

export default CategoriesPage;