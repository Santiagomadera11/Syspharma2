import React, { useState, useEffect } from "react";
import { 
  Plus, Search, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, Filter, Tag,
  CheckCircle, AlertCircle, X
} from "lucide-react";

// ✅ IMPORTACIÓN CORRECTA DEL COMPONENTE
import CategoryFormModal from "./components/CategoryFormModal";
import { categoryService } from "./services/categoryService";
import { productService } from "../products/services/productService";

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

  // Estados para confirmación de estado
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [categoryToToggle, setCategoryToToggle] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [notification, setNotification] = useState(null);

  // Cargar categorías desde el servicio
  useEffect(() => {
    const loadCategories = () => {
      const data = categoryService.getAll();
      const enrichedData = enrichCategoriesWithProductCount(data);
      setCategories(enrichedData);
    };

    loadCategories();

    // Escuchar cambios en categorías y productos
    const handleCategoryChange = () => loadCategories();
    const handleProductsChange = () => loadCategories();
    
    window.addEventListener("categories:changed", handleCategoryChange);
    window.addEventListener("products:changed", handleProductsChange);

    return () => {
      window.removeEventListener("categories:changed", handleCategoryChange);
      window.removeEventListener("products:changed", handleProductsChange);
    };
  }, []);

  // Filtrado
  const filteredItems = categories.filter((cat) => {
    const texto = searchTerm.toLowerCase();
    const matchTexto = cat.nombre.toLowerCase().includes(texto) || (cat.id && String(cat.id).toLowerCase().includes(texto));
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

  // Función para enriquecer categorías con conteo de productos
  const enrichCategoriesWithProductCount = (categoriesList) => {
    const products = productService.getAll();
    return categoriesList.map(cat => ({
      ...cat,
      productos: products.filter(p => p.categoria === cat.nombre).length
    }));
  };

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
    setCategoryToDelete(cat);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteCategory = () => {
    if (categoryToDelete) {
      categoryService.delete(categoryToDelete.id);
      const updatedCategories = enrichCategoriesWithProductCount(categoryService.getAll());
      setCategories(updatedCategories);
      setNotification({
        message: `Categoría "${categoryToDelete.nombre}" eliminada correctamente`,
        type: "success",
      });
    }
    setIsDeleteConfirmOpen(false);
    setCategoryToDelete(null);
  };

  const handleSave = (data) => {
    const isEdit = modalMode === 'edit';
    const actionMessage = isEdit 
      ? `Categoría "${data.nombre}" actualizada correctamente`
      : `Categoría "${data.nombre}" creada correctamente`;
    
    if (isEdit) {
      categoryService.update(data);
    } else {
      categoryService.create(data);
    }
    
    const updatedCategories = enrichCategoriesWithProductCount(categoryService.getAll());
    setCategories(updatedCategories);
    setNotification({
      message: actionMessage,
      type: "success",
    });
    setIsModalOpen(false);
    setSelectedCategory(null);
    setModalMode('create');
  };

  const confirmStatusChange = (cat) => {
    setCategoryToToggle(cat);
    setIsStatusConfirmOpen(true);
  };

  const confirmToggleStatus = () => {
    if (categoryToToggle) {
      categoryService.toggleStatus(categoryToToggle.id);
      const newStatus = !categoryToToggle.estado;
      const updatedCategories = enrichCategoriesWithProductCount(categoryService.getAll());
      setCategories(updatedCategories);
      setNotification({
        message: `Categoría "${categoryToToggle.nombre}" ${newStatus ? 'activada' : 'desactivada'} correctamente`,
        type: "success",
      });
      setIsStatusConfirmOpen(false);
      setCategoryToToggle(null);
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
          <h1 className="text-lg font-bold text-gray-800">Categorías</h1>
          <p className="text-xs text-gray-500">Clasificación de productos</p>
        </div>
        <button 
          onClick={() => {
            setSelectedCategory(null);
            setModalMode('create');
            setIsModalOpen(true);
          }}
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

                    <td className="py-1.5 px-3 text-xs text-center font-bold">
                      {cat.productos > 0 
                        ? <span className="text-emerald-600">{cat.productos}</span>
                        : <span className="text-gray-400">Sin asociar</span>
                      }
                    </td>
                    
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
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-xs">
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

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            
            {/* Header */}
            <div className="bg-red-50 px-5 py-3 border-b border-red-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <AlertCircle size={18} className="text-red-600" />
                Eliminar Categoría
              </h3>
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <p className="text-sm text-gray-700">
                ¿Estás seguro de eliminar la categoría <strong>"{categoryToDelete.nombre}"</strong>?
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Esta acción no se puede deshacer.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-red-50 px-5 py-3 border-t border-red-200 flex justify-end gap-2">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDeleteCategory}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-1 shadow-sm"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed bottom-4 left-4 max-w-xs animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="bg-white rounded-lg shadow-lg border border-green-200 p-4 flex items-start gap-3">
            <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-gray-800">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Modal */}
      {isStatusConfirmOpen && categoryToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            
            {/* Header */}
            <div className={`px-5 py-3 border-b flex justify-between items-center ${
              categoryToToggle.estado 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                {categoryToToggle.estado ? (
                  <AlertCircle size={18} className="text-red-600" />
                ) : (
                  <CheckCircle size={18} className="text-green-600" />
                )}
                {categoryToToggle.estado ? 'Desactivar Categoría' : 'Activar Categoría'}
              </h3>
              <button 
                onClick={() => setIsStatusConfirmOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <p className="text-sm text-gray-700">
                {categoryToToggle.estado 
                  ? `¿Desactivar la categoría "${categoryToToggle.nombre}"?`
                  : `¿Activar la categoría "${categoryToToggle.nombre}"?`
                }
              </p>
              {categoryToToggle.estado && (
                <p className="text-xs text-gray-500 mt-2">
                  Los productos de esta categoría no serán visibles en el catálogo.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className={`px-5 py-3 border-t flex justify-end gap-2 ${
              categoryToToggle.estado 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <button 
                onClick={() => setIsStatusConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmToggleStatus}
                className={`px-4 py-2 text-xs font-bold text-white rounded-md transition-colors flex items-center gap-1 shadow-sm ${
                  categoryToToggle.estado
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {categoryToToggle.estado ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoriesPage;