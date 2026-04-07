import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search, Plus, Minus, ArrowLeft, Package, X,
  ShoppingBag, User, UserCheck, Clock, DollarSign,
  BadgeCheck, Grid, List, AlertCircle,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { productService } from "../../inventory/products/services/productService";
import { ordersService } from "./services/ordersService";
import { salesService } from "../services/salesService";
import { turnService } from "../services/turnService";
import { ToastNotification } from "../../../shared/ui/ToastNotification";
import { fetchPaymentMethods, getPaymentMethods } from "../../settings/services/parameterService";
import { authService } from "../../auth/authService";

const fmt = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

export const CreateOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isSale = location.pathname.includes("/ventas/nueva");
  const isEmployee = location.pathname.startsWith("/employee");

  const currentUser = JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");
  const isEmployeeRole = (currentUser.rol || "") === "Empleado";
  const primary = isEmployeeRole ? "#2563eb" : "#059669";
  const primaryLight = isEmployeeRole ? "#eff6ff" : "#ecfdf5";
  const primaryBorder = isEmployeeRole ? "#93c5fd" : "#6ee7b7";

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("todas");
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [turnoLoading, setTurnoLoading] = useState(true);
  const [clientInfo, setClientInfo] = useState({
    documento: "", nombre: "", telefono: "", correo: "", metodoPagoId: "",
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [quickQty, setQuickQty] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const data = await productService.getAll();
      setProducts(Array.isArray(data) ? data : []);
    } catch { setProducts([]); }
  }, []);

  useEffect(() => {
    loadProducts();

    // Cargar métodos de pago
    fetchPaymentMethods().then(methods => {
      setPaymentMethods(methods);
      if (methods.length > 0)
        setClientInfo(p => ({ ...p, metodoPagoId: String(methods[0].id) }));
    }).catch(() => {
      const local = getPaymentMethods();
      setPaymentMethods(local);
      if (local.length > 0)
        setClientInfo(p => ({ ...p, metodoPagoId: String(local[0].id) }));
    });

    // Obtener turno activo real desde el backend
    if (isSale) {
      turnService.getActiveTurn(currentUser?.id).then(turno => {
        setTurnoActivo(turno);
        setTurnoLoading(false);
      }).catch(() => {
        setTurnoActivo(null);
        setTurnoLoading(false);
      });
    } else {
      setTurnoLoading(false);
    }

    // Cargar pedido a editar si existe
    const editOrderData = sessionStorage.getItem("syspharma_edit_order");
    if (editOrderData) {
      const od = JSON.parse(editOrderData);
      setIsEditing(true);
      setEditingOrderId(od.id);
      setClientInfo({
        documento: od.clienteDocumento || "",
        nombre: od.clienteNombre || "",
        telefono: od.clienteTelefono || "",
        correo: od.clienteEmail || "",
        metodoPagoId: od.metodoPagoId ? String(od.metodoPagoId) : "",
      });
      if (od.detalles?.length > 0) {
        setCart(od.detalles.map(d => ({
          id: d.productoId, nombre: d.nombre || d.productoNombre,
          precio: d.precioUnitario, cantidad: d.cantidad, stock: 999,
        })));
      }
      sessionStorage.removeItem("syspharma_edit_order");
    }
  }, [loadProducts]);

  const categorias = useMemo(() =>
    [...new Set(products.map(p => p.categoriaNombre).filter(Boolean))], [products]);

  const filteredProducts = useMemo(() => products.filter(p => {
    if (!p.estado) return false;
    const t = searchTerm.toLowerCase();
    return (p.nombre || "").toLowerCase().includes(t) &&
      (activeCategory === "todas" || p.categoriaNombre === activeCategory);
  }), [products, searchTerm, activeCategory]);

  const addToCart = (product, cantidad = 1) => {
    if (product.stock <= 0) { setNotification({ message: "Sin stock", type: "error" }); return; }
    const ex = cart.find(i => i.id === product.id);
    if (ex && ex.cantidad + cantidad > product.stock) {
      setNotification({ message: "Stock máximo alcanzado", type: "error" }); return;
    }
    if (ex) setCart(cart.map(i => i.id === product.id ? { ...i, cantidad: i.cantidad + cantidad } : i));
    else setCart([...cart, { ...product, cantidad }]);
  };

  const changeQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const nq = item.cantidad + delta;
    if (nq <= 0) { setCart(cart.filter(i => i.id !== id)); return; }
    setCart(cart.map(i => i.id === id ? { ...i, cantidad: nq } : i));
  };

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + (Number(i.precio) || 0) * i.cantidad, 0), [cart]);

  const openProductModal = (product) => {
    if (product.stock <= 0) return;
    setSelectedProduct(product);
    setQuickQty(1);
    setShowProductModal(true);
  };

  const handleConfirmOrder = async () => {
    if (!clientInfo.nombre) {
      setNotification({ message: "Ingresa el nombre del cliente", type: "error" }); return;
    }
    if (cart.length === 0) {
      setNotification({ message: "Agrega al menos un producto", type: "error" }); return;
    }
    if (isSale && !turnoActivo) {
      setNotification({ message: "No hay turno activo. Abre caja primero.", type: "error" }); return;
    }

    setLoading(true);
    try {
      const user = authService.getCurrentUser();
      const metodoPagoId = clientInfo.metodoPagoId ? Number(clientInfo.metodoPagoId) : null;

      if (isSale) {
        await salesService.create({
          turnoId: turnoActivo.id,
          usuarioId: user?.id || currentUser?.id,
          cliente: clientInfo.nombre,
          documento: clientInfo.documento || null,
          telefono: clientInfo.telefono || null,
          metodoPagoId,
          porcentajeIva: 0,
          notas: clientInfo.correo ? `Correo: ${clientInfo.correo}` : null,
          productos: cart,
        });
        window.dispatchEvent(new Event("sales:changed"));
      } else {
        const pedidoData = {
          usuarioId: user?.id || currentUser?.id || null,
          cliente: clientInfo.nombre,
          documento: clientInfo.documento || null,
          telefono: clientInfo.telefono || null,
          correo: clientInfo.correo || null,
          metodoPagoId,
          origen: isEmployee ? "empleado" : "web",
          productos: cart,
        };
        if (isEditing && editingOrderId) {
          await ordersService.update({ ...pedidoData, id: editingOrderId });
        } else {
          await ordersService.create(pedidoData);
        }
        window.dispatchEvent(new Event("orders:changed"));
      }

      await loadProducts();
      setNotification({ message: isSale ? "Venta registrada" : "Pedido creado", type: "success" });
      setIsEditing(false);
      setEditingOrderId(null);
      setCart([]);
      setClientInfo({ documento: "", nombre: "", telefono: "", correo: "", metodoPagoId: "" });

      setTimeout(() => navigate(isSale
        ? (isEmployee ? "/employee/ventas" : "/admin/ventas")
        : (isEmployee ? "/employee/pedidos" : "/admin/pedidos")), 1500);
    } catch (err) {
      setNotification({ message: err?.response?.data?.message || "Error al procesar", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Alerta si es venta y no hay turno
  const sinTurno = isSale && !turnoLoading && !turnoActivo;

  return (
    <div className="flex flex-col h-full font-sans" style={{ background: "#f0f4f8" }}>

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100"
          style={{ color: primary }}>
          <ArrowLeft size={16} />
        </button>
        <div className="h-6 w-px bg-slate-200" />
        <div>
          <h1 className="text-xs font-black uppercase tracking-wider text-slate-400">
            {isSale ? "Nueva Venta" : "Nuevo Pedido"}
          </h1>
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock size={10} />
            {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>

        <div className="flex-1 max-w-lg mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input type="text" placeholder="Buscar producto..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none"
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {["todas", ...categorias].slice(0, 6).map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className="flex-shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase whitespace-nowrap transition-all"
              style={activeCategory === cat ? { background: primary, color: "#fff" } : { background: "#f1f5f9", color: "#64748b" }}>
              {cat === "todas" ? "Todo" : cat}
            </button>
          ))}
        </div>

        <div className="flex border border-slate-200 rounded-lg overflow-hidden flex-shrink-0">
          {[{ mode: "grid", Icon: Grid }, { mode: "list", Icon: List }].map(({ mode, Icon }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`p-1.5 transition-colors ${viewMode === mode ? "bg-slate-100" : "bg-white hover:bg-slate-50"}`}
              style={viewMode === mode ? { color: primary } : { color: "#94a3b8" }}>
              <Icon size={14} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1.5 rounded-lg flex-shrink-0">
          <BadgeCheck size={13} style={{ color: primary }} />
          <span className="text-[10px] font-bold text-slate-600 hidden lg:block">{currentUser.nombre || "Usuario"}</span>
        </div>
      </div>

      {/* Alerta sin turno */}
      {sinTurno && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <AlertCircle size={14} className="text-amber-600" />
          <span className="text-xs font-bold text-amber-700">No hay turno activo. Para registrar ventas debes abrir caja primero.</span>
        </div>
      )}

      {/* Turno activo info */}
      {isSale && turnoActivo && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-1.5 flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-bold text-emerald-700">Turno activo #{turnoActivo.id} · Base: {fmt(turnoActivo.montoBase)}</span>
        </div>
      )}

      {/* 3 columnas */}
      <div className="flex flex-1 overflow-hidden p-3 gap-3">

        {/* Cliente */}
        <div className="w-60 flex flex-col gap-2 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex-1">
            <div className="px-2 py-2 border-b border-slate-100" style={{ background: primaryLight }}>
              <div className="flex items-center gap-1">
                <UserCheck size={12} style={{ color: primary }} />
                <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: primary }}>Cliente</span>
              </div>
            </div>
            <div className="p-2 space-y-1.5">
              {[
                { key: "documento", label: "Documento", type: "text", ph: "CC / NIT" },
                { key: "nombre", label: "Nombre *", type: "text", ph: "Nombre completo" },
                { key: "telefono", label: "Teléfono", type: "tel", ph: "3101234567" },
                { key: "correo", label: "Correo", type: "email", ph: "email@ejemplo.com" },
              ].map(({ key, label, type, ph }) => (
                <div key={key}>
                  <label className="text-[9px] font-black uppercase text-slate-400 mb-0.5 block">{label}</label>
                  <input type={type} placeholder={ph} value={clientInfo[key]}
                    onChange={e => setClientInfo(p => ({ ...p, [key]: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] focus:outline-none" />
                </div>
              ))}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 mb-0.5 block">Método de pago</label>
                <select value={clientInfo.metodoPagoId}
                  onChange={e => setClientInfo(p => ({ ...p, metodoPagoId: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[10px] focus:outline-none">
                  {paymentMethods.map(m => <option key={m.id} value={m.id}>{m.value}</option>)}
                </select>
              </div>
              <button
                onClick={() => setClientInfo({ documento: "222222222", nombre: "Consumidor Final", telefono: "-", correo: "-", metodoPagoId: paymentMethods[0]?.id?.toString() || "" })}
                className="w-full py-1 text-[9px] font-black uppercase rounded-lg border transition-all hover:opacity-80"
                style={{ borderColor: primaryBorder, color: primary, background: primaryLight }}>
                Consumidor Final
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-3 flex-shrink-0">
            <h3 className="text-[9px] font-black uppercase text-slate-400 mb-2">Resumen</h3>
            <div className="flex justify-between text-[11px] pt-1.5 border-t border-slate-100">
              <span className="font-black text-slate-700">Total</span>
              <span className="font-black" style={{ color: primary }}>{fmt(cartTotal)}</span>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-3">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2">
                <Package size={36} strokeWidth={1} />
                <p className="text-xs">Sin productos</p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {filteredProducts.map(p => {
                  const sinStock = p.stock === 0;
                  return (
                    <div key={p.id} onClick={() => openProductModal(p)}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden cursor-pointer group hover:border-slate-300 hover:shadow-sm"
                      style={{ opacity: sinStock ? 0.45 : 1, cursor: sinStock ? "not-allowed" : "pointer" }}>
                      <div className="aspect-square flex items-center justify-center relative" style={{ background: primaryLight }}>
                        {p.imagen
                          ? <img src={p.imagen} className="w-full h-full object-contain p-1" alt={p.nombre} />
                          : <Package size={24} style={{ color: primary, opacity: 0.35 }} />}
                        <span className={`absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded-full ${p.stock < 5 ? "bg-red-100 text-red-600" : "bg-white/80 text-slate-500"}`}>
                          {p.stock}
                        </span>
                      </div>
                      <div className="p-2">
                        <p className="text-[10px] font-bold text-slate-800 leading-tight line-clamp-2 mb-1">{p.nombre}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black" style={{ color: primary }}>{fmt(p.precio)}</span>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-white group-hover:scale-110"
                            style={{ background: sinStock ? "#cbd5e1" : primary }}>
                            <Plus size={10} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1.5">
                {filteredProducts.map(p => {
                  const sinStock = p.stock === 0;
                  return (
                    <div key={p.id} onClick={() => openProductModal(p)}
                      className="flex items-center gap-2.5 p-2.5 border border-slate-100 rounded-xl hover:border-slate-200 cursor-pointer"
                      style={{ opacity: sinStock ? 0.45 : 1 }}>
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: primaryLight }}>
                        {p.imagen ? <img src={p.imagen} className="w-full h-full object-contain p-0.5" /> : <Package size={14} style={{ color: primary, opacity: 0.4 }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{p.nombre}</p>
                        <p className="text-[9px] text-slate-400">Stock: {p.stock}</p>
                      </div>
                      <span className="text-xs font-black flex-shrink-0" style={{ color: primary }}>{fmt(p.precio)}</span>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: sinStock ? "#cbd5e1" : primary }}>
                        <Plus size={10} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Carrito */}
        <div className="w-72 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden flex-shrink-0">
          <div className="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between flex-shrink-0" style={{ background: primaryLight }}>
            <div className="flex items-center gap-1.5">
              <ShoppingBag size={13} style={{ color: primary }} />
              <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: primary }}>Carrito</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-white text-slate-600">{cart.length} items</span>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-[9px] font-bold text-red-400 hover:text-red-600">Vaciar</button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-2 py-8">
                <ShoppingBag size={28} strokeWidth={1} />
                <p className="text-[10px] font-medium">Carrito vacío</p>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                  <div className="flex justify-between items-start mb-1.5">
                    <p className="text-[10px] font-bold flex-1 pr-1 leading-tight">{item.nombre}</p>
                    <button onClick={() => changeQty(item.id, -999)} className="text-slate-300 hover:text-red-400 flex-shrink-0"><X size={12} /></button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 bg-white rounded-lg border border-slate-200 p-0.5">
                      <button onClick={() => changeQty(item.id, -1)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100"><Minus size={9} /></button>
                      <span className="text-[10px] font-black w-6 text-center">{item.cantidad}</span>
                      <button onClick={() => changeQty(item.id, 1)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-100" style={{ color: primary }}><Plus size={9} /></button>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] font-black" style={{ color: primary }}>{fmt(item.precio * item.cantidad)}</div>
                      <div className="text-[8px] text-slate-400">{fmt(item.precio)} c/u</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-slate-100 flex-shrink-0">
            <div className="flex justify-between text-xs font-black mb-3 pb-2 border-b border-slate-100">
              <span className="text-slate-600">Total</span>
              <span style={{ color: primary }}>{fmt(cartTotal)}</span>
            </div>
            <button onClick={handleConfirmOrder}
              disabled={cart.length === 0 || loading || (isSale && !turnoActivo)}
              className="w-full py-2.5 rounded-xl font-black text-xs text-white transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              style={{ background: (cart.length === 0 || loading || (isSale && !turnoActivo)) ? "#cbd5e1" : primary }}>
              <DollarSign size={13} />
              {loading ? "Procesando..." : isSale ? "Finalizar venta" : "Confirmar pedido"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal cantidad */}
      {showProductModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-black uppercase text-slate-700">Agregar cantidad</h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
            <p className="text-[11px] font-bold text-slate-800 mb-0.5">{selectedProduct.nombre}</p>
            <p className="text-[9px] text-slate-400 mb-4">Stock disponible: {selectedProduct.stock}</p>
            <div className="flex items-center gap-2 mb-4">
              <button onClick={() => setQuickQty(Math.max(1, quickQty - 1))}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                <Minus size={14} />
              </button>
              <input type="number" min="1" max={selectedProduct.stock} value={quickQty}
                onChange={e => setQuickQty(Math.min(selectedProduct.stock, Math.max(1, parseInt(e.target.value) || 1)))}
                className="flex-1 text-center text-lg font-black border border-slate-200 rounded-xl py-1.5 focus:outline-none" />
              <button onClick={() => setQuickQty(Math.min(selectedProduct.stock, quickQty + 1))}
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50">
                <Plus size={14} />
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowProductModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-black hover:bg-slate-50">Cancelar</button>
              <button onClick={() => { addToCart(selectedProduct, quickQty); setShowProductModal(false); }}
                className="flex-1 py-2.5 rounded-xl text-xs font-black text-white"
                style={{ background: primary }}>
                Agregar {quickQty} und.
              </button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <ToastNotification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />
      )}
    </div>
  );
};

export default CreateOrderPage;