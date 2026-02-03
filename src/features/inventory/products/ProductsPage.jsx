import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  Package,
  X,
} from "lucide-react";
import ProductModal from "./components/ProductFormModal";
import { productService } from "./services/productService";
import { StatusNotification } from "/src/shared/ui/StatusNotification";

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const itemsPerPage = 20;

  // Cargar productos al montar el componente
  useEffect(() => {
    setProducts(productService.getAll());
    // Refrescar cada 1 segundo para sincronizar cambios de stock
    const interval = setInterval(() => {
      const updatedProducts = productService.getAll();
      console.log(
        `🔄 Refrescando productos... Total: ${updatedProducts.length}`,
      );
      setProducts(updatedProducts);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };
  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  const handleSave = (data) => {
    if (editingItem) {
      // Actualizar producto existente con los nuevos datos
      const updatedProduct = { ...editingItem, ...data };
      const updatedProducts = productService.update(updatedProduct);
      setProducts(updatedProducts);
      setNotification({
        message: `${data.nombre} actualizado correctamente`,
        type: "success",
        duration: 3000,
      });
    } else {
      const newProduct = { ...data, id: Date.now() };
      const updatedProducts = productService.create(newProduct);
      setProducts(updatedProducts);
      setNotification({
        message: `${data.nombre} creado correctamente`,
        type: "success",
        duration: 3000,
      });
    }
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      filterStatus === "todos" ||
      (filterStatus === "Activo" ? p.estado : !p.estado);
    return matchSearch && matchStatus;
  });
  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const getStatusBadge = (estado) => {
    // Lógica simple para badge
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-gray-100 text-gray-700">
        {estado ? "Activo" : "Inactivo"}
      </span>
    );
  };

  const handleStatusToggle = (productId, currentStatus) => {
    const updatedProducts = productService.toggleStatus(productId);
    setProducts(updatedProducts);
    const product = updatedProducts.find((p) => p.id === productId);
    if (product) {
      const newStatus = product.estado ? "Activo" : "Inactivo";
      setNotification({
        message: `${product.nombre} ahora está ${newStatus}`,
        type: newStatus === "Activo" ? "success" : "warning",
        duration: 3000,
      });
    }
  };

  const handleViewDetail = (product) => {
    setDetailProduct(product);
  };

  // Componente Toggle/Switch
  const StatusToggle = ({ estado, productId }) => {
    const isActive = estado;
    return (
      <button
        onClick={() => handleStatusToggle(productId, estado)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${
          isActive
            ? "bg-emerald-500 shadow-md shadow-emerald-200"
            : "bg-gray-300 shadow-md shadow-gray-200"
        }`}
        role="switch"
        aria-checked={isActive}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
            isActive ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
        <span className="sr-only">{estado ? "Activo" : "Inactivo"}</span>
      </button>
    );
  };

  return (
    <div className="h-full flex flex-col p-6 font-sans text-gray-800 bg-white md:bg-transparent relative">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold">Productos</h1>
          <p className="text-xs text-gray-500">Inventario</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 bg-[#34D399] hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md text-sm font-medium"
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div className="flex gap-3 mb-4 flex-shrink-0">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
        >
          <option value="todos">Todos</option>
          <option value="Activo">Activos</option>
          <option value="Inactivo">Inactivos</option>
        </select>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-700 text-white sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 text-[11px] font-semibold">ID</th>
                <th className="py-3 px-4 text-[11px] font-semibold">Nombre</th>
                <th className="py-3 px-4 text-[11px] font-semibold">
                  Categoría
                </th>
                <th className="py-3 px-4 text-[11px] text-center font-semibold">
                  Stock
                </th>
                <th className="py-3 px-4 text-[11px] text-right font-semibold">
                  Precio
                </th>
                <th className="py-3 px-4 text-[11px] text-center font-semibold">
                  Estado
                </th>
                <th className="py-3 px-4 text-[11px] text-center font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length > 0 ? (
                currentItems.map((prod) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-emerald-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-xs font-medium text-gray-900">
                      {prod.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-emerald-500" />
                        <span className="text-xs font-semibold text-gray-900">
                          {prod.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {prod.categoria}
                    </td>
                    <td className="py-3 px-4 text-xs text-center font-semibold text-gray-900">
                      {prod.stock}
                    </td>
                    <td className="py-3 px-4 text-xs text-right font-semibold text-emerald-600">
                      $ {prod.precio}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusToggle estado={prod.estado} productId={prod.id} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(prod)}
                          className="p-2 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(prod)}
                          className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(prod)}
                          className="p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 px-4 text-center">
                    <p className="text-gray-400 text-sm">
                      No hay productos que coincidan con los filtros aplicados
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Paginación simple igual que antes... */}
        <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
          <span className="text-[10px] text-gray-500">Pág {currentPage}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              disabled={currentPage === 1}
              className="p-1 border rounded bg-white disabled:opacity-50"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border rounded bg-white disabled:opacity-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
      />

      {notification && (
        <StatusNotification
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Modal de Detalle del Producto */}
      {detailProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 px-6 py-5 flex items-center justify-between border-b border-emerald-100 bg-emerald-50">
              <div>
                <h2 className="text-lg font-semibold text-emerald-900">
                  Detalle del Producto
                </h2>
              </div>
              <button
                onClick={() => setDetailProduct(null)}
                className="p-1 hover:bg-emerald-100 rounded-lg transition-colors text-emerald-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    ID
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {detailProduct.id}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    Nombre
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {detailProduct.nombre}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    Categoría
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {detailProduct.categoria}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    Tipo de Producto
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {detailProduct.tipoProducto}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    Stock
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {detailProduct.stock}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    Precio
                  </label>
                  <p className="text-sm text-emerald-600 font-bold">
                    $ {detailProduct.precio}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase">
                    Estado
                  </label>
                  <p className="text-sm text-gray-900 font-medium">
                    {detailProduct.estado}
                  </p>
                </div>
              </div>

              {/* Si es medicamento, mostrar más detalles */}
              {detailProduct.tipoProducto === "Medicamento" && (
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-semibold text-gray-800">
                    Información del Medicamento
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {detailProduct.presentacion && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">
                          Presentación
                        </label>
                        <p className="text-sm text-gray-900">
                          {detailProduct.presentacion}
                        </p>
                      </div>
                    )}
                    {detailProduct.viaAdministracion && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">
                          Vía de Administración
                        </label>
                        <p className="text-sm text-gray-900">
                          {detailProduct.viaAdministracion}
                        </p>
                      </div>
                    )}
                    {detailProduct.concentracion && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">
                          Concentración
                        </label>
                        <p className="text-sm text-gray-900">
                          {detailProduct.concentracion}
                        </p>
                      </div>
                    )}
                    {detailProduct.composicion && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">
                          Composición
                        </label>
                        <p className="text-sm text-gray-900">
                          {detailProduct.composicion}
                        </p>
                      </div>
                    )}
                    {detailProduct.registroSanitario && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">
                          Registro Sanitario
                        </label>
                        <p className="text-sm text-gray-900">
                          {detailProduct.registroSanitario}
                        </p>
                      </div>
                    )}
                    {detailProduct.requiereFormula !== undefined && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">
                          Requiere Fórmula
                        </label>
                        <p className="text-sm text-gray-900">
                          {detailProduct.requiereFormula ? "Sí" : "No"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setDetailProduct(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setDetailProduct(null);
                  handleEdit(detailProduct);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            {/* Header */}
            <div className="px-6 py-5 border-b border-red-100 flex items-center justify-between bg-red-50">
              <h2 className="text-lg font-semibold text-red-900">
                Confirmar Eliminación
              </h2>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="p-1 hover:bg-red-100 rounded-lg transition-colors text-red-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              <p className="text-gray-700 text-sm">
                ¿Estás seguro de que deseas eliminar el producto{" "}
                <strong>"{showDeleteConfirm.nombre}"</strong>? Esta acción no se
                puede deshacer.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const updatedProducts = productService.delete(
                    showDeleteConfirm.id,
                  );
                  setProducts(updatedProducts);
                  setNotification({
                    message: `${showDeleteConfirm.nombre} eliminado correctamente`,
                    type: "success",
                    duration: 3000,
                  });
                  setShowDeleteConfirm(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductsPage;
