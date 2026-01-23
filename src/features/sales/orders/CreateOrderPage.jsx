import React, { useState, useMemo } from "react";
import { Search, Plus, Trash2, ArrowLeft, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { productService } from "../../inventory/products/services/productService";
import { ordersService } from "./services/ordersService";
import { ToastNotification } from "../../../shared/ui/ToastNotification";

export const CreateOrderPage = () => {
  const navigate = useNavigate();
  const [products] = useState(productService.getAll());
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState(null);

  // Información del cliente
  const [clientInfo, setClientInfo] = useState({
    documento: "",
    nombre: "",
    telefono: "",
    correo: "",
  });

  const handleClientChange = (field, value) => {
    setClientInfo((prev) => ({ ...prev, [field]: value }));
  };

  // Filtro de productos
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Agregar producto al carrito
  const handleAddToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        )
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
      setCart(
        cart.map((item) =>
          item.id === productId ? { ...item, cantidad: newQuantity } : item
        )
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
    [cart]
  );

  const cartQuantity = useMemo(
    () => cart.reduce((sum, item) => sum + item.cantidad, 0),
    [cart]
  );

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

    ordersService.create({
      cliente: clientInfo.nombre,
      documento: clientInfo.documento,
      productos: cart.map((p) => ({
        nombre: p.nombre,
        cantidad: p.cantidad,
        precio: p.precio,
      })),
      total: cartTotal,
      estado: "Pendiente",
      notas: `Teléfono: ${clientInfo.telefono}${
        clientInfo.correo ? ` | Correo: ${clientInfo.correo}` : ""
      }`,
    });

    setNotification({
      message: "Pedido creado exitosamente",
      type: "success",
      zIndex: 50,
    });

    setTimeout(() => {
      navigate("/admin/pedidos");
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
            onClick={() => navigate("/admin/pedidos")}
            className="text-gray-600 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Crear nuevo pedido
            </h1>
            <p className="text-gray-500 text-xs mt-0.5">
              Selecciona productos y completa los datos del cliente
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
                <h3 className="text-sm font-bold text-gray-800 mb-3">
                  Datos del cliente
                </h3>

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
                </div>
              </div>

              {/* Resumen del Carrito */}
              <div className="p-4 flex-1 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Package size={16} className="text-emerald-600" />
                  Productos ({cartQuantity})
                </h3>

                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs">
                    No hay productos seleccionados
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="p-2 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-1.5">
                          <span className="font-semibold text-xs text-gray-800 truncate pr-2">
                            {item.nombre}
                          </span>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-0.5"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-[10px] text-gray-600">
                            {formatCurrency(item.precio)} c/u
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleChangeQuantity(item.id, item.cantidad - 1)
                              }
                              className="w-5 h-5 rounded border border-gray-300 text-xs hover:bg-gray-200"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.cantidad}
                              onChange={(e) =>
                                handleChangeQuantity(
                                  item.id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-8 text-center text-xs border border-gray-300 rounded py-0.5"
                              min="1"
                            />
                            <button
                              onClick={() =>
                                handleChangeQuantity(item.id, item.cantidad + 1)
                              }
                              className="w-5 h-5 rounded border border-gray-300 text-xs hover:bg-gray-200"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="text-right text-xs font-bold text-emerald-600 mt-1">
                          {formatCurrency(item.precio * item.cantidad)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                Confirmar Pedido
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
