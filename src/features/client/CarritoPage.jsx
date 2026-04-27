import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  LS,
  read,
  write,
  pushNotification,
} from "../../shared/services/lsService";
import { getPaymentMethods } from "../settings/services/parameterService";
import { ToastNotification } from "../../shared/ui/ToastNotification";
import { ordersService } from "../sales/orders/services/ordersService";
import { useNavigate } from "react-router-dom";

const CarritoPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);

  // Estados para Checkout
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState("");
  const [checkoutError, setCheckoutError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    load();
    const onCartUpdated = () => load();
    window.addEventListener(`${LS.CART}_updated`, onCartUpdated);
    return () => window.removeEventListener(`${LS.CART}_updated`, onCartUpdated);
  }, []);

  // Carga y normalización de productos en el carrito
  function load() {
    const cart = read(LS.CART) || [];
    const prods = JSON.parse(localStorage.getItem("syspharma_products") || "[]");
    
    const normalized = (cart || []).map((item) => {
      const p = prods.find((x) => x.id === item.id || x.id === Number(item)) || {};
      return {
        id: p.id || item.id,
        nombre: p.nombre || item.nombre || "Producto",
        imagen: p.imagen || item.imagen,
        precioActual: Number(p.precio || item.precio || 0),
        cantidad: item.cantidad || 1,
        producto: p
      };
    });
    setCartItems(normalized);
  }

  const changeQty = (id, delta) => {
    const cart = read(LS.CART) || [];
    const updated = cart.map(it => it.id === id ? { ...it, cantidad: Math.max(1, (it.cantidad || 1) + delta) } : it);
    write(LS.CART, updated);
    load();
  };

  const handleRemove = (id) => {
    const cart = read(LS.CART) || [];
    const updated = cart.filter(it => it.id !== id);
    write(LS.CART, updated);
    load();
    setToast({ message: "Producto eliminado", type: "success" });
  };

  const total = cartItems.reduce((s, it) => s + (it.precioActual * it.cantidad), 0);

  const formatCurrency = (amount) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(amount);

  return (
    <div className="p-6 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft size={24} /></button>
        <h2 className="text-2xl font-black text-gray-900">Tu Carrito</h2>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Tu carrito está vacío</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Productos */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((it) => (
              <div key={it.id} className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm">
                <img src={it.imagen || "/src/assets/farmacia.avif"} className="w-20 h-20 object-cover rounded-xl" alt="" />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{it.nombre}</h4>
                  <p className="text-emerald-600 font-black">{formatCurrency(it.precioActual)}</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
                  <button onClick={() => changeQty(it.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg">-</button>
                  <span className="font-bold w-4 text-center">{it.cantidad}</span>
                  <button onClick={() => changeQty(it.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white border rounded-lg">+</button>
                </div>
                <button onClick={() => handleRemove(it.id)} className="p-2 text-red-400 hover:text-red-600">✕</button>
              </div>
            ))}
          </div>

          {/* Resumen de Pago */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit space-y-4">
            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Resumen</h3>
            <div className="flex justify-between items-center text-xl font-black text-gray-900 border-t pt-4">
              <span>Total:</span>
              <span className="text-emerald-600">{formatCurrency(total)}</span>
            </div>
            <button
              onClick={() => {
                const methods = getPaymentMethods();
                setPaymentMethods(methods || []);
                setCheckoutOpen(true);
              }}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 transition-all"
            >
              Finalizar Compra
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Confirmar Pedido</h3>
            
            <div className="mb-6">
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Método de Pago</label>
              <select
                value={selectedPaymentId}
                onChange={(e) => setSelectedPaymentId(e.target.value)}
                className="w-full border-2 border-gray-100 p-3 rounded-2xl outline-none focus:border-emerald-500 font-medium"
              >
                <option value="">Seleccione cómo desea pagar...</option>
                {paymentMethods.map((m) => (
                  <option key={m.id} value={m.id}>{m.value}</option>
                ))}
              </select>
            </div>

            {checkoutError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold mb-6 border border-red-100">
                {checkoutError}
              </div>
            )}

            <div className="flex gap-4">
              <button 
                onClick={() => setCheckoutOpen(false)} 
                className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={processing || !selectedPaymentId}
                onClick={async () => {
                  setProcessing(true);
                  setCheckoutError(null);
                  try {
                    // 1. LEER USUARIO DE SESIÓN (Sincronizado con el resto de la app)
                    const user = JSON.parse(sessionStorage.getItem("syspharma_user") || "null");
                    
                    if (!user || !user.id) {
                      throw new Error("No hay una sesión activa. Por favor, inicia sesión de nuevo.");
                    }

                    // 2. CONSTRUIR OBJETO PARA EL BACKEND (DTO)
                    const dataParaGuardar = {
                      usuarioId: Number(user.id),
                      clienteNombre: user.nombre,
                      clienteEmail: user.email,
                      metodoPagoId: Number(selectedPaymentId),
                      porcentajeIva: 0,
                      detalles: cartItems.map(it => ({
                        productoId: Number(it.id),
                        nombre: it.nombre,
                        cantidad: Number(it.cantidad),
                        precioUnitario: Number(it.precioActual)
                      }))
                    };

                    console.log("ENVIANDO PEDIDO:", dataParaGuardar);
                    await ordersService.create(dataParaGuardar);

                    // 3. ÉXITO: Limpiar y Redirigir
                    write(LS.CART, []);
                    setCheckoutOpen(false);
                    pushNotification({
                        title: "¡Gracias por tu compra!",
                        message: "Tu pedido se ha registrado con éxito.",
                        date: new Date().toISOString(),
                        path: "/client/mis-pedidos"
                    });
                    
                    // Redirección forzada para ver el pedido
                    window.location.href = "/client/mis-pedidos";

                  } catch (err) {
                    const msg = err.response?.data?.message || err.message;
                    setCheckoutError(msg);
                  } finally {
                    setProcessing(false);
                  }
                }}
                className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-100 disabled:opacity-50 transition-all active:scale-95"
              >
                {processing ? "Procesando..." : "Confirmar Pago"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default CarritoPage;