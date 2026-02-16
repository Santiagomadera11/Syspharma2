import React, { useState, useMemo } from "react";
import {
  User,
  TrendingUp,
  Award,
  Target,
  Calendar,
  Download,
  Eye,
  Star,
} from "lucide-react";
import { ordersService } from "../../sales/orders/services/ordersService";

export const SalesPerformanceReportsPage = () => {
  const [timeRange, setTimeRange] = useState("all");
  const [sortBy, setSortBy] = useState("revenue");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const orders = useMemo(() => ordersService.getAll(), []);

  // Filtrar por rango de tiempo
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    return orders.filter((order) => {
      if (order.origin !== "empleado") return false;

      const orderDate = new Date(order.fecha);

      if (timeRange === "week") return orderDate >= startOfWeek;
      if (timeRange === "month") return orderDate >= startOfMonth;
      return true;
    });
  }, [orders, timeRange]);

  // Agrupar por empleado
  const employeeStats = useMemo(() => {
    const stats = {};

    filteredOrders.forEach((order) => {
      const name = order.userName || "Desconocido";
      const userId = order.userId;

      if (!stats[userId]) {
        stats[userId] = {
          userId,
          name,
          totalOrders: 0,
          totalRevenue: 0,
          totalProductos: 0,
          totalServicios: 0,
          averageOrderValue: 0,
          orders: [],
        };
      }

      stats[userId].totalOrders++;
      stats[userId].totalRevenue += order.total || 0;
      stats[userId].orders.push(order);

      // Contar productos
      if (order.productos) {
        stats[userId].totalProductos += order.productos.length;
      }
      if (order.servicios) {
        stats[userId].totalServicios += order.servicios.length;
      }
    });

    // Calcular promedio
    Object.keys(stats).forEach((key) => {
      if (stats[key].totalOrders > 0) {
        stats[key].averageOrderValue =
          stats[key].totalRevenue / stats[key].totalOrders;
      }
    });

    // Convertir a array y ordenar
    let sorted = Object.values(stats);

    if (sortBy === "revenue") {
      sorted.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } else if (sortBy === "orders") {
      sorted.sort((a, b) => b.totalOrders - a.totalOrders);
    } else if (sortBy === "average") {
      sorted.sort((a, b) => b.averageOrderValue - a.averageOrderValue);
    }

    return sorted;
  }, [filteredOrders, sortBy]);

  // Estadísticas generales
  const generalStats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce(
      (sum, o) => sum + (o.total || 0),
      0,
    );
    const totalOrders = filteredOrders.length;
    const totalItems = filteredOrders.reduce(
      (sum, o) => sum + (o.productos?.length || 0) + (o.servicios?.length || 0),
      0,
    );

    return {
      totalRevenue,
      totalOrders,
      totalItems,
      averageOrder: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      totalEmployees: employeeStats.length,
    };
  }, [filteredOrders, employeeStats]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("es-CO");
  };

  return (
    <div className="h-full flex flex-col gap-4 font-sans text-gray-800 p-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Desempeño de Ventas
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Análisis individual de vendedores y empleados
          </p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          <Download size={16} />
          Descargar Excel
        </button>
      </div>

      {/* ESTADÍSTICAS GENERALES */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Total Ventas</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(generalStats.totalRevenue)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {generalStats.totalOrders} pedidos
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-200 bg-gradient-to-br from-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-semibold mb-1">
                Promedio por Pedido
              </p>
              <p className="text-2xl font-bold text-blue-700">
                {formatCurrency(generalStats.averageOrder)}
              </p>
            </div>
            <TrendingUp className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-200 bg-gradient-to-br from-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-semibold mb-1">
                Total Empleados
              </p>
              <p className="text-2xl font-bold text-purple-700">
                {generalStats.totalEmployees}
              </p>
            </div>
            <User className="text-purple-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200 bg-gradient-to-br from-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-semibold mb-1">
                Total Artículos
              </p>
              <p className="text-2xl font-bold text-green-700">
                {generalStats.totalItems}
              </p>
            </div>
            <Target className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-orange-200 bg-gradient-to-br from-orange-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-semibold mb-1">
                Ticket Promedio
              </p>
              <p className="text-2xl font-bold text-orange-700">
                {generalStats.totalOrders > 0
                  ? generalStats.totalItems / generalStats.totalOrders
                  : 0}{" "}
                items
              </p>
            </div>
            <Award className="text-orange-400" size={32} />
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="flex gap-3 flex-shrink-0 bg-white p-4 rounded-lg border border-gray-200">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 flex items-center gap-2"
        >
          <option value="all">Todos los Períodos</option>
          <option value="week">Esta Semana</option>
          <option value="month">Este Mes</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="revenue">Ordenar por Ingresos</option>
          <option value="orders">Ordenar por Cantidad de Pedidos</option>
          <option value="average">Ordenar por Ticket Promedio</option>
        </select>
      </div>

      {/* TABLA DE EMPLEADOS */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                  Empleado
                </th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase text-right">
                  Ingresos
                </th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase text-right">
                  Pedidos
                </th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase text-right">
                  Ticket Promedio
                </th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase text-right">
                  Productos
                </th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase text-right">
                  Servicios
                </th>
                <th className="py-3 px-4 text-xs font-bold text-gray-700 uppercase">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {employeeStats.length > 0 ? (
                employeeStats.map((emp, idx) => {
                  const revenuePercent =
                    (emp.totalRevenue / generalStats.totalRevenue) * 100;
                  return (
                    <tr
                      key={emp.userId}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-800">
                              {emp.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {emp.userId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="text-sm font-bold text-gray-800">
                          {formatCurrency(emp.totalRevenue)}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${revenuePercent}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-bold text-gray-800">
                        {emp.totalOrders}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-purple-700">
                        {formatCurrency(emp.averageOrderValue)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-bold text-green-700">
                        {emp.totalProductos}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-bold text-orange-700">
                        {emp.totalServicios}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded text-xs font-semibold"
                        >
                          <Eye size={14} />
                          Ver
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="py-6 text-center text-gray-500 text-sm"
                  >
                    No hay datos de ventas para el período seleccionado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALLE DEL EMPLEADO */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-lg font-bold text-blue-700">
                  {selectedEmployee.name[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedEmployee.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedEmployee.userId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Resumen del Empleado */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold">
                  Total Ingresos
                </p>
                <p className="text-lg font-bold text-blue-700 mt-1">
                  {formatCurrency(selectedEmployee.totalRevenue)}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <p className="text-xs text-purple-600 font-semibold">
                  Pedidos Realizados
                </p>
                <p className="text-lg font-bold text-purple-700 mt-1">
                  {selectedEmployee.totalOrders}
                </p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                <p className="text-xs text-orange-600 font-semibold">
                  Ticket Promedio
                </p>
                <p className="text-lg font-bold text-orange-700 mt-1">
                  {formatCurrency(selectedEmployee.averageOrderValue)}
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-green-600 font-semibold">
                  Promedio Artículos
                </p>
                <p className="text-lg font-bold text-green-700 mt-1">
                  {(selectedEmployee.totalProductos +
                    selectedEmployee.totalServicios) /
                    selectedEmployee.totalOrders || 0}
                </p>
              </div>
            </div>

            {/* Desglose de Productos vs Servicios */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <h3 className="font-bold text-emerald-800 mb-2">
                  Productos Vendidos
                </h3>
                <p className="text-3xl font-bold text-emerald-700">
                  {selectedEmployee.totalProductos}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="font-bold text-orange-800 mb-2">
                  Servicios Realizados
                </h3>
                <p className="text-3xl font-bold text-orange-700">
                  {selectedEmployee.totalServicios}
                </p>
              </div>
            </div>

            {/* Últimos Pedidos */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-3">
                Últimos Pedidos ({Math.min(5, selectedEmployee.orders.length)})
              </h3>
              <div className="space-y-2">
                {selectedEmployee.orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="bg-white p-3 rounded border border-gray-200 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {order.cliente}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(order.fecha)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.productos?.length || 0} productos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedEmployee(null)}
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
