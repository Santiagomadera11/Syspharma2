import React, { useState } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { useCrud } from "../../shared/hooks/useCrud";

const INITIAL_PRODS = [
  {
    id: "PROD-001",
    nombre: "Amoxicilina 500mg",
    categoria: "Antibióticos",
    stock: 150,
    precio: 2500,
    estado: "Activo",
  },
  {
    id: "PROD-002",
    nombre: "Paracetamol 500mg",
    categoria: "Analgésicos",
    stock: 0,
    precio: 500,
    estado: "Activo",
  },
  {
    id: "PROD-003",
    nombre: "Ibuprofeno 200mg",
    categoria: "Analgésicos",
    stock: 45,
    precio: 800,
    estado: "Inactivo",
  },
];

export const EmployeeProductos = () => {
  const { items: products } = useCrud("sys_products", INITIAL_PRODS);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleViewDetail = (product) => {
    console.log("Ver detalle de:", product);
    // TODO: Abrir modal de detalle del producto (solo lectura)
  };

  const filtered = products.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Badge de Estado (fijo, sin interacción)
  const StateBadge = ({ estado }) => {
    const isActive = estado === "Activo";
    return (
      <span
        className={`inline-block px-3 py-1.5 rounded-full text-[10px] font-bold ${
          isActive
            ? "bg-emerald-100 text-emerald-700"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {estado}
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
              {currentItems.map((prod) => (
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
                    ₡ {prod.precio}
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
              ))}
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
    </div>
  );
};

export default EmployeeProductos;
