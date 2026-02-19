import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import ProductModal from "./components/ProductFormModal";
import { productService } from "./services/productService";
import { permissionService } from "../../settings/permissionService";
import { categoryService } from "../categories/services/categoryService";
import { providerService } from "../providers/services/providerService";
import { StatusNotification } from "/src/shared/ui/StatusNotification";

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [notification, setNotification] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [productToToggle, setProductToToggle] = useState(null);
  const itemsPerPage = 5;

  // Cargar productos, categorías y proveedores al montar el componente
  useEffect(() => {
    setProducts(productService.getAll());
    setCategories(categoryService.getAll());
    setProviders(providerService.getAll());

    // Refrescar cada 1 segundo para sincronizar cambios de stock, categorías y proveedores
    const interval = setInterval(() => {
      const updatedProducts = productService.getAll();
      const updatedCategories = categoryService.getAll();
      const updatedProviders = providerService.getAll();
      setProducts(updatedProducts);
      setCategories(updatedCategories);
      setProviders(updatedProviders);
    }, 1000);

    // Escuchar eventos de cambio de categorías
    const handleCategoryChange = () => {
      setCategories(categoryService.getAll());
    };
    window.addEventListener("categories:changed", handleCategoryChange);
    window.addEventListener("products:changed", handleCategoryChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("categories:changed", handleCategoryChange);
      window.removeEventListener("products:changed", handleCategoryChange);
    };
  }, []);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("syspharma_user") || "{}");
  const canEdit = permissionService.hasPerm(user.rol, "inven.edit");
  const canDelete = permissionService.hasPerm(user.rol, "inven.delete");

  const handleCreate = () => {
    // Navegar internamente usando React Router (sin recarga completa)
    navigate("/admin/productos/nuevo");
  };
  const handleEdit = (item) => {
    // Guardar el producto a editar en localStorage y navegar
    localStorage.setItem("syspharma_editing_product", JSON.stringify(item));
    navigate("/admin/productos/nuevo");
  };
  const handleSave = (data) => {
    if (editingItem) {
      // Actualizar producto existente con los nuevos datos
      const updatedProduct = { ...editingItem, ...data };
      const updatedProducts = productService.update(updatedProduct);
      setProducts(updatedProducts);

      // Si el producto en detalle es el que se editó, actualizar también el detalle
      if (detailProduct && detailProduct.id === editingItem.id) {
        setDetailProduct(updatedProduct);
      }

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

    // Emitir evento de actualización de productos para ClientCatalogo
    window.dispatchEvent(new CustomEvent("syspharma_products_updated"));

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
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Reset to first page when search/filter or products change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, products.length]);

  // Clamp currentPage if totalPages decreased
  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages]);

  const getStatusBadge = (estado) => {
    // Lógica simple para badge
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-gray-100 text-gray-700">
        {estado ? "Activo" : "Inactivo"}
      </span>
    );
  };

  const handleStatusToggle = (product) => {
    setProductToToggle(product);
    setIsStatusConfirmOpen(true);
  };

  const confirmToggleStatus = () => {
    if (productToToggle) {
      const updatedProducts = productService.toggleStatus(productToToggle.id);
      setProducts(updatedProducts);
      const product = updatedProducts.find((p) => p.id === productToToggle.id);
      if (product) {
        const newStatus = product.estado ? "Activo" : "Inactivo";
        setNotification({
          message: `${product.nombre} ahora está ${newStatus}`,
          type: "success",
          duration: 3000,
        });

        // Actualizar detalle si está abierto
        if (detailProduct && detailProduct.id === productToToggle.id) {
          setDetailProduct(product);
        }
      }
      setIsStatusConfirmOpen(false);
      setProductToToggle(null);
    }
  };

  const handleViewDetail = (product) => {
    setDetailProduct(product);
  };

  // Componente Toggle/Switch
  const StatusToggle = ({ estado, product }) => {
    const isActive = estado;
    return (
      <button
        onClick={() => handleStatusToggle(product)}
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
    <div className="h-full flex flex-col p-3 sm:p-6 font-sans text-gray-800 bg-white md:bg-transparent relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3 flex-shrink-0">
        <div>
          <h1 className="text-lg sm:text-xl font-bold">Productos</h1>
          <p className="text-xs text-gray-500">Inventario</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 bg-[#34D399] hover:bg-emerald-500 text-white px-3 py-2 sm:py-1.5 rounded-md text-sm font-medium w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus size={16} /> Nuevo
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 flex-shrink-0">
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
          className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 w-full sm:w-auto"
        >
          <option value="todos">Todos</option>
          <option value="Activo">Activos</option>
          <option value="Inactivo">Inactivos</option>
        </select>
      </div>

      {/* VISTA TABLA EN DESKTOP */}
      <div className="hidden sm:flex flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex-col overflow-visible">
        <div className="flex-1">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-700 text-white sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 sm:px-4 text-[11px] font-semibold">
                  ID
                </th>
                <th className="py-3 px-3 sm:px-4 text-[11px] font-semibold">
                  Nombre
                </th>
                <th className="py-3 px-3 sm:px-4 text-[11px] font-semibold hidden md:table-cell">
                  Categoría
                </th>
                <th className="py-3 px-3 sm:px-4 text-[11px] text-center font-semibold">
                  Stock
                </th>
                <th className="py-3 px-3 sm:px-4 text-[11px] text-right font-semibold hidden lg:table-cell">
                  Precio
                </th>
                <th className="py-3 px-3 sm:px-4 text-[11px] text-center font-semibold">
                  Estado
                </th>
                <th className="py-3 px-3 sm:px-4 text-[11px] text-center font-semibold">
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
                    <td className="py-3 px-3 sm:px-4 text-xs font-medium text-gray-900">
                      {prod.id}
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-2">
                        <Package
                          size={14}
                          className="text-emerald-500 flex-shrink-0"
                        />
                        <span className="text-xs font-semibold text-gray-900 truncate">
                          {prod.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-xs text-gray-600 hidden md:table-cell">
                      {prod.categoria}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-xs text-center font-semibold text-gray-900">
                      {prod.stock}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-xs text-right font-semibold text-emerald-600 hidden lg:table-cell">
                      $ {prod.precio}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center">
                      <StatusToggle estado={prod.estado} product={prod} />
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => handleViewDetail(prod)}
                          className="p-1.5 sm:p-2 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={14} />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(prod)}
                            className="p-1.5 sm:p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Editar"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setShowDeleteConfirm(prod)}
                            className="p-1.5 sm:p-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
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
        {/* Paginación con números */}
        <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <div className="text-[10px] text-gray-500">Pág {currentPage} de {totalPages || 1}</div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              disabled={currentPage === 1}
              className="p-1 border rounded bg-white disabled:opacity-50"
              aria-label="Página anterior"
            >
              <ChevronLeft size={14} />
            </button>

            <div className="hidden md:flex gap-1">
              {pages.map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-2 py-0.5 text-xs rounded ${
                    p === currentPage
                      ? "bg-emerald-600 text-white"
                      : "bg-white border border-gray-200"
                  }`}
                  aria-current={p === currentPage}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border rounded bg-white disabled:opacity-50"
              aria-label="Página siguiente"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* VISTA TARJETAS EN MÓVIL */}
      <div className="sm:hidden flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar">
        {currentItems.length > 0 ? (
          currentItems.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <Package
                    size={18}
                    className="text-emerald-500 flex-shrink-0 mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {prod.nombre}
                    </p>
                    <p className="text-xs text-gray-600">ID: {prod.id}</p>
                  </div>
                </div>
                <StatusToggle estado={prod.estado} product={prod} />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500 font-medium">Categoría</p>
                  <p className="text-gray-900 font-semibold">
                    {prod.categoria}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Stock</p>
                  <p className="text-gray-900 font-semibold">{prod.stock}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 font-medium">Precio</p>
                  <p className="text-emerald-600 font-bold">$ {prod.precio}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleViewDetail(prod)}
                  className="flex-1 py-2 px-3 rounded-lg border border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-colors text-xs font-medium"
                >
                  Ver
                </button>
                <button
                  onClick={() => handleEdit(prod)}
                  className="flex-1 py-2 px-3 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors text-xs font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(prod)}
                  className="flex-1 py-2 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-xs font-medium"
                >
                  Borrar
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-sm">
              No hay productos que coincidan
            </p>
          </div>
        )}

        {/* Paginación Móvil */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2 flex justify-between items-center flex-shrink-0 sticky bottom-0">
          <span className="text-[10px] text-gray-500">Pág {currentPage}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              disabled={currentPage === 1}
              className="p-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border rounded bg-white disabled:opacity-50 hover:bg-gray-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingItem}
        categories={categories}
        providers={providers}
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
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] shadow-2xl flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-emerald-100 bg-emerald-50 flex-shrink-0">
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
            <div className="flex-1 p-4 sm:p-6 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                {/* Imagen del Producto */}
                {detailProduct.imagen && (
                  <div className="md:col-span-1 flex items-start justify-center">
                    <div className="w-full h-48 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                      <img
                        src={detailProduct.imagen}
                        alt={detailProduct.nombre}
                        className="max-w-full max-h-full object-contain p-2"
                      />
                    </div>
                  </div>
                )}

                {/* Grid de Detalles */}
                <div className={`${detailProduct.imagen ? "md:col-span-2" : "md:col-span-3"} grid grid-cols-2 gap-2 sm:gap-3 text-sm overflow-y-auto`}>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase block">ID</label>
                  <p className="text-xs text-gray-900 font-medium truncate">{detailProduct.id}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase block">Nombre</label>
                  <p className="text-xs text-gray-900 font-medium line-clamp-2">{detailProduct.nombre}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase block">Categoría</label>
                  <p className="text-xs text-gray-900 font-medium truncate">{detailProduct.categoria}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase block">Tipo</label>
                  <p className="text-xs text-gray-900 font-medium truncate">{detailProduct.tipoProducto}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase block">Stock</label>
                  <p className="text-xs text-gray-900 font-bold">{detailProduct.stock}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase block">Precio</label>
                  {detailProduct.enOferta && detailProduct.porcentajeDescuento > 0 ? (
                    <div>
                      <p className="text-xs text-gray-500 line-through">$ {detailProduct.precio}</p>
                      <p className="text-xs text-emerald-600 font-bold">
                        ${Math.round(detailProduct.precio * (1 - detailProduct.porcentajeDescuento / 100))}
                        <span className="text-red-500 ml-1">-{detailProduct.porcentajeDescuento}%</span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 font-bold">$ {detailProduct.precio}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase block">Estado</label>
                  <p className="text-xs text-gray-900 font-medium">{detailProduct.estado ? "Activo" : "Inactivo"}</p>
                </div>

                {/* Si es medicamento, mostrar más detalles */}
                {detailProduct.tipoProducto === "Medicamento" && (
                  <>
                    <div className="col-span-2 border-t pt-2 mt-2">
                      <h3 className="font-semibold text-xs text-gray-800 uppercase mb-2">Información del Medicamento</h3>
                    </div>
                    {detailProduct.presentacion && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase block">Presentación</label>
                        <p className="text-xs text-gray-900 truncate">{detailProduct.presentacion}</p>
                      </div>
                    )}
                    {detailProduct.viaAdministracion && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase block">Vía Admin</label>
                        <p className="text-xs text-gray-900 truncate">{detailProduct.viaAdministracion}</p>
                      </div>
                    )}
                    {detailProduct.concentracion && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase block">Concentración</label>
                        <p className="text-xs text-gray-900 truncate">{detailProduct.concentracion}</p>
                      </div>
                    )}
                    {detailProduct.composicion && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase block">Composición</label>
                        <p className="text-xs text-gray-900 truncate">{detailProduct.composicion}</p>
                      </div>
                    )}
                    {detailProduct.registroSanitario && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase block">Registro Sanitario</label>
                        <p className="text-xs text-gray-900 truncate">{detailProduct.registroSanitario}</p>
                      </div>
                    )}
                    {detailProduct.requiereFormula !== undefined && (
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase block">Requiere Fórmula</label>
                        <p className="text-xs text-gray-900">{detailProduct.requiereFormula ? "Sí" : "No"}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end gap-2 flex-shrink-0">
              <button
                onClick={() => setDetailProduct(null)}
                className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            
            {/* Header */}
            <div className="bg-red-50 px-5 py-3 border-b border-red-200 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <AlertCircle size={18} className="text-red-600" />
                Eliminar Producto
              </h3>
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              <p className="text-sm text-gray-700">
                ¿Estás seguro de eliminar el producto <strong>"{showDeleteConfirm.nombre}"</strong>?
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Esta acción no se puede deshacer.
              </p>
            </div>

            {/* Footer */}
            <div className="bg-red-50 px-5 py-3 border-t border-red-200 flex justify-end gap-2">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  const updatedProducts = productService.delete(showDeleteConfirm.id);
                  setProducts(updatedProducts);
                  setNotification({
                    message: `${showDeleteConfirm.nombre} eliminado correctamente`,
                    type: "success",
                    duration: 3000,
                  });
                  setShowDeleteConfirm(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-1 shadow-sm"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Confirmation Modal */}
      {isStatusConfirmOpen && productToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            
            {/* Header */}
            <div className={`px-5 py-3 border-b flex justify-between items-center ${
              productToToggle.estado 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                {productToToggle.estado ? (
                  <AlertCircle size={18} className="text-red-600" />
                ) : (
                  <CheckCircle size={18} className="text-green-600" />
                )}
                {productToToggle.estado ? 'Desactivar Producto' : 'Activar Producto'}
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
                {productToToggle.estado 
                  ? `¿Desactivar el producto "${productToToggle.nombre}"?`
                  : `¿Activar el producto "${productToToggle.nombre}"?`
                }
              </p>
              {productToToggle.estado && (
                <p className="text-xs text-gray-500 mt-2">
                  El producto no será visible en el catálogo.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className={`px-5 py-3 border-t flex justify-end gap-2 ${
              productToToggle.estado 
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
                  productToToggle.estado
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {productToToggle.estado ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProductsPage;
