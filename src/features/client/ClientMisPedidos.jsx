import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Eye,
  FileText,
  ShoppingBag,
  DollarSign,
  Search,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { ordersService } from "../sales/orders/services/ordersService";
import { LS, read } from "../../shared/services/lsService";

/**
 * ClientMisPedidos - Vista de pedidos para clientes
 * Resumen + Filtros + Lista de Pedidos con acciones
 */
export const ClientMisPedidos = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // desc = reciente a antiguo, asc = antiguo a reciente
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Cargar datos al montar
  useEffect(() => {
    // Obtener datos del usuario actual
    const currentUser = read(LS.USER) || {};
    const userEmail = currentUser.email;
    const userDocumento = currentUser.documento;

    // Obtener pedidos del servicio
    const allOrders = ordersService.getAll();
    
    // Filtrar pedidos solo del usuario actual (por email o documento)
    const userOrders = allOrders.filter(
      (order) =>
        order.correo === userEmail ||
        order.email === userEmail ||
        order.documento === userDocumento ||
        order.cliente === currentUser.nombre
    );
    
    setOrders(userOrders);
    applyFiltersAndSort(userOrders, "Todos", "", "desc");
  }, []);

  // Aplicar filtros, búsqueda y ordenamiento
  const applyFiltersAndSort = (ordersToFilter, status, search, order) => {
    let result = ordersToFilter;

    // Filtro por estado
    if (status === "En Proceso") {
      result = result.filter(
        (o) =>
          o.estado.toLowerCase() === "en proceso" ||
          o.estado.toLowerCase() === "pendiente",
      );
    } else if (status === "Entregados") {
      result = result.filter(
        (o) =>
          o.estado.toLowerCase() === "entregado" ||
          o.estado.toLowerCase() === "pagado",
      );
    }

    // Filtro por búsqueda (ID o productos)
    if (search.trim() !== "") {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(searchLower) ||
          o.productos.some((p) => p.nombre.toLowerCase().includes(searchLower)),
      );
    }

    // Ordenamiento por fecha
    result.sort((a, b) => {
      const dateA = new Date(a.fecha);
      const dateB = new Date(b.fecha);
      return order === "desc" ? dateB - dateA : dateA - dateB;
    });

    setFilteredOrders(result);
  };

  // Manejar cambio de filtro de estado
  const handleFilterStatus = (status) => {
    setFilterStatus(status);
    applyFiltersAndSort(orders, status, searchTerm, sortOrder);
  };

  // Manejar búsqueda
  const handleSearch = (value) => {
    setSearchTerm(value);
    applyFiltersAndSort(orders, filterStatus, value, sortOrder);
  };

  // Manejar ordenamiento
  const handleToggleSort = () => {
    const newOrder = sortOrder === "desc" ? "asc" : "desc";
    setSortOrder(newOrder);
    applyFiltersAndSort(orders, filterStatus, searchTerm, newOrder);
  };

  // Calcular resumen
  const totalPedidos = orders.length;
  const totalGastado = orders
    .filter(
      (o) =>
        o.estado.toLowerCase() === "entregado" ||
        o.estado.toLowerCase() === "pagado",
    )
    .reduce((sum, o) => sum + o.total, 0);

  // Icono y color según estado
  const getStatusIcon = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "entregado" || statusLower === "pagado") {
      return <CheckCircle className="text-green-500" size={20} />;
    }
    return <Clock className="text-amber-500" size={20} />;
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "entregado" || statusLower === "pagado") {
      return "bg-green-50 text-green-700 border-green-200";
    }
    if (statusLower === "en proceso") {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
  };

  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleViewInvoice = (order) => {
    // Generar factura simple - podría mejorarse con librería como pdfkit
    if (!isInvoiceEnabled(order.estado)) return;
    
    const invoiceContent = `
FACTURA DE COMPRA
=====================================
ID Pedido: ${order.id}
Fecha: ${new Date(order.fecha).toLocaleDateString()}
Cliente: ${order.cliente}
Documento: ${order.documento}

PRODUCTOS:
${order.productos.map((p) => `  - ${p.nombre}: ${p.cantidad} x $${p.precio.toFixed(2)} = $${(p.cantidad * p.precio).toFixed(2)}`).join("\n")}

-------------------------------------
TOTAL: $${order.total.toFixed(2)}
Método de Pago: ${order.metodoPago || "No especificado"}
Estado: ${order.estado}
=====================================
    `;
    
    // Descargar como archivo de texto
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(invoiceContent));
    element.setAttribute("download", `Factura_${order.id}.txt`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const isInvoiceEnabled = (status) => {
    const statusLower = status.toLowerCase();
    return statusLower === "entregado" || statusLower === "pagado";
  };

  return (
    <div className="h-full flex flex-col gap-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
        <p className="text-gray-500 text-sm mt-1">
          Visualiza y gestiona todos tus pedidos
        </p>
      </div>

      {/* Contenedor con fondo gris claro */}
      <div className="flex-1 bg-gray-50 rounded-xl p-6 space-y-6 overflow-y-auto">
        {/* Sección Resumen */}
        <div className="grid grid-cols-2 gap-4">
          {/* Tarjeta: Total de Pedidos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingBag className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Pedidos</p>
              <p className="text-3xl font-bold text-gray-900">{totalPedidos}</p>
            </div>
          </div>

          {/* Tarjeta: Total Gastado (Entregados/Pagados) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Gastado</p>
              <p className="text-3xl font-bold text-green-600">
                ${totalGastado.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Buscador y Filtros en una fila */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por ID de pedido o producto..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            />
          </div>

          {/* Filtros de Estado y Ordenamiento */}
          <div className="flex gap-2 flex-wrap items-center">
            {/* Botones de Estado */}
            <div className="flex gap-2">
              {["Todos", "En Proceso", "Entregados"].map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterStatus(status)}
                  className={`px-4 py-1.5 rounded-full font-semibold text-sm transition-all ${
                    filterStatus === status
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Botón de Ordenamiento */}
            <button
              onClick={handleToggleSort}
              className="ml-auto px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-semibold text-sm flex items-center gap-2 transition-all"
              title={`Ordenar por fecha ${sortOrder === "desc" ? "más antiguo primero" : "más reciente primero"}`}
            >
              {sortOrder === "desc" ? (
                <>
                  <ArrowDown size={16} />
                  Reciente
                </>
              ) : (
                <>
                  <ArrowUp size={16} />
                  Antiguo
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <ShoppingBag className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 font-medium">
                {searchTerm
                  ? "No encontramos pedidos que coincidan con tu búsqueda"
                  : "No hay pedidos en este estado"}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {searchTerm
                  ? "Intenta con otro término de búsqueda"
                  : "Cuando realices nuevos pedidos, aparecerán aquí"}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                {/* Grid Principal */}
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Icono de Estado */}
                  <div className="col-span-1 flex justify-center">
                    {getStatusIcon(order.estado)}
                  </div>

                  {/* ID y Fecha */}
                  <div className="col-span-2">
                    <p className="text-sm font-bold text-gray-900">
                      {order.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.fecha).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Resumen de Productos */}
                  <div className="col-span-4">
                    <p className="text-sm font-medium text-gray-700">
                      {order.productos.length} producto
                      {order.productos.length > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Total: ${order.total.toFixed(2)}
                    </p>
                  </div>

                  {/* Estado Badge */}
                  <div className="col-span-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        order.estado,
                      )}`}
                    >
                      {order.estado}
                    </span>
                  </div>

                  {/* Precio Total en Verde Negrita */}
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-medium text-gray-600">Total</p>
                    <p className="text-lg font-bold text-blue-600">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>

                  {/* Botones de Acción */}
                  <div className="col-span-1 flex gap-2 justify-end">
                    {/* Ver Detalle */}
                    <button
                      onClick={() => handleViewDetail(order)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                      title="Ver detalle"
                    >
                      <Eye size={16} />
                    </button>

                    {/* Factura - Deshabilitado si no está entregado/pagado */}
                    <button
                      onClick={() => handleViewInvoice(order)}
                      disabled={!isInvoiceEnabled(order.estado)}
                      className={`p-2 rounded-lg transition-colors ${
                        isInvoiceEnabled(order.estado)
                          ? "bg-green-100 hover:bg-green-200 text-green-600 cursor-pointer"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                      title={
                        isInvoiceEnabled(order.estado)
                          ? "Descargar factura"
                          : "Factura disponible cuando sea entregado"
                      }
                    >
                      <FileText size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Detalle del Pedido */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-green-50 border-b border-green-200 p-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedOrder.id}</h2>
                <p className="text-green-600 text-sm font-medium">
                  {new Date(selectedOrder.fecha).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Contenido */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Información General */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase">Cliente</p>
                  <p className="text-gray-900 font-semibold text-sm">{selectedOrder.cliente}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase">Documento</p>
                  <p className="text-gray-900 font-semibold text-sm">{selectedOrder.documento}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase">Correo</p>
                  <p className="text-gray-900 font-semibold text-sm">{selectedOrder.correo || selectedOrder.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-medium uppercase">Método de Pago</p>
                  <p className="text-gray-900 font-semibold text-sm">{selectedOrder.metodoPago}</p>
                </div>
              </div>

              {/* Estado */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium text-sm">Estado:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedOrder.estado)}`}>
                    {selectedOrder.estado}
                  </span>
                </div>
              </div>

              {/* Productos */}
              <div className="border-t border-gray-200 pt-3">
                <h3 className="font-bold text-base text-gray-900 mb-3">Productos ({selectedOrder.productos.length})</h3>
                <div className="space-y-2">
                  {selectedOrder.productos.map((product, idx) => (
                    <div key={idx} className="flex justify-between items-start p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{product.nombre}</p>
                        <p className="text-xs text-gray-500">Cant: {product.cantidad}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">
                          ${(product.cantidad * product.precio).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${product.precio.toFixed(2)}/u
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center bg-green-50 border border-green-200 p-3 rounded">
                  <span className="text-base font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${selectedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Notas */}
              {selectedOrder.notas && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-gray-500 text-xs font-medium uppercase mb-2">Notas</p>
                  <p className="text-gray-700 bg-gray-50 p-2 rounded text-sm">{selectedOrder.notas}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {isInvoiceEnabled(selectedOrder.estado) && (
              <div className="bg-gray-50 border-t border-gray-200 p-4">
                <button
                  onClick={() => {
                    handleViewInvoice(selectedOrder);
                    setShowDetailModal(false);
                  }}
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <FileText size={16} />
                  Factura
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMisPedidos;
