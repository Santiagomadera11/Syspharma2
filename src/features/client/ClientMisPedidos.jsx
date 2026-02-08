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

  // Cargar datos al montar
  useEffect(() => {

    // Obtener pedidos del servicio
    const allOrders = ordersService.getAll();
    // Filtrar pedidos del usuario actual (opcional: si tienes email/documento en el usuario)
    setOrders(allOrders);
    applyFiltersAndSort(allOrders, "Todos", "", "desc");
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

  const handleViewDetail = () => {
    // TODO: Abrir modal de detalle del pedido
  };

  const handleViewInvoice = () => {
    // TODO: Generar o descargar factura
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
                      {order.cantidadProductos} producto
                      {order.cantidadProductos > 1 ? "s" : ""}
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
    </div>
  );
};

export default ClientMisPedidos;
