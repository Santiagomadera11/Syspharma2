import React, { useState, useMemo, useEffect } from "react";
import { Search, Plus, Trash2, ArrowLeft, Package } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { productService } from "../../inventory/products/services/productService";
import { read, write, LS } from "../../../shared/services/lsService";
import { ordersService } from "./services/ordersService";
import { ToastNotification } from "../../../shared/ui/ToastNotification";
import { getPaymentMethods } from "../../settings/services/parameterService";
import { authService } from "../../auth/authService";
import { salesService } from "../services/salesService";

export const CreateOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSale =
    location.pathname === "/admin/ventas/nueva" ||
    location.pathname === "/employee/ventas/nueva";
  const isEmployee = location.pathname.startsWith("/employee");
  const [products, setProducts] = useState(productService.getAll());
  const [searchTerm, setSearchTerm] = useState("");

  // Cargar productos y refrescar periódicamente
  useEffect(() => {
    const loadProducts = () => setProducts(productService.getAll());
    loadProducts();

    // Refrescar productos cada 3 segundos para mantener stock actualizado
    const interval = setInterval(loadProducts, 3000);
    return () => clearInterval(interval);
  }, []);

  // Función para cargar carrito desde localStorage
  const loadCartFromStorage = () => {
    const savedCart = read(LS.CART) || [];
    try {
      if (Array.isArray(savedCart) && savedCart.length > 0) {
        return savedCart.map((cartItem) => {
          const currentProduct = productService.getById(cartItem.id);
          if (currentProduct) {
            const adjustedQuantity = Math.min(
              cartItem.cantidad,
              currentProduct.stock,
            );
            return {
              ...cartItem,
              stock: currentProduct.stock,
              cantidad: adjustedQuantity,
            };
          }
          return cartItem;
        });
      }
      return [];
    } catch (error) {
      console.error("Error parsing saved cart:", error);
      write(LS.CART, []);
      return [];
    }
  };

  const [cart, setCart] = useState(loadCartFromStorage);
  const [notification, setNotification] = useState(null);

  // Guardar carrito en localStorage
  useEffect(() => {
    write(LS.CART, cart);
  }, [cart]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [originalProducts, setOriginalProducts] = useState([]);

  // Cargar pedido para editar si existe
  useEffect(() => {
    const editOrderData = localStorage.getItem("syspharma_edit_order");
    if (editOrderData) {
      const orderData = JSON.parse(editOrderData);
      setIsEditing(true);
      setEditingOrderId(orderData.id);
      setOriginalProducts(orderData.productosOriginales || []);

      // Cargar información del cliente
      setClientInfo({
        documento: orderData.documento || "",
        nombre: orderData.cliente || "",
        telefono: orderData.telefono || "",
        correo: orderData.correo || "",
        metodoPago: orderData.metodoPago || "Efectivo",
      });

      // Cargar productos al carrito (solo cuando editamos)
      if (orderData.productos && orderData.productos.length > 0) {
        setCart(orderData.productos);
      }

      // Limpiar los datos de edición
      localStorage.removeItem("syspharma_edit_order");
    }
    // Si no estamos editando, el carrito ya se cargó desde localStorage en la inicialización
  }, []);

  // Información del cliente
  const [clientInfo, setClientInfo] = useState({
    documento: "",
    nombre: "",
    telefono: "",
    correo: "",
    metodoPago: "Efectivo",
  });

  // Métodos de pago dinámicos
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Cargar métodos de pago
  useEffect(() => {
    const methods = getPaymentMethods();
    setPaymentMethods(methods);

    // Listen for parameter updates
    const handleParameterUpdate = () => {
      const updatedMethods = getPaymentMethods();
      setPaymentMethods(updatedMethods);
    };

    window.addEventListener(
      "syspharma_parameters_updated",
      handleParameterUpdate,
    );
    return () => {
      window.removeEventListener(
        "syspharma_parameters_updated",
        handleParameterUpdate,
      );
    };
  }, []);

  const handleClientChange = (field, value) => {
    setClientInfo((prev) => ({ ...prev, [field]: value }));
  };

  // Filtro de productos
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [products, searchTerm]);

  // Agregar producto al carrito
  const handleAddToCart = (product) => {
    // Validar stock disponible
    if (product.stock <= 0) {
      setNotification({
        message: `No hay stock disponible para ${product.nombre}`,
        type: "error",
        zIndex: 50,
      });
      return;
    }

    const existingItem = cart.find((item) => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.cantidad : 0;
    const newQuantity = currentQuantity + 1;

    if (newQuantity > product.stock) {
      setNotification({
        message: `Stock insuficiente. Solo hay ${product.stock} unidades disponibles de ${product.nombre}`,
        type: "error",
        zIndex: 50,
      });
      return;
    }

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item,
        ),
      );
    } else {
      setCart([...cart, { ...product, cantidad: 1 }]);
    }
  };

  // Cambiar cantidad en carrito
  const handleChangeQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveFromCart(productId);
    } else {
      // Validar stock disponible
      const product = productService.getById(productId);
      if (!product) {
        setNotification({
          message: `Producto no encontrado: ${productId}`,
          type: "error",
          zIndex: 50,
        });
        return;
      }

      if (newQuantity > product.stock) {
        setNotification({
          message: `Stock insuficiente. Solo hay ${product.stock} unidades disponibles de ${product.nombre}`,
          type: "error",
          zIndex: 50,
        });
        return;
      }

      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, cantidad: newQuantity } : item,
        ),
      );
    }
  };

  // Remover del carrito
  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  // Calcular totales
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
    [cart],
  );

  const cartQuantity = useMemo(
    () => cart.reduce((sum, item) => sum + item.cantidad, 0),
    [cart],
  );

  // Llenar información de consumidor final
  const handleConsumerFinal = () => {
    setClientInfo({
      documento: "222222222222",
      nombre: "Consumidor Final",
      telefono: "-",
      correo: "-",
      metodoPago: "Efectivo",
    });
  };

  // Confirmar pedido
  const handleConfirmOrder = () => {
    if (!clientInfo.documento || !clientInfo.nombre) {
      setNotification({
        message: "Por favor completa documento y nombre del cliente",
        type: "error",
        zIndex: 50,
      });
      return;
    }

    if (cart.length === 0) {
      setNotification({
        message: "Agrega al menos un producto al pedido",
        type: "error",
        zIndex: 50,
      });
      return;
    }

    if (isEditing && editingOrderId) {
      // Actualizar pedido existente
      const currentUser = authService.getCurrentUser();

      ordersService.update({
        id: editingOrderId,
        cliente: clientInfo.nombre,
        documento: clientInfo.documento,
        productos: cart.map((p) => ({
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio: p.precio,
          id: p.id,
        })),
        cantidadProductos: cart.reduce((sum, p) => sum + p.cantidad, 0),
        total: cartTotal,
        metodoPago: clientInfo.metodoPago,
        notas: `Teléfono: ${clientInfo.telefono}${
          clientInfo.correo ? ` | Correo: ${clientInfo.correo}` : ""
        }`,
        origin: isEmployee ? "empleado" : "web",
        userId: isEmployee ? currentUser?.id : null,
        userName: isEmployee ? currentUser?.nombre : null,
      });
    } else {
      // Crear nuevo pedido
      const currentUser = authService.getCurrentUser();

      ordersService.create({
        cliente: clientInfo.nombre,
        documento: clientInfo.documento,
        productos: cart.map((p) => ({
          nombre: p.nombre,
          cantidad: p.cantidad,
          precio: p.precio,
          id: p.id,
        })),
        total: cartTotal,
        estado: "Pendiente",
        metodoPago: clientInfo.metodoPago,
        notas: `Teléfono: ${clientInfo.telefono}${
          clientInfo.correo ? ` | Correo: ${clientInfo.correo}` : ""
        }`,
        creadoPor: isEmployee ? "Empleado" : "Administrador",
        origin: isEmployee ? "empleado" : "web",
        userId: isEmployee ? currentUser?.id : null,
        userName: isEmployee ? currentUser?.nombre : null,
      });
      // Si es una venta (isSale === true) registrarla también en el servicio de ventas
      // Para ventas creadas por Administrador/Web, registrar también en el servicio de ventas.
      // Si es empleado, `ordersService.create` ya registra la venta ligada al turno.
      if (isSale && !isEmployee) {
        try {
          salesService.create({
            cliente: clientInfo.nombre,
            documento: clientInfo.documento,
            productos: cart.map((p) => ({ nombre: p.nombre, cantidad: p.cantidad, precio: p.precio, id: p.id })),
            cantidadProductos: cart.reduce((sum, p) => sum + p.cantidad, 0),
            total: cartTotal,
            metodoPago: clientInfo.metodoPago,
            notas: `Venta registrada desde ${isEmployee ? 'Empleado' : 'Admin'} | ${clientInfo.telefono || ''}`,
            estado: 'completada',
          });
          try { window.dispatchEvent(new Event('sales:changed')); } catch(e){}
        } catch (e) {
          console.warn('No se pudo registrar la venta en salesService:', e);
        }
      }
    }

    // Actualizar stock de productos
    if (isEditing && editingOrderId) {
      // Para edición: devolver stock original y reducir stock nuevo
      originalProducts.forEach((item) => {
        const currentProduct = productService.getById(item.id);
        if (currentProduct) {
          productService.update(item.id, {
            stock: currentProduct.stock + item.cantidad, // Devolver stock original
          });
        }
      });

      // Después de devolver el stock original, reducir el stock del carrito actualizado
      cart.forEach((item) => {
        const currentProduct = productService.getById(item.id);
        if (currentProduct && currentProduct.stock >= item.cantidad) {
          productService.update(item.id, {
            stock: currentProduct.stock - item.cantidad,
          });
        }
      });
    } else {
      // Para creación: reducir stock normalmente
      cart.forEach((item) => {
        const currentProduct = productService.getById(item.id);
        console.log(
          `Producto ${item.nombre} (ID: ${item.id}): stock actual ${currentProduct?.stock}, cantidad a descontar ${item.cantidad}`,
        );
        if (currentProduct && currentProduct.stock >= item.cantidad) {
          const newStock = currentProduct.stock - item.cantidad;
          productService.update(item.id, {
            stock: newStock,
          });
          console.log(
            `✅ Stock actualizado para ${item.nombre}: ${currentProduct.stock} -> ${newStock}`,
          );
        } else {
          console.error(
            `❌ Error: No hay suficiente stock para ${item.nombre}. Stock actual: ${currentProduct?.stock}, requerido: ${item.cantidad}`,
          );
        }
      });
    }

    setProducts(productService.getAll());

    setNotification({
      message: isEditing
        ? isSale
          ? "Venta actualizada exitosamente"
          : "Pedido actualizado exitosamente"
        : isSale
          ? "Venta registrada exitosamente"
          : "Pedido creado exitosamente",
      type: "success",
      zIndex: 50,
    });

    // Limpiar estado de edición y carrito
    setIsEditing(false);
    setEditingOrderId(null);
    setOriginalProducts([]);
    setCart([]);
    localStorage.removeItem("syspharma_cart");

    setTimeout(() => {
      if (isSale) {
        navigate(isEmployee ? "/employee/ventas" : "/admin/ventas");
      } else {
        navigate(isEmployee ? "/employee/pedidos" : "/admin/pedidos");
      }
    }, 1500);
  };

  // Helper para formato moneda
  const formatCurrency = (val) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(val);

  const inputClass =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 transition-all bg-gray-50 focus:bg-white";
  const labelClass =
    "block text-[10px] font-bold text-gray-600 mb-1.5 uppercase tracking-wide";

  return (
    <div className="h-full flex flex-col gap-4 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (isSale) {
                navigate(isEmployee ? "/employee/ventas" : "/admin/ventas");
              } else {
                navigate(isEmployee ? "/employee/pedidos" : "/admin/pedidos");
              }
            }}
            className="text-gray-600 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isSale ? "Registrar Venta Directa" : "Crear nuevo pedido"}
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              {isSale
                ? "Completa la venta con los datos del cliente"
                : "Selecciona productos y completa los datos del cliente"}
            </p>
          </div>
        </div>
      </div>

      {/* Layout de dos columnas */}
      <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
        {/* Columna Izquierda - Catálogo (2/3) */}
        <div className="col-span-2 flex flex-col gap-3 overflow-hidden">
          {/* Búsqueda */}
          <div className="flex-shrink-0">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Buscar productos por nombre o código..."
                className={`w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-300 text-xs bg-white ${
                  searchTerm ? "ring-1 ring-emerald-200" : ""
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de Productos */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
            <div className="overflow-y-auto no-scrollbar">
              <div className="divide-y divide-gray-100">
                {filteredProducts.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">
                    No se encontraron productos
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-800 truncate">
                          {product.nombre}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {product.codigo} • {product.laboratorio}
                        </div>
                        <div className="text-xs font-bold text-emerald-600 mt-1">
                          {formatCurrency(product.precio)} • Stock:{" "}
                          {product.stock}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className={`ml-3 flex-shrink-0 px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all ${
                          product.stock === 0
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        <Plus size={14} />
                        Agregar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha - Resumen y Carrito (1/3) */}
        <div className="col-span-1 flex flex-col gap-3 overflow-hidden">
          {/* Card de Facturación */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col flex-1">
            <div className="overflow-y-auto no-scrollbar flex flex-col flex-1">
              {/* Información del Cliente */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800">
                    Datos del cliente
                  </h3>
                  <button
                    onClick={handleConsumerFinal}
                    className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                  >
                    Consumidor Final
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className={labelClass}>Documento *</label>
                    <input
                      type="text"
                      placeholder="1234567890"
                      value={clientInfo.documento}
                      onChange={(e) =>
                        handleClientChange("documento", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Nombre *</label>
                    <input
                      type="text"
                      placeholder="Nombre completo"
                      value={clientInfo.nombre}
                      onChange={(e) =>
                        handleClientChange("nombre", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Teléfono</label>
                    <input
                      type="tel"
                      placeholder="3101234567"
                      value={clientInfo.telefono}
                      onChange={(e) =>
                        handleClientChange("telefono", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Correo (Opcional)</label>
                    <input
                      type="email"
                      placeholder="cliente@ejemplo.com"
                      value={clientInfo.correo}
                      onChange={(e) =>
                        handleClientChange("correo", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Método de Pago</label>
                    <select
                      value={clientInfo.metodoPago}
                      onChange={(e) =>
                        handleClientChange("metodoPago", e.target.value)
                      }
                      className={inputClass}
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.value}>
                          {method.value}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Resumen del Carrito */}
              <div className="p-4 flex-1 flex flex-col justify-center items-center">
                <div className="text-center mb-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                    <Package size={16} className="text-emerald-600" />
                    Productos ({cartQuantity})
                  </h3>
                  <p className="text-xs text-gray-500">
                    Total: {formatCurrency(cartTotal)}
                  </p>
                </div>

                <button
                  onClick={() =>
                    navigate(
                      isEmployee
                        ? "/employee/ventas/nueva/productos"
                        : "/admin/ventas/nueva/productos",
                    )
                  }
                  className="w-full py-2 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium transition-colors"
                >
                  Ver detalle productos
                </button>
              </div>
            </div>

            {/* Footer - Total y Botón */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
              <div className="mb-3 pb-3 border-b border-gray-200">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-gray-800">
                  <span>Total:</span>
                  <span className="text-emerald-600">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirmOrder}
                disabled={
                  cart.length === 0 ||
                  !clientInfo.documento ||
                  !clientInfo.nombre
                }
                className={`w-full py-2.5 rounded-lg font-bold text-xs transition-all ${
                  cart.length === 0 ||
                  !clientInfo.documento ||
                  !clientInfo.nombre
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                }`}
              >
                {isSale ? "Finalizar Venta / Cobrar" : "Confirmar Pedido"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {notification && (
        <ToastNotification
          message={notification.message}
          type={notification.type}
          zIndex={notification.zIndex}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
};

export default CreateOrderPage;
