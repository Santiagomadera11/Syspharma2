import React, { useState } from "react";
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight, Filter, Package } from "lucide-react";
import ProductModal from "./components/ProductFormModal";
import { useCrud } from "../../../shared/hooks/useCrud"; // Importa el hook

const INITIAL_PRODS = [
  { id: "PROD-001", nombre: "Amoxicilina 500mg", categoria: "Antibióticos", stock: 150, precio: 2500, estado: "Activo" },
  { id: "PROD-002", nombre: "Paracetamol 500mg", categoria: "Analgésicos", stock: 300, precio: 500, estado: "Activo" },
];

export const ProductsPage = () => {
  const { items: products, addItem, updateItem, deleteItem } = useCrud("sys_products", INITIAL_PRODS);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  const handleCreate = () => { setEditingItem(null); setIsModalOpen(true); };
  const handleEdit = (item) => { setEditingItem(item); setIsModalOpen(true); };
  const handleSave = (data) => {
    if(editingItem) updateItem(editingItem.id, data);
    else addItem({ ...data, id: `PROD-${Date.now()}` });
  };

  const filtered = products.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const getStatusBadge = (estado) => {
    // Lógica simple para badge
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-gray-100 text-gray-700">{estado || 'Activo'}</span>;
  };

  return (
    <div className="h-full flex flex-col p-6 font-sans text-gray-800 bg-white md:bg-transparent relative">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div><h1 className="text-xl font-bold">Productos</h1><p className="text-xs text-gray-500">Inventario</p></div>
        <button onClick={handleCreate} className="flex items-center gap-1.5 bg-[#34D399] hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md text-sm font-medium"><Plus size={16} /> Nuevo</button>
      </div>

      <div className="flex gap-3 mb-4 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input type="text" placeholder="Buscar..." className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#5F9EA0] text-white sticky top-0 z-10">
              <tr>
                <th className="py-2 px-3 text-[10px]">ID</th>
                <th className="py-2 px-3 text-[10px]">Nombre</th>
                <th className="py-2 px-3 text-[10px]">Categoría</th>
                <th className="py-2 px-3 text-[10px] text-center">Stock</th>
                <th className="py-2 px-3 text-[10px] text-right">Precio</th>
                <th className="py-2 px-3 text-[10px] text-center">Estado</th>
                <th className="py-2 px-3 text-[10px] text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-1.5 px-3 text-xs font-medium">{prod.id}</td>
                  <td className="py-1.5 px-3"><div className="flex items-center gap-2"><Package size={14} className="text-gray-400"/><span className="text-xs font-bold">{prod.nombre}</span></div></td>
                  <td className="py-1.5 px-3 text-xs text-gray-600">{prod.categoria}</td>
                  <td className="py-1.5 px-3 text-xs text-center font-bold">{prod.stock}</td>
                  <td className="py-1.5 px-3 text-xs text-right font-bold text-emerald-600">₡ {prod.precio}</td>
                  <td className="py-1.5 px-3 text-center">{getStatusBadge(prod.estado)}</td>
                  <td className="py-1.5 px-3">
                    <div className="flex justify-center gap-1.5">
                      <button onClick={() => handleEdit(prod)} className="p-1 rounded border border-green-200 text-green-600 hover:bg-green-50"><Edit size={14} /></button>
                      <button onClick={() => deleteItem(prod.id)} className="p-1 rounded border border-red-200 text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Paginación simple igual que antes... */}
        <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
            <span className="text-[10px] text-gray-500">Pág {currentPage}</span>
            <div className="flex gap-1">
                <button onClick={() => setCurrentPage(c => Math.max(1, c-1))} disabled={currentPage===1} className="p-1 border rounded bg-white disabled:opacity-50"><ChevronLeft size={14}/></button>
                <button onClick={() => setCurrentPage(c => Math.min(totalPages, c+1))} disabled={currentPage===totalPages} className="p-1 border rounded bg-white disabled:opacity-50"><ChevronRight size={14}/></button>
            </div>
        </div>
      </div>

      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} initialData={editingItem} />
    </div>
  );
};
export default ProductsPage;