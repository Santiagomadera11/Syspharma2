import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  X,
} from "lucide-react";
import { productService } from "../inventory/products/services/productService";

export const EmployeeProductos = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailProduct, setDetailProduct] = useState(null);
  const itemsPerPage = 6;

  // Cargar productos al montar el componente
  useEffect(() => {
    setProducts(productService.getAll());
    // Refrescar cada 2 segundos para sincronizar cambios
    const interval = setInterval(() => {
      setProducts(productService.getAll());
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleViewDetail = (product) => {
    setDetailProduct(product);
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "todos" || (filterStatus === "Activo" ? p.estado : !p.estado);
    return matchSearch && matchStatus;
  });
  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Badge de Estado (fijo, sin interacción)
  const StateBadge = ({ estado }) => {
    const isActive = estado;
    return (
      <span
        className={`inline-block px-3 py-1.5 rounded-full text-[10px] font-bold ${
          isActive
            ? "bg-emerald-100 text-emerald-700"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {estado ? "Activo" : "Inactivo"}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col p-6 font-sans text-gray-800 bg-white md:bg-transparent relative">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold">Productos</h1>
          <p className="text-xs text-gray-500">Catálogo disponible</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4 flex-shrink-0">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar productos..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="todos">Todos</option>
          <option value="Activo">Activos</option>
          <option value="Inactivo">Inactivos</option>
        </select>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-blue-700 text-white sticky top-0 z-10">
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
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length > 0 ? (
                currentItems.map((prod) => (
                  <tr
                    key={prod.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="py-3 px-4 text-xs font-medium text-gray-900">
                      {prod.id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-blue-500" />
                        <span className="text-xs font-semibold text-gray-900">
                          {prod.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {prod.categoria}
                    </td>
                    <td
                      className={`py-3 px-4 text-xs text-center font-semibold ${
                        prod.stock === 0
                          ? "bg-red-100 text-red-700 font-bold"
                          : "text-gray-900"
                      }`}
                    >
                      {prod.stock}
                    </td>
                    <td className="py-3 px-4 text-xs text-right font-semibold text-blue-600">
                      $ {prod.precio}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StateBadge estado={prod.estado} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleViewDetail(prod)}
                          className="p-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Ver detalle"
                        >
                          <Eye size={16} />
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

        {/* Paginación */}
        <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-200 flex justify-between items-center flex-shrink-0">
          <span className="text-[10px] text-gray-500">Pág {currentPage}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              disabled={currentPage === 1}
              className="p-1 border rounded bg-white disabled:opacity-50 hover:bg-blue-50"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              disabled={currentPage === totalPages}
              className="p-1 border rounded bg-white disabled:opacity-50 hover:bg-blue-50"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Detalle del Producto */}
      {detailProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 px-6 py-5 flex items-center justify-between border-b border-blue-100 bg-blue-50">
              <div>
                <h2 className="text-lg font-semibold text-blue-900">
                  Detalle del Producto
                </h2>
              </div>
              <button
                onClick={() => setDetailProduct(null)}
                className="p-1 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
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
                    {detailProduct.tipoProducto || "N/A"}
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
                  <p className="text-sm text-blue-600 font-bold">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProductos;
