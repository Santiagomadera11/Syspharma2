import React from "react";
import { X, User, CreditCard, Package, CheckCircle, RotateCcw, XCircle, Receipt, Clock } from "lucide-react";

const ESTADO_CONFIG = {
  completada:  { label: "Completada",  icon: CheckCircle, bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", iconColor: "text-emerald-500" },
  devolucion:  { label: "Devolución",  icon: RotateCcw,   bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   iconColor: "text-amber-500"   },
  anulada:     { label: "Anulada",     icon: XCircle,     bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     iconColor: "text-red-500"     },
  pendiente:   { label: "Pendiente",   icon: Clock,       bg: "bg-blue-50",    border: "border-blue-200",    text: "text-blue-700",    iconColor: "text-blue-500"    },
};

const fmt = (v) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v || 0);

export const SaleDetailModal = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  // Normalizar estado desde backend (estadoNombre) o legacy (estado)
  const estadoKey = (sale.estadoNombre || sale.estado || "completada").toLowerCase();
  const estado = ESTADO_CONFIG[estadoKey] || ESTADO_CONFIG.completada;
  const EstadoIcon = estado.icon;

  // Normalizar campos backend vs legacy
  const cliente      = sale.clienteNombre  || sale.cliente  || "Consumidor Final";
  const metodoPago   = sale.metodoPagoNombre || sale.metodoPago || "-";
  const numeroVenta  = sale.numeroVenta    || sale.id        || "-";
  const fechaVenta   = sale.fechaVenta
    ? new Date(sale.fechaVenta).toLocaleDateString("es-CO") + " · " + new Date(sale.fechaVenta).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })
    : (sale.fecha && sale.hora ? `${sale.fecha} · ${sale.hora}` : "-");

  // Detalles desde backend o legacy
  const detalles = sale.detalles?.length > 0
    ? sale.detalles.map(d => ({
        nombre:   d.productoNombre || d.nombre || "Producto",
        cantidad: d.cantidad,
        precio:   d.precioUnitario || d.precio,
        subtotal: d.subtotal || d.cantidad * d.precioUnitario,
      }))
    : (sale.productos || []).map(p => ({
        nombre:   p.nombre,
        cantidad: p.cantidad,
        precio:   p.precio,
        subtotal: p.precio * p.cantidad,
      }));

  const totalProductos = detalles.reduce((s, d) => s + d.cantidad, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Receipt size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-[10px] font-semibold uppercase tracking-wider">Comprobante de venta</p>
              <p className="text-white font-black text-sm">{numeroVenta}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Estado badge */}
        <div className={`px-5 py-2.5 flex items-center gap-2 border-b ${estado.bg} ${estado.border}`}>
          <EstadoIcon size={14} className={estado.iconColor} />
          <span className={`text-xs font-bold ${estado.text}`}>{estado.label}</span>
          <span className="text-gray-400 text-xs ml-auto">{fechaVenta}</span>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* Info cliente y pago */}
          <div className="p-5 grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2.5">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User size={14} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Cliente</p>
                <p className="text-sm font-bold text-gray-800 truncate">{cliente}</p>
                {(sale.clienteDocumento || sale.documento) && (
                  <p className="text-[10px] text-gray-400">{sale.clienteDocumento || sale.documento}</p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2.5">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard size={14} className="text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Método de pago</p>
                <p className="text-sm font-bold text-gray-800 truncate">{metodoPago}</p>
              </div>
            </div>
          </div>

          {/* Productos/Detalles */}
          <div className="px-5 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <Package size={14} className="text-gray-400" />
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Productos</p>
              <span className="ml-auto text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {totalProductos} unidades
              </span>
            </div>

            <div className="space-y-2">
              {detalles.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Sin detalles disponibles</p>
              ) : (
                detalles.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 text-emerald-700 font-black text-xs">
                        {item.cantidad}x
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{item.nombre}</p>
                        <p className="text-[10px] text-gray-400">{fmt(item.precio)} c/u</p>
                      </div>
                    </div>
                    <p className="text-sm font-black text-gray-900 ml-3 flex-shrink-0">{fmt(item.subtotal)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* IVA si aplica */}
          {sale.iva > 0 && (
            <div className="px-5 pb-3">
              <div className="flex justify-between text-xs text-gray-500 px-1">
                <span>Subtotal</span><span>{fmt(sale.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 px-1 mt-1">
                <span>IVA ({sale.porcentajeIva}%)</span><span>{fmt(sale.iva)}</span>
              </div>
            </div>
          )}

          {/* Notas */}
          {sale.notas && (
            <div className="px-5 pb-3">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1">Notas</p>
                <p className="text-xs text-gray-600">{sale.notas}</p>
              </div>
            </div>
          )}

          {/* Usuario que realizó la venta */}
          {(sale.usuarioNombre) && (
            <div className="px-5 pb-3">
              <p className="text-[10px] text-gray-400">Atendido por: <span className="font-bold text-gray-600">{sale.usuarioNombre}</span></p>
            </div>
          )}
        </div>

        {/* Footer total */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-gray-50/50">
          <div className="px-5 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Total pagado</p>
              <p className="text-2xl font-black text-emerald-600">{fmt(sale.total)}</p>
            </div>
            <button onClick={onClose}
              className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailModal;