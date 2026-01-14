import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { categoryService } from './services/categoryService';
import { CategoryFormModal } from './components/CategoryFormModal';
import { ToastNotification } from '../../../shared/ui/ToastNotification';

export const CategoriesPage = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);
  
  // Paginación
  const [page, setPage] = useState(0);
  const perPage = 8;

  useEffect(() => setData(categoryService.getAll()), []);

  const handleSave = (item) => {
    const list = editItem ? categoryService.update(item) : categoryService.create(item);
    setData(list);
    setToast(editItem ? "Categoría actualizada" : "Categoría creada");
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if(window.confirm("¿Eliminar categoría?")) {
      setData(categoryService.delete(id));
      setToast("Categoría eliminada");
    }
  };

  const filtered = data.filter(i => i.nombre.toLowerCase().includes(search.toLowerCase()));
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="h-full flex flex-col gap-3 font-sans relative">
      {toast && <ToastNotification message={toast} onClose={() => setToast(null)} />}
      
      <div className="flex justify-between items-center flex-shrink-0">
        <div><h1 className="text-lg font-bold text-gray-800">Categorías</h1><p className="text-gray-500 text-xs">Clasificación de productos</p></div>
        <button onClick={() => { setEditItem(null); setModalOpen(true); }} className="bg-[#34D399] hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5"><Plus size={16}/> Nueva</button>
      </div>

      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="Buscar categoría..." className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs outline-none focus:border-primary-300" value={search} onChange={e => setSearch(e.target.value)} /></div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
        <div className="overflow-auto custom-scrollbar no-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-[#5D9C96] text-white text-xs uppercase sticky top-0 z-10">
              <tr><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Descripción</th><th className="px-4 py-3 text-center">Estado</th><th className="px-4 py-3 text-right">Acciones</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {paginated.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 font-bold text-gray-700 flex items-center gap-2"><div className="bg-blue-50 p-1 rounded text-blue-500"><Tag size={12}/></div>{item.nombre}</td>
                  <td className="px-4 py-2.5 text-gray-500">{item.descripcion || '-'}</td>
                  <td className="px-4 py-2.5 text-center"><span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.estado ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{item.estado ? 'Activa' : 'Inactiva'}</span></td>
                  <td className="px-4 py-2.5 text-right"><div className="flex justify-end gap-1.5"><button onClick={() => { setEditItem(item); setModalOpen(true); }} className="bg-emerald-50 text-emerald-600 p-1.5 rounded border border-emerald-200"><Edit size={14}/></button><button onClick={() => handleDelete(item.id)} className="bg-red-50 text-red-600 p-1.5 rounded border border-red-200"><Trash2 size={14}/></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Paginación */}
        {filtered.length > 0 && <div className="border-t border-gray-100 p-2.5 flex justify-between items-center bg-gray-50 flex-shrink-0"><span className="text-[10px] text-gray-500">Página {page + 1} de {totalPages}</span><div className="flex gap-2"><button onClick={() => page > 0 && setPage(p => p - 1)} disabled={page === 0} className="p-1 bg-white border rounded"><ChevronLeft size={14}/></button><button onClick={() => page < totalPages - 1 && setPage(p => p + 1)} disabled={page === totalPages - 1} className="p-1 bg-white border rounded"><ChevronRight size={14}/></button></div></div>}
      </div>
      <CategoryFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} itemToEdit={editItem} />
    </div>
  );
};