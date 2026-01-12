import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { productService } from "./services/productService";
import { ProductFormModal } from "./components/ProductFormModal";
import { ToastNotification } from "../../../shared/ui/ToastNotification";

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [notification, setNotification] = useState(null);

  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 7;

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(productService.getAll());
  };

  const showToast = (msg) => {
    // If modal is open, show toast above modal
    const z = isFormOpen ? 60 : 50;
    setNotification({ message: msg, type: "success", zIndex: z });
  };

  // --- HANDLERS ---
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setIsFormOpen(true);
  };

  const handleSave = (data) => {
    if (editingProduct) {
      const newList = productService.update({ ...editingProduct, ...data });
      setProducts(newList);
      showToast("Producto actualizado correctamente");
    } else {
      const newList = productService.create(data);
      setProducts(newList);
      showToast("Producto creado con éxito");
    }
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Borrar producto del inventario?")) {
      const newList = productService.delete(id);
      setProducts(newList);
      if (newList.length <= currentPage * itemsPerPage && currentPage > 0)
        setCurrentPage(currentPage - 1);
      showToast("Producto eliminado");
    }
  };

  const handleToggleStatus = (id) => {
    const newList = productService.toggleStatus(id);
    setProducts(newList);
  };

  // --- FILTROS ---
  const filteredProducts = products.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.laboratorio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- PAGINACIÓN ---
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Helper para formato moneda
  const formatCurrency = (val) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="h-full flex flex-col gap-3 font-sans relative">
      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          zIndex={notification.zIndex}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Inventario</h1>
          <p className="text-gray-500 text-xs">
            Gestión de productos farmacéuticos
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-[#34D399] hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-bold shadow-sm text-xs flex items-center gap-1.5 transition-all"
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
        <div className="relative w-full">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar por nombre, código o laboratorio..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-300 text-xs bg-gray-50 focus:bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
        <div className="overflow-auto custom-scrollbar no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#5D9C96] text-white text-xs uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-semibold">Producto</th>
                <th className="px-4 py-3 font-semibold">Laboratorio</th>
                <th className="px-4 py-3 font-semibold">Categoría</th>
                <th className="px-4 py-3 font-semibold">Precio</th>
                <th className="px-4 py-3 font-semibold text-center">Stock</th>
                <th className="px-4 py-3 font-semibold text-center">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {displayedProducts.map((prod) => (
                <tr
                  key={prod.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-100 rounded text-gray-500">
                        <Package size={14} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-700">{prod.nombre}</p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          {prod.codigo}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-600">
                    {prod.laboratorio}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold">
                      {prod.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-bold text-gray-800">
                    {formatCurrency(prod.precio)}
                  </td>

                  {/* Stock con Colores */}
                  <td className="px-4 py-2.5 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prod.stock <= 5
                          ? "bg-red-100 text-red-600"
                          : prod.stock <= 20
                          ? "bg-orange-100 text-orange-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {prod.stock} un.
                    </span>
                  </td>

                  <td className="px-4 py-2.5 text-center">
                    <button
                      onClick={() => handleToggleStatus(prod.id)}
                      className={`relative w-8 h-4 rounded-full transition-colors duration-200 focus:outline-none ${
                        prod.estado ? "bg-gray-700" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full shadow transition-transform duration-200 ${
                          prod.estado ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>

                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-1.5 rounded-md border border-emerald-200"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-md border border-red-200"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center text-gray-400">
              <Package size={40} className="mb-2 opacity-20" />
              <p className="text-sm">No se encontraron productos</p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {filteredProducts.length > 0 && (
          <div className="border-t border-gray-100 p-2.5 bg-gray-50 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] text-gray-500 font-medium">
              Página {currentPage + 1} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => currentPage > 0 && setCurrentPage((p) => p - 1)}
                disabled={currentPage === 0}
                className="p-1 rounded bg-white border border-gray-200"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() =>
                  currentPage < totalPages - 1 && setCurrentPage((p) => p + 1)
                }
                disabled={currentPage === totalPages - 1}
                className="p-1 rounded bg-white border border-gray-200"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ProductFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        productToEdit={editingProduct}
      />
    </div>
  );
};
