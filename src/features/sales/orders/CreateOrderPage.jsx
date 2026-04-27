import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { ProductsSearchView } from "../components/ProductsSearchView";
import { ServicesSearchView } from "../components/ServicesSearchView";
import { IntegratedCart } from "../components/IntegratedCart";
import { salesService } from "../services/salesService";
import { turnService } from "../services/turnService";
import { ordersService } from "./services/ordersService";
import { authService } from "../../auth/authService";
import { fetchPaymentMethods, getPaymentMethods } from "../../settings/services/parameterService";
import { ToastNotification } from "../../../shared/ui/ToastNotification";

export const CreateOrderPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const esUnPedido = location.pathname.toLowerCase().includes("pedido");
  const isEmployeePath = location.pathname.startsWith("/employee");
  const currentUser = JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");
  const isEmployeeRole = (currentUser.rol || "") === "Empleado";

  const primary = isEmployeeRole ? "#2563eb" : "#059669";
  const primaryLight = isEmployeeRole ? "#eff6ff" : "#ecfdf5";
  const primaryBorder = isEmployeeRole ? "#93c5fd" : "#6ee7b7";

  const [activeTab, setActiveTab] = useState("productos");
  const [productCart, setProductCart] = useState([]);
  const [serviceCart, setServiceCart] = useState([]);
  const [clientInfo, setClientInfo] = useState({
    documento: "", nombre: "", telefono: "", correo: "", metodoPagoId: "",
  });

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [turnoActivo, setTurnoActivo] = useState(null);
  const [turnoLoading, setTurnoLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const LOCAL_TURNO_KEY = "activeTurno";

  useEffect(() => {
    fetchPaymentMethods()
      .then((methods) => {
        setPaymentMethods(methods);
        if (methods.length > 0)
          setClientInfo((p) => ({ ...p, metodoPagoId: String(methods[0].id) }));
      })
      .catch(() => {
        const local = getPaymentMethods();
        setPaymentMethods(local);
        if (local.length > 0)
          setClientInfo((p) => ({ ...p, metodoPagoId: String(local[0].id) }));
      });

    const loadActiveTurn = async () => {
      try {
        const userId = currentUser?.id;
        if (!userId) return;
        const turno = await turnService.getActiveTurn(userId);
        if (turno && (turno.id || turno.turnoId)) {
          const idReal = turno.id || turno.turnoId;
          setTurnoActivo({ ...turno, id: idReal });
          localStorage.setItem(LOCAL_TURNO_KEY, JSON.stringify({ ...turno, id: idReal }));
        } else {
          setTurnoActivo(null);
          localStorage.removeItem(LOCAL_TURNO_KEY);
        }
      } catch {
        const saved = JSON.parse(localStorage.getItem(LOCAL_TURNO_KEY) || "null");
        setTurnoActivo(saved);
      } finally {
        setTurnoLoading(false);
      }
    };

    loadActiveTurn();
  }, [currentUser?.id]);

  const handleAddProduct = useCallback((product, cantidad) => {
    setProductCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing)
        return prev.map((p) => p.id === product.id ? { ...p, cantidad: p.cantidad + cantidad } : p);
      return [...prev, { ...product, cantidad }];
    });
  }, []);

  const handleRemoveProduct = useCallback((id) => {
    setProductCart((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleUpdateQty = useCallback((id, newQty) => {
    if (newQty <= 0) handleRemoveProduct(id);
    else setProductCart((prev) => prev.map((p) => p.id === id ? { ...p, cantidad: newQty } : p));
  }, [handleRemoveProduct]);

  const handleAddService = useCallback((service) => {
    setServiceCart((prev) => [...prev, service]);
  }, []);

  const handleRemoveService = useCallback((id) => {
    setServiceCart((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleConfirmOrder = async () => {
    if (!clientInfo.nombre) {
      setNotification({ message: "El nombre es obligatorio", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const user = authService.getCurrentUser();
      const userId = user?.id || currentUser?.id;

      const savedTurno = JSON.parse(localStorage.getItem(LOCAL_TURNO_KEY) || "null");
      const currentTurnoId = turnoActivo?.id || savedTurno?.id;

      if (isEmployeeRole && (!currentTurnoId || currentTurnoId === 0)) {
        throw new Error("No se puede procesar: No tienes una caja abierta.");
      }

      if (esUnPedido) {
        // ✅ Payload exacto según Swagger de Pedidos
        const pedidoPayload = {
          usuarioId: Number(userId),
          clienteNombre: clientInfo.nombre,
          clienteDocumento: clientInfo.documento || "",
          clienteTelefono: clientInfo.telefono || "",
          clienteEmail: clientInfo.correo || "",
          metodoPagoId: Number(clientInfo.metodoPagoId),
          porcentajeIva: 0,
          notas: "",
          origen: "Terminal",
          detalles: productCart.map((p) => ({
            productoId: Number(p.id),
            nombre: p.nombre || p.name || p.nombreProducto || p.descripcion || "Producto",
            cantidad: Number(p.cantidad),
            precioUnitario: Number(p.precio),
          })),
        };

        console.log("📝 Enviando PEDIDO:", JSON.stringify(pedidoPayload, null, 2));
        await ordersService.create(pedidoPayload);
        window.dispatchEvent(new Event("orders:changed"));
        setNotification({ message: "Pedido guardado con éxito", type: "success" });
        setTimeout(() => {
          navigate(isEmployeePath ? "/employee/pedidos" : "/admin/pedidos");
        }, 1500);

      } else {
        // ✅ Payload de Ventas (sin cambios)
        const subtotalProds = productCart.reduce((sum, p) => sum + p.cantidad * p.precio, 0);
        const subtotalServs = serviceCart.reduce((sum, s) => sum + s.precio, 0);
        const totalGeneral = subtotalProds + subtotalServs;

        const ventaPayload = {
          turnoId: Number(currentTurnoId),
          usuarioId: Number(userId),
          clienteNombre: clientInfo.nombre,
          clienteDocumento: clientInfo.documento || "",
          clienteTelefono: clientInfo.telefono || "",
          metodoPagoId: Number(clientInfo.metodoPagoId),
          porcentajeIva: 0,
          subtotal: totalGeneral,
          iva: 0,
          total: totalGeneral,
          notas: clientInfo.correo ? `Email: ${clientInfo.correo}` : "",
          detalles: productCart.map((p) => ({
            productoId: Number(p.id),
            cantidad: Number(p.cantidad),
            precioUnitario: Number(p.precio),
            descuento: 0,
            subtotal: Number(p.cantidad * p.precio),
          })),
          servicios: serviceCart.map((s) => ({
            servicioId: Number(s.id),
            cantidad: 1,
            precioUnitario: Number(s.precio),
            descuento: 0,
            subtotal: Number(s.precio),
          })),
        };

        console.log("💰 Enviando VENTA:", JSON.stringify(ventaPayload, null, 2));
        await salesService.create(ventaPayload);
        window.dispatchEvent(new Event("sales:changed"));
        setNotification({ message: "Transacción exitosa", type: "success" });
        setTimeout(() => {
          navigate(isEmployeePath ? "/employee/inicio" : "/admin/dashboard");
        }, 1500);
      }

    } catch (err) {
      console.error("❌ Error API completo:", JSON.stringify(err.response?.data, null, 2));
      setNotification({
        message: err.response?.data?.message || err.message || "Error al procesar",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (turnoLoading)
    return <div className="h-full flex items-center justify-center">Cargando caja...</div>;

  if (isEmployeeRole && !turnoActivo) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-gray-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center border border-red-100">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Caja Cerrada</h2>
          <p className="text-gray-500 mb-6 text-sm">Debes tener un turno activo para realizar esta operación.</p>
          <button onClick={() => navigate(-1)} className="px-6 py-2 bg-gray-900 text-white rounded-xl">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col font-sans bg-[#f8fafc]">
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100" style={{ color: primary }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest" style={{ color: primary }}>
              {esUnPedido ? "Nuevo Pedido" : "Terminal SysPharma"}
            </h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab("productos")} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === "productos" ? "bg-white shadow text-blue-600" : "text-gray-500"}`}>📦 PRODUCTOS</button>
          <button onClick={() => setActiveTab("servicios")} className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${activeTab === "servicios" ? "bg-white shadow text-blue-600" : "text-gray-500"}`}>🏥 SERVICIOS</button>
        </div>

        <div className="text-right">
          <p className="text-xs font-black text-gray-900">{currentUser.nombre}</p>
          {turnoActivo && <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded">CAJA #{turnoActivo.id}</span>}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex p-4 gap-4">
        <div className="flex-1 min-w-0">
          {activeTab === "productos" ? (
            <ProductsSearchView cart={productCart} onAddProduct={handleAddProduct} onRemoveProduct={handleRemoveProduct} onUpdateQty={handleUpdateQty} primary={primary} primaryLight={primaryLight} primaryBorder={primaryBorder} />
          ) : (
            <ServicesSearchView cart={serviceCart} onAddService={handleAddService} onRemoveService={handleRemoveService} primary={primary} primaryLight={primaryLight} />
          )}
        </div>

        <div className="w-96 flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
            <h3 className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">Cliente</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Documento" value={clientInfo.documento} onChange={e => setClientInfo(p => ({ ...p, documento: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none" />
              <input type="text" placeholder="Nombre completo *" value={clientInfo.nombre} onChange={e => setClientInfo(p => ({ ...p, nombre: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none" />
              <div className="grid grid-cols-2 gap-2">
                <input type="tel" placeholder="Teléfono" value={clientInfo.telefono} onChange={e => setClientInfo(p => ({ ...p, telefono: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none" />
                <select value={clientInfo.metodoPagoId} onChange={e => setClientInfo(p => ({ ...p, metodoPagoId: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold">
                  {paymentMethods.map(m => <option key={m.id} value={m.id}>{m.value}</option>)}
                </select>
              </div>
              <button onClick={() => setClientInfo({ documento: "222222222", nombre: "Consumidor Final", telefono: "-", correo: "-", metodoPagoId: paymentMethods[0]?.id?.toString() || "" })} className="w-full py-2 text-[10px] font-black text-blue-600 border border-blue-100 bg-blue-50 rounded-lg uppercase">Cargar Genérico</button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <IntegratedCart products={productCart} services={serviceCart} onConfirm={handleConfirmOrder} isLoading={loading} primary={primary} disabled={!clientInfo.nombre || (isEmployeeRole && !turnoActivo)} />
          </div>
        </div>
      </div>

      {notification && <ToastNotification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
};

export default CreateOrderPage;
