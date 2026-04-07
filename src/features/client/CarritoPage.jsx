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

const CarritoPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    load();
    const onCartUpdated = () => load();
    window.addEventListener(`${LS.CART}_updated`, onCartUpdated);
    window.addEventListener(`${LS.PRODUCTS}_updated`, onCartUpdated);
    return () => {
      window.removeEventListener(`${LS.CART}_updated`, onCartUpdated);
      window.removeEventListener(`${LS.PRODUCTS}_updated`, onCartUpdated);
    };
  }, []);

  function load() {
    const cart = read(LS.CART) || [];
    const prods = read(LS.PRODUCTS) || [];
    // Cart may be stored as array of ids or objects. Normalize to objects for display.
    const normalized = (cart || []).map((item) => {
      if (item && (typeof item === "string" || typeof item === "number")) {
        const p =
          prods.find((x) => x.id === item || x.id === Number(item)) || {};
        const computed = Number(p.precio ?? p.price ?? 0) || 0;
        return {
          id: p.id ?? item,
          cantidad: p && (p.stock ?? p.existencia) > 0 ? 1 : 0,
          precioActual: computed,
          nombre: p.nombre ?? p.name ?? "",
          imagen: p.imagen ?? p.image ?? "",
          laboratorio: p.laboratorio ?? p.marca ?? "",
          producto: p,
        };
      }

      const p = prods.find((x) => x.id === item.id) || {};
      const precioStored = item.precio ?? item.price;
      const currentPrice =
        Number(p.precio ?? p.price ?? precioStored ?? 0) || 0;
      const requestedQty = item.cantidad || 1;
      const allowedQty = Math.max(0, p.stock ?? p.existencia ?? requestedQty);
      const adjustedQty = Math.min(requestedQty, allowedQty);
      const priceChanged =
        precioStored !== undefined &&
        p &&
        Number(precioStored) !== Number(p.precio ?? p.price);
      return {
        ...item,
        producto: p,
        precioActual: currentPrice,
        priceChanged,
        cantidad: adjustedQty,
      };
    });
    const mapped = normalized;
    setCartItems(mapped);
    // Persist adjustments if admin reduced stock below quantities in cart
    try {
      const raw = read(LS.CART) || [];
      const rawNorm = (raw || []).map((it) =>
        it && typeof it === "object" ? it : { id: it, cantidad: 1 },
      );
      let changed = false;
      const toWrite = mapped.map((m) => {
        const found = rawNorm.find((r) => r.id === m.id);
        const prevQty = found ? found.cantidad || 1 : 0;
        if (prevQty !== (m.cantidad || 0)) changed = true;
        return { id: m.id, cantidad: m.cantidad || 0, precio: m.precioActual };
      });
      if (changed) write(LS.CART, toWrite);
    } catch {
      // Error persisting cart adjustments
    }
  }

  const changeQty = (id, delta) => {
    const raw = read(LS.CART) || [];
    const prods = read(LS.PRODUCTS) || [];
    // Normalize primitives to objects for mutation
    let arr = raw.map((it) => {
      if (it && (typeof it === "string" || typeof it === "number")) {
        const p = prods.find((x) => x.id === it || x.id === Number(it)) || {};
        return {
          id: p.id ?? it,
          cantidad: 1,
          precio: p.precio ?? p.price ?? 0,
        };
      }
      return it;
    });

    arr = arr.map((it) =>
      it.id === id
        ? { ...it, cantidad: Math.max(1, (it.cantidad || 1) + delta) }
        : it,
    );
    write(LS.CART, arr);
  };

  const handleRemove = (id) => {
    const raw = read(LS.CART) || [];
    const arr = raw.filter((f) => {
      if (f && (typeof f === "string" || typeof f === "number"))
        return f !== id;
      if (f && typeof f === "object") return f.id !== id;
      return true;
    });
    write(LS.CART, arr);
    setToast({ message: "Eliminado del carrito", type: "success", zIndex: 70 });
  };

  const handleClear = () => {
    write(LS.CART, []);
    setToast({ message: "Carrito vaciado", type: "success", zIndex: 70 });
  };

  const total = cartItems.reduce(
    (s, it) => s + (it.precioActual || 0) * (it.cantidad || 1),
    0,
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const [processing, setProcessing] = useState(false);

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => window.history.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Volver"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h2 className="text-xl font-bold">Tu Carrito</h2>
        </div>
        <p>Tu carrito está vacío. Agrega productos desde el catálogo.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => window.history.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Volver"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h2 className="text-xl font-bold">Tu Carrito</h2>
      </div>
      <div className="space-y-4">
        {cartItems.map((it) => (
          <div
            key={it.id}
            className="flex items-center gap-4 border p-3 rounded"
          >
            <img
              src={(it.producto && it.producto.imagen) || it.imagen}
              className="w-20 h-20 object-cover"
              alt=""
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">
                    {(it.producto && it.producto.nombre) || it.nombre}
                  </div>
                  <div className="text-sm text-gray-600">
                    {(it.producto && it.producto.laboratorio) || it.laboratorio}
                  </div>
                </div>
                <div className="text-emerald-600 font-bold text-lg">
                  ${Number(it.precioActual || 0).toFixed(2)}
                </div>
              </div>
              <div className="mt-2">
                {(() => {
                  const stock =
                    (it.producto &&
                      (it.producto.stock ?? it.producto.existencia)) ??
                    0;
                  if (stock === 0)
                    return (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                        Producto agotado
                      </span>
                    );
                  if (stock < 50)
                    return (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
                        Pocas unidades
                      </span>
                    );
                  return null;
                })()}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => changeQty(it.id, -1)}
                  className="px-2 py-1 border rounded"
                >
                  -
                </button>
                <div className="px-3">{it.cantidad}</div>
                {(() => {
                  const stock =
                    (it.producto &&
                      (it.producto.stock ?? it.producto.existencia)) ??
                    0;
                  const disabled = (it.cantidad || 0) >= stock || stock === 0;
                  return (
                    <button
                      onClick={() => changeQty(it.id, 1)}
                      disabled={disabled}
                      className={`px-2 py-1 border rounded ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      +
                    </button>
                  );
                })()}
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => handleRemove(it.id)}
                  className="px-3 py-1 border rounded text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <div className="text-xl font-bold">Total: {formatCurrency(total)}</div>
        <div className="flex gap-2">
          <button onClick={handleClear} className="px-4 py-2 border rounded">
            Vaciar Carrito
          </button>
          <button
            onClick={() => {
              const methods = getPaymentMethods();
              setPaymentMethods(methods || []);
              setSelectedPayment(
                methods && methods.length ? methods[0].value : null,
              );
              setCheckoutOpen(true);
            }}
            className="px-4 py-2 bg-emerald-600 text-white rounded"
          >
            Finalizar Compra
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-3">Confirmar Compra</h3>
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-2">Resumen</div>
              <div className="space-y-2 max-h-40 overflow-auto mb-2">
                {cartItems.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={(it.producto && it.producto.imagen) || it.imagen}
                        alt=""
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <div className="font-semibold">
                          {(it.producto && it.producto.nombre) || it.nombre}
                        </div>
                        <div className="text-xs text-gray-500">
                          {it.cantidad} x {formatCurrency(it.precioActual || 0)}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold">
                      {formatCurrency(
                        (it.precioActual || 0) * (it.cantidad || 1),
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-lg font-bold text-emerald-600">
                  {formatCurrency(total)}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Método de pago
              </label>
              <select
                value={selectedPayment || ""}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">-- Seleccione --</option>
                {paymentMethods.map((m) => (
                  <option key={m.id} value={m.value}>
                    {m.value}
                  </option>
                ))}
              </select>
            </div>

            {checkoutError && (
              <div className="text-sm text-red-600 mb-2">{checkoutError}</div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setCheckoutOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  // Process checkout
                  setCheckoutError(null);
                  setProcessing(true);
                  try {
                    // reload latest products and cart
                    const latestProducts = read(LS.PRODUCTS) || [];
                    const latestCart = read(LS.CART) || [];
                    const normCart = (latestCart || []).map((it) =>
                      it && typeof it === "object"
                        ? it
                        : { id: it, cantidad: 1 },
                    );

                    // Validate stock
                    for (const item of normCart) {
                      const prod = latestProducts.find((p) => p.id === item.id);
                      const available = prod
                        ? (prod.stock ?? prod.existencia ?? 0)
                        : 0;
                      if ((item.cantidad || 0) > available) {
                        setCheckoutError(
                          `Stock insuficiente para ${prod ? prod.nombre || prod.name : item.id}`,
                        );
                        setProcessing(false);
                        return;
                      }
                    }

                    // Deduct stock
                    const updatedProducts = latestProducts.map((p) => {
                      const cartItem = normCart.find((it) => it.id === p.id);
                      if (cartItem) {
                        const newStock = Math.max(
                          0,
                          (p.stock ?? p.existencia ?? 0) -
                            (cartItem.cantidad || 0),
                        );
                        return { ...p, stock: newStock };
                      }
                      return p;
                    });
                    write(LS.PRODUCTS, updatedProducts);

                    // Create order — recompute total using latest product prices
                    const session = read(LS.USER) || {};
                    const computedTotal = normCart.reduce((s, it) => {
                      const prod =
                        latestProducts.find((p) => p.id === it.id) || {};
                      const price =
                        Number(
                          it.precio ??
                            it.precioActual ??
                            prod.precio ??
                            prod.price ??
                            0,
                        ) || 0;
                      return s + price * (it.cantidad || 1);
                    }, 0);

                    const order = {
                      cliente: session.nombre || session.email || "Cliente",
                      documento: session.documento || "",
                      correo: session.email || "",
                      fecha: new Date().toISOString().split("T")[0],
                      productos: normCart.map((it) => {
                        const prod =
                          latestProducts.find((p) => p.id === it.id) || {};
                        const price =
                          Number(
                            it.precio ??
                              it.precioActual ??
                              prod.precio ??
                              prod.price ??
                              0,
                          ) || 0;
                        return {
                          id: it.id,
                          nombre: prod.nombre || prod.name || null,
                          cantidad: it.cantidad || 1,
                          precio: price,
                        };
                      }),
                      total: computedTotal,
                      metodoPago: selectedPayment || null,
                      estado: "Pendiente",
                      origin: "web",
                      creadoPor: "Cliente",
                      notas: "Compra desde web",
                    };
                    ordersService.create(order);

                    // Clear cart
                    write(LS.CART, []);

                    // Push notification
                    pushNotification({
                      title: "Compra exitosa",
                      message:
                        "¡Compra exitosa! Tu pedido ha sido registrado y está en proceso",
                      date: new Date().toISOString(),
                      path: "/client/mis-pedidos",
                    });

                    setProcessing(false);
                    setCheckoutOpen(false);
                    setToast({
                      message: "Compra registrada correctamente",
                      type: "success",
                      zIndex: 70,
                    });
                  } catch {
                    setProcessing(false);
                    setCheckoutError("Error procesando la compra");
                  }
                }}
                disabled={processing || !selectedPayment}
                className={`px-4 py-2 bg-emerald-600 text-white rounded ${processing || !selectedPayment ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {processing ? "Procesando..." : "Confirmar y Pagar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          zIndex={toast.zIndex}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CarritoPage;
