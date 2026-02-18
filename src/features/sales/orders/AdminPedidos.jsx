import React, { useState, useMemo } from "react";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Download,
  Edit,
  Trash2,
  Users,
  Package,
  DollarSign,
  Pencil,
  User,
  Globe,
  Filter,
  TrendingUp,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ordersService } from "./services/ordersService";
import { productService } from "../../inventory/products/services/productService";
import { inventoryService } from "../../inventory/services/inventoryService";
import { write, LS } from '../../../shared/services/lsService';
import { salesService } from "../services/salesService";
import { OrderDetailModal } from "./components/OrderDetailModal";
import { ToastNotification } from "../../../shared/ui/ToastNotification";

export const AdminPedidos = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState(ordersService.getAll());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [originFilter, setOriginFilter] = useState("Todos");
  const [employeeFilter, setEmployeeFilter] = useState("Todos");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [notification, setNotification] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [orderToChangeStatus, setOrderToChangeStatus] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [viewMode, setViewMode] = useState("activos"); // "activos" para Pendiente/En proceso, "historial" para Entregado/Cancelado
  const [tooltipOrderId, setTooltipOrderId] = useState(null);

  const itemsPerPage = 10;

  // Listen for order updates (e.g., from landing guest orders)
  React.useEffect(() => {
    const handleOrdersUpdated = () => {
      setOrders(ordersService.getAll());
    };

    window.addEventListener('syspharma_orders_updated', handleOrdersUpdated);
    window.addEventListener('storage', handleOrdersUpdated);
    return () => {
      window.removeEventListener('syspharma_orders_updated', handleOrdersUpdated);
      window.removeEventListener('storage', handleOrdersUpdated);
    };
  }, []);

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleStatusChange = (order) => {
    setOrderToChangeStatus(order);
    setIsStatusModalOpen(true);
  };

  // Función para completar pedido (cambiar a "Entregado", descontar stock y registrar venta)
  const handleCompleteOrder = (order) => {
    if (order.estado === "Pendiente" || order.estado === "En proceso") {
      // 🔴 PASO 1: Validar que hay stock disponible
      const itemsParaDescontar = order.productos.map(item => ({
        productId: item.id,
        cantidad: item.cantidad
      }));

      const validationResult = inventoryService.validateStockAvailable(itemsParaDescontar);
      if (!validationResult.isValid) {
        setNotification({
          message: `No hay stock disponible: ${validationResult.message}`,
          type: "error",
          zIndex: 1000,
        });
        return;
      }

      // 🔴 PASO 2: Descontar stock usando FEFO
      const descuentoResult = inventoryService.deductMultipleProductsFEFO(itemsParaDescontar);
      if (!descuentoResult.success) {
        setNotification({
          message: `Error al descontar stock: ${descuentoResult.message}`,
          type: "error",
          zIndex: 1000,
        });
        return;
      }

      // 🔴 PASO 3: Cambiar estado a Entregado
      ordersService.updateStatus(order.id, "Entregado");
      setOrders(ordersService.getAll());

      // 🔴 PASO 4: Registrar como venta
      const today = new Date().toLocaleDateString("es-CO");
      try {
        const salesKey = "syspharma_sales";
        const sales = JSON.parse(localStorage.getItem(salesKey) || "[]");
        const newSale = {
          id: order.id,
          cliente: order.cliente,
          productos: order.productos,
          total: order.total,
          metodoPago: order.metodoPago || "Efectivo",
          notas: `Pedido completado: ${order.id}`,
          pedidoId: order.id,
          fecha: today,
          hora: new Date().toLocaleTimeString("es-CO"),
        };
        sales.push(newSale);
        localStorage.setItem(salesKey, JSON.stringify(sales));
      } catch (error) {
        console.warn("Error registrando venta:", error);
      }

      setNotification({
        message: `✅ Pedido ${order.id} completado, stock descuentado (${itemsParaDescontar.reduce((sum, i) => sum + i.cantidad, 0)} unidades) y registrado como venta`,
        type: "success",
        zIndex: 1000,
      });
    }
  };

  // Función para verificar si un pedido es urgente
  const isUrgent = (order) => {
    if (order.estado !== "Pendiente") return false;
    const orderDate = new Date(order.fecha || Date.now());
    const now = new Date();
    const diffMinutes = (now - orderDate) / (1000 * 60);
    return diffMinutes > 20;
  };

  const confirmStatusChange = (newStatus) => {
    if (orderToChangeStatus) {
      const currentStatus = orderToChangeStatus.estado;

      // 🔴 Lógica de manejo de stock: SOLO cancelaciones y devoluciones
      if (newStatus === "Cancelado" && currentStatus !== "Cancelado") {
        // Cancelar desde cualquier estado: si fue entregado, devolver stock
        if (currentStatus === "Entregado") {
          const itemsADevolver = orderToChangeStatus.productos.map(item => ({
            productId: item.id,
            cantidad: item.cantidad
          }));
          
          const devolucionResult = inventoryService.deductMultipleProductsFEFO(itemsADevolver.map(i => ({
            ...i,
            cantidad: -i.cantidad // Cantidad negativa para devolución
          })));

          // Para devoluciones invertidas, usamos returnStock
          orderToChangeStatus.productos.forEach((item) => {
            if (item && item.id) {
              inventoryService.returnStock(item.id, item.cantidad || 0);
            }
          });
        }
      } else if (
        newStatus === "Pendiente" &&
        (currentStatus === "En proceso" || currentStatus === "Entregado")
      ) {
        // Devolver a Pendiente desde Entregado: devolver productos al stock
        if (currentStatus === "Entregado") {
          orderToChangeStatus.productos.forEach((item) => {
            if (item && item.id) {
              inventoryService.returnStock(item.id, item.cantidad || 0);
            }
          });
        }
      }

      ordersService.updateStatus(orderToChangeStatus.id, newStatus);
      setOrders(ordersService.getAll());
      setCurrentPage(0); // Resetear a la primera página para asegurar que se vea el cambio

      // Si el nuevo estado es "Entregado", crear registro en ventas
      if (newStatus === "Entregado") {
        // Verificar si ya existe una venta para este pedido
        const existingSales = salesService.getAll();
        const saleExists = existingSales.some(
          (sale) => sale.pedidoId === orderToChangeStatus.id,
        );

        if (!saleExists) {
          salesService.create({
            id: orderToChangeStatus.id, // Heredar el código del pedido (PED-003)
            cliente: orderToChangeStatus.cliente,
            productos: orderToChangeStatus.productos,
            total: orderToChangeStatus.total,
            metodoPago: orderToChangeStatus.metodoPago || "Efectivo",
            notas: `Pedido: ${orderToChangeStatus.id} | ${orderToChangeStatus.notas || ""}`,
            pedidoId: orderToChangeStatus.id, // Referencia al pedido original
            fecha: new Date().toLocaleDateString("es-CO"),
          });
        }
      }

      setNotification({
        message: `Estado del pedido ${orderToChangeStatus.id} actualizado a ${newStatus}`,
        type: "success",
        zIndex: 1000,
      });
    }
    setIsStatusModalOpen(false);
    setOrderToChangeStatus(null);
  };

  const handleDeleteOrder = (order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteOrder = () => {
    if (orderToDelete) {
      // Devolver productos al stock antes de eliminar
      orderToDelete.productos.forEach((item) => {
        if (item && item.id) {
          const currentProduct = productService.getById(item.id);
          if (currentProduct) {
            productService.update(item.id, {
              stock: currentProduct.stock + (item.cantidad || 0),
            });
          }
        }
      });

      ordersService.delete(orderToDelete.id);
      setOrders(ordersService.getAll());
      setNotification({
        message: `Pedido ${orderToDelete.id} eliminado correctamente`,
        type: "success",
        zIndex: 1000,
      });
    }
    setIsDeleteModalOpen(false);
    setOrderToDelete(null);
  };

  const handleEditOrder = (order) => {
    // Guardar datos del pedido en localStorage para que CreateOrderPage los cargue
    localStorage.setItem(
      "syspharma_edit_order",
      JSON.stringify({
        id: order.id,
        cliente: order.cliente,
        documento: order.documento,
        telefono: order.telefono || "",
        correo: order.correo || "",
        metodoPago: order.metodoPago || "Efectivo",
        productos: order.productos,
        productosOriginales: [...order.productos], // Copia de productos originales para manejar stock
      }),
    );

    // Limpiar carrito actual y navegar
    try {
      write(LS.CART, []);
    } catch (e) {
      localStorage.removeItem("syspharma_cart");
      try { window.dispatchEvent(new Event('syspharma_cart_updated')); } catch (e) {}
    }
    navigate("/admin/pedidos/crear");
  };

  const exportToExcel = () => {
    // Simulación de exportación a Excel
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Código,Cliente,Documento,Fecha,Productos,Total,Estado\\n" +
      filteredOrders
        .map(
          (order) =>
            `${order.id},${order.cliente},${order.documento},${order.fecha},${order.cantidadProductos},${order.total},${order.estado}`,
        )
        .join("\\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pedidos_syspharma.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setNotification({
      message: "Datos exportados correctamente",
      type: "success",
      zIndex: 1000,
    });
  };

  // Estadísticas para los cards
  const stats = useMemo(() => {
    const total = orders.length;
    const pendientes = orders.filter((o) => o.estado === "Pendiente" || o.estado === "Pendientes de Validación").length;
    const entregados = orders.filter((o) => o.estado === "Entregado").length;
    const totalCartera = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Estadísticas de origen (De Análisis de Pedidos)
    const employeeOrders = orders.filter((o) => o.origin === "empleado");
    const webOrders = orders.filter((o) => o.origin === "web");
    const pendingValidation = orders.filter((o) => o.estado === "Pendientes de Validación");
    const employeeRevenue = employeeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const webRevenue = webOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // Pedidos de hoy
    const today = new Date().toISOString().split("T")[0];
    const pedidosHoy = orders.filter((o) => o.fecha === today).length;

    return {
      total,
      pendientes,
      entregados,
      totalCartera,
      employeeCount: employeeOrders.length,
      webCount: webOrders.length,
      employeeRevenue,
      webRevenue,
      pendingValidationCount: pendingValidation.length,
      pedidosHoy,
    };
  }, [orders]);

  // Filtrado
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filtro de búsqueda
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        order.id.toLowerCase().includes(searchLower) ||
        order.cliente.toLowerCase().includes(searchLower) ||
        order.documento.includes(searchLower) ||
        order.userName?.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // Filtro de estado
      if (statusFilter !== "Todos" && order.estado !== statusFilter) {
        return false;
      }

      // Filtro de origen (empleado vs web)
      if (originFilter !== "Todos" && order.origin !== originFilter) {
        return false;
      }

      // Filtro de empleado (simulado - en una implementación real vendría de los datos)
      if (employeeFilter !== "Todos") {
        // Aquí iría la lógica para filtrar por empleado
        // Por ahora, simulamos con algunos empleados
        const employeeMap = {
          "Juan Pérez": "Empleado 1",
          "María García": "Empleado 2",
          "Carlos López": "Empleado 3",
        };
        const orderEmployee = employeeMap[order.cliente] || "Empleado 1";
        if (orderEmployee !== employeeFilter) return false;
      }

      // Filtro de fecha
      if (startDate || endDate) {
        const orderDate = new Date(order.fecha);
        if (startDate && orderDate < new Date(startDate)) return false;
        if (endDate && orderDate > new Date(endDate)) return false;
      }

      return true;
    });
  }, [orders, searchTerm, statusFilter, originFilter, employeeFilter, startDate, endDate]);

  // Paginación
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const displayedOrders = filteredOrders.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  // Helper para formato moneda
  const formatCurrency = (val) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);

  // Helper para color de estado
  const getStatusColor = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "bg-yellow-100 text-yellow-700";
      case "Pendientes de Validación":
        return "bg-orange-100 text-orange-700";
      case "En proceso":
        return "bg-blue-100 text-blue-700";
      case "Entregado":
        return "bg-green-100 text-green-700";
      case "Cancelado":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Helper para badge de origen (mejorado)
  const getOriginBadge = (origin) => {
    if (origin === "empleado") {
      return (
        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit shadow-sm border border-blue-600">
          <User size={12} /> Empleado
        </span>
      );
    }
    return (
      <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit shadow-sm border border-purple-600">
        <Globe size={12} /> Web
      </span>
    );
  };

  return (
    <div className="h-full flex flex-col gap-4 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Gestión de Pedidos
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Control administrativo completo de todos los pedidos del sistema
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/pedidos/crear")}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm text-xs flex items-center gap-2 transition-all"
        >
          <Plus size={16} />
          Crear pedido
        </button>
      </div>

      {/* Cards de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 flex-shrink-0">
        {/* Total Pedidos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs text-gray-500 font-medium mb-1">Total Pedidos</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-2">
            {formatCurrency(stats.totalCartera)}
          </p>
        </div>

        {/* De Empleados */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-200 bg-gradient-to-br from-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-semibold mb-1">De Empleados</p>
              <p className="text-2xl font-bold text-blue-700">{stats.employeeCount}</p>
              <p className="text-xs text-blue-600 mt-2">
                {formatCurrency(stats.employeeRevenue)}
              </p>
            </div>
            <User className="text-blue-400" size={32} />
          </div>
        </div>

        {/* De Web */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 bg-gradient-to-br from-purple-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-purple-600 font-semibold mb-1">De Web</p>
              <p className="text-2xl font-bold text-purple-700">{stats.webCount}</p>
              <p className="text-xs text-purple-600 mt-2">
                {formatCurrency(stats.webRevenue)}
              </p>
            </div>
            <Globe className="text-purple-400" size={32} />
          </div>
        </div>

        {/* Pendientes Validación */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 bg-gradient-to-br from-orange-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-600 font-semibold mb-1">Pendientes Validación</p>
              <p className="text-2xl font-bold text-orange-700">{stats.pendingValidationCount}</p>
            </div>
            <Filter className="text-orange-400" size={32} />
          </div>
        </div>

        {/* Pedidos de Hoy */}
        <div className="bg-white rounded-xl shadow-sm border border-indigo-200 bg-gradient-to-br from-indigo-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-indigo-600 font-semibold mb-1">Pedidos de Hoy</p>
              <p className="text-2xl font-bold text-indigo-700">{stats.pedidosHoy}</p>
            </div>
            <Calendar className="text-indigo-400" size={32} />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-shrink-0 flex-wrap">
        {/* Búsqueda */}
        <div className="flex-1 min-w-[250px] relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar por código, nombre del cliente, documento, etc"
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300 text-xs bg-white"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
          />
        </div>

        {/* Filtro Estado */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(0);
          }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-300"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En proceso">En proceso</option>
          <option value="Entregado">Entregado</option>
          <option value="Cancelado">Cancelado</option>
          <option value="Pendientes de Validación">Pendientes de Validación</option>
        </select>

        {/* Filtro Origen (Empleado vs Web) */}
        <select
          value={originFilter}
          onChange={(e) => {
            setOriginFilter(e.target.value);
            setCurrentPage(0);
          }}
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-300"
        >
          <option value="Todos">Todos los Orígenes</option>
          <option value="empleado">Solo Empleados</option>
          <option value="web">Solo Web</option>
        </select>

        {/* Filtro Empleado */}
        <div className="relative">
          <Users
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
          <select
            value={employeeFilter}
            onChange={(e) => {
              setEmployeeFilter(e.target.value);
              setCurrentPage(0);
            }}
            className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-emerald-300"
          >
            <option value="Todos">Todos los empleados</option>
            <option value="Empleado 1">Empleado 1</option>
            <option value="Empleado 2">Empleado 2</option>
            <option value="Empleado 3">Empleado 3</option>
          </select>
        </div>

        {/* Filtro Fecha - Rango */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Calendar size={16} className="text-gray-400" />
          <input
            type="date"
            placeholder="Desde"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(0);
            }}
            className="text-xs focus:outline-none w-32 bg-transparent"
          />
          <span className="text-gray-300">-</span>
          <input
            type="date"
            placeholder="Hasta"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(0);
            }}
            className="text-xs focus:outline-none w-32 bg-transparent"
          />
        </div>

        {/* Botón Exportar */}
        <button
          onClick={exportToExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg font-bold shadow-sm text-xs flex items-center gap-2 transition-all"
        >
          <Download size={14} />
          Exportar Excel
        </button>

        {/* Botón limpiar filtros */}
        {(searchTerm ||
          statusFilter !== "Todos" ||
          originFilter !== "Todos" ||
          employeeFilter !== "Todos" ||
          startDate ||
          endDate) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("Todos");
              setOriginFilter("Todos");
              setEmployeeFilter("Todos");
              setStartDate("");
              setEndDate("");
              setCurrentPage(0);
            }}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla de pedidos */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
        <div className="overflow-auto custom-scrollbar no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-emerald-600 text-white text-xs uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 font-semibold">Código</th>
                <th className="px-3 py-3 font-semibold">Cliente</th>
                <th className="px-3 py-3 font-semibold">Origen</th>
                <th className="px-3 py-3 font-semibold">Documento</th>
                <th className="px-3 py-3 font-semibold">Fecha</th>
                <th className="px-3 py-3 font-semibold text-center">
                  Productos
                </th>
                <th className="px-3 py-3 font-semibold text-right">Total</th>
                <th className="px-3 py-3 font-semibold text-center">Estado</th>
                <th className="px-3 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {displayedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-3 py-8 text-center text-gray-400"
                  >
                    No hay pedidos registrados
                  </td>
                </tr>
              ) : (
                displayedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isUrgent(order)
                        ? "border-l-4 border-l-orange-500 bg-orange-50/30"
                        : ""
                    }`}
                  >
                    <td className="px-3 py-2.5 text-xs font-mono font-semibold text-gray-700">
                      {order.id}
                    </td>
                    <td className="px-3 py-2.5 font-medium">{order.cliente}</td>
                    <td className="px-3 py-2.5 text-xs">
                      {getOriginBadge(order.origin || "web")}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">
                      {order.documento}
                    </td>
                    <td className="px-3 py-2.5 text-gray-600">
                      {new Date(order.fecha).toLocaleDateString("es-CO")}
                    </td>
                    <td className="px-3 py-2.5 text-center font-semibold relative">
                      <div
                        className="cursor-help inline-block"
                        onMouseEnter={() => setTooltipOrderId(order.id)}
                        onMouseLeave={() => setTooltipOrderId(null)}
                      >
                        {order.cantidadProductos}
                      </div>
                      {/* Tooltip */}
                      {tooltipOrderId === order.id && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 bg-gray-800 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap shadow-lg">
                          {order.productos && order.productos.length > 0 ? (
                            <div className="text-left">
                              {order.productos.map((prod, idx) => (
                                <div key={idx}>{prod.nombre}</div>
                              ))}
                            </div>
                          ) : (
                            "Sin productos"
                          )}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-bold text-emerald-600 text-right">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getStatusColor(
                          order.estado,
                        )}`}
                      >
                        {order.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(order)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded-md border border-blue-200"
                          title="Ver detalle"
                        >
                          <Eye size={14} />
                        </button>
                        {(order.estado === "Pendiente" || order.estado === "En proceso") && (
                          <button
                            onClick={() => handleCompleteOrder(order)}
                            className="bg-green-50 hover:bg-green-100 text-green-600 p-1.5 rounded-md border border-green-200"
                            title="Completar pedido"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {order.estado === "Pendiente" && (
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-600 p-1.5 rounded-md border border-amber-200"
                            title="Editar pedido"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusChange(order)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-1.5 rounded-md border border-emerald-200"
                          title="Cambiar estado"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-md border border-red-200"
                          title="Eliminar pedido"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {filteredOrders.length > 0 && (
          <div className="border-t border-gray-100 p-3 bg-gray-50 flex items-center justify-between flex-shrink-0">
            <span className="text-[10px] text-gray-500 font-medium">
              Mostrando página {currentPage + 1} de {totalPages} (
              {filteredOrders.length} pedidos)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => currentPage > 0 && setCurrentPage((p) => p - 1)}
                disabled={currentPage === 0}
                className="p-1 rounded bg-white border border-gray-200 disabled:opacity-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() =>
                  currentPage < totalPages - 1 && setCurrentPage((p) => p + 1)
                }
                disabled={currentPage === totalPages - 1}
                className="p-1 rounded bg-white border border-gray-200 disabled:opacity-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          zIndex={notification.zIndex}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Modal de Detalle */}
      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        order={selectedOrder}
      />

      {/* Modal de Cambio de Estado */}
      {isStatusModalOpen && orderToChangeStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Cambiar Estado del Pedido
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Pedido:{" "}
              <span className="font-semibold">{orderToChangeStatus.id}</span>
            </p>
            <div className="space-y-2 mb-6">
              {["Pendiente", "En proceso", "Entregado", "Cancelado"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => confirmStatusChange(status)}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                      orderToChangeStatus.estado === status
                        ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {status}
                  </button>
                ),
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteModalOpen && orderToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de que deseas eliminar el pedido{" "}
              <span className="font-semibold">{orderToDelete.id}</span>?
            </p>
            <p className="text-xs text-gray-500 mb-6">
              Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteOrder}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
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

export default AdminPedidos;
