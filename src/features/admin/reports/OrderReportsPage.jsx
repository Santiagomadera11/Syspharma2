import React, { useState, useMemo } from "react";
import { Package, User, Globe, Filter, Download, Eye, TrendingUp } from "lucide-react";
import { ordersService } from "../../sales/orders/services/ordersService";

export const OrderReportsPage = () => {
  const [originFilter, setOriginFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const orders = useMemo(() => ordersService.getAll(), []);

  // Filtros
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchOrigin = originFilter === "Todos" || order.origin === originFilter;
      const matchStatus = statusFilter === "Todos" || order.estado === statusFilter;
      const matchSearch = searchTerm === "" || 
        order.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.userName?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchOrigin && matchStatus && matchSearch;
    });
  }, [orders, originFilter, statusFilter, searchTerm]);

  // Estadísticas
  const stats = useMemo(() => {
    const employeeOrders = orders.filter((o) => o.origin === "empleado");
    const webOrders = orders.filter((o) => o.origin === "web");
    const pendingValidation = orders.filter((o) => o.estado === "Pendientes de Validación");

    return {
      total: orders.length,
      empleado: employeeOrders.length,
      web: webOrders.length,
      empleadoRevenue: employeeOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      webRevenue: webOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      pendingValidation: pendingValidation.length,
    };
  }, [orders]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("es-CO");
  };

  const getOriginBadge = (origin) => {
    if (origin === "empleado") {
      return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-fit"><User size={12} /> Empleado</span>;
    }
    return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 w-fit"><Globe size={12} /> Web</span>;
  };

  const getStatusBadge = (estado) => {
    const colors = {
      "Pendiente": "bg-yellow-100 text-yellow-700",
      "En proceso": "bg-blue-100 text-blue-700",
      "Entregado": "bg-green-100 text-green-700",
      "Cancelado": "bg-red-100 text-red-700",
      "Pendientes de Validación": "bg-orange-100 text-orange-700",
    };

    return (
      <span className={`${colors[estado] || "bg-gray-100 text-gray-700"} px-2 py-1 rounded text-xs font-semibold`}>
        {estado}
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4 font-sans text-gray-800 p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reporte de Pedidos</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Análisis de órdenes por origen (empleado vs web) y estado
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          <Download size={16} />
          Descargar Excel
        </button>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Total Pedidos</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-2">{formatCurrency(stats.empleadoRevenue + stats.webRevenue)}</p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 bg-gradient-to-br from-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-semibold mb-1">De Empleados</p>
              <p className="text-2xl font-bold text-blue-700">{stats.empleado}</p>
              <p className="text-xs text-blue-600 mt-2">{formatCurrency(stats.empleadoRevenue)}</p>
            </div>
            <User className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-200 bg-gradient-to-br from-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-semibold mb-1">De Web</p>
              <p className="text-2xl font-bold text-purple-700">{stats.web}</p>
              <p className="text-xs text-purple-600 mt-2">{formatCurrency(stats.webRevenue)}</p>
            </div>
            <Globe className="text-purple-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200 bg-gradient-to-br from-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-semibold mb-1">Pendientes Validación</p>
              <p className="text-2xl font-bold text-orange-700">{stats.pendingValidation}</p>
            </div>
            <Filter className="text-orange-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 bg-gradient-to-br from-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-semibold mb-1">Tasa Empleado</p>
              <p className="text-2xl font-bold text-green-700">
                {stats.total > 0 ? ((stats.empleado / stats.total) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 flex-shrink-0 bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por cliente, pedido o empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <select
          value={originFilter}
          onChange={(e) => setOriginFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="Todos">Todos los Orígenes</option>
          <option value="empleado">Solo Empleados</option>
          <option value="web">Solo Web</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="Todos">Todos los Estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En proceso">En Proceso</option>
          <option value="Entregado">Entregado</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Pendientes de Validación">Pendientes de Validación</option>
        </select>
        {(searchTerm || originFilter !== "Todos" || statusFilter !== "Todos") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setOriginFilter("Todos");
              setStatusFilter("Todos");
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-semibold"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">ID Pedido</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">Cliente</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">Origen</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">Creado Por</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">Total</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">Estado</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">Fecha</th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-xs font-mono font-semibold text-gray-800">{order.id}</td>
                    <td className="py-3 px-4 text-xs text-gray-700">{order.cliente}</td>
                    <td className="py-3 px-4 text-xs">{getOriginBadge(order.origin || "web")}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">
                      {order.origin === "empleado" ? order.userName || "N/A" : order.creadoPor}
                    </td>
                    <td className="py-3 px-4 text-xs font-bold text-gray-800">{formatCurrency(order.total)}</td>
                    <td className="py-3 px-4 text-xs">{getStatusBadge(order.estado)}</td>
                    <td className="py-3 px-4 text-xs text-gray-600">{formatDate(order.fecha)}</td>
                    <td className="py-3 px-4 text-xs">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-semibold"
                      >
                        <Eye size={14} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-6 text-center text-gray-500 text-sm">
                    No hay pedidos con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALLE */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Detalles del Pedido {selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700 text-2xl">
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Información General */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3">Información General</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Cliente</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.cliente}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Documento</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.documento}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Origen</p>
                    <div className="mt-1">{getOriginBadge(selectedOrder.origin || "web")}</div>
                  </div>
                  <div>
                    <p className="text-gray-600">Estado</p>
                    <div className="mt-1">{getStatusBadge(selectedOrder.estado)}</div>
                  </div>
                </div>
              </div>

              {/* Información de Origen (si es empleado) */}
              {selectedOrder.origin === "empleado" && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <User size={18} />
                    Información del Empleado
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Empleado</span>
                      <span className="font-semibold text-blue-900">{selectedOrder.userName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">ID Usuario</span>
                      <span className="font-semibold text-blue-900">{selectedOrder.userId}</span>
                    </div>
                    {selectedOrder.turnId && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">ID Turno</span>
                        <span className="font-semibold text-blue-900">{selectedOrder.turnId}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Productos */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                  <Package size={18} />
                  Productos ({selectedOrder.productos.length})
                </h3>
                <div className="space-y-2 text-sm">
                  {selectedOrder.productos.map((prod, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-2 rounded">
                      <div>
                        <p className="font-semibold text-gray-800">{prod.nombre}</p>
                        <p className="text-xs text-gray-600">Cantidad: {prod.cantidad}</p>
                      </div>
                      <span className="font-bold text-purple-700">{formatCurrency(prod.precio * prod.cantidad)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumen Financiero */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-bold text-green-800 mb-3">Resumen Financiero</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700">Subtotal</span>
                    <span className="font-bold text-green-800">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                  {selectedOrder.metodoPago && (
                    <div className="flex justify-between items-center">
                      <span className="text-green-700">Método de Pago</span>
                      <span className="font-semibold text-green-800">{selectedOrder.metodoPago}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notas */}
              {selectedOrder.notas && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-2">Notas</h3>
                  <p className="text-sm text-gray-700">{selectedOrder.notas}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-semibold"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
