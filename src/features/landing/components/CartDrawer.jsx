import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, CheckCircle, Loader2, Package } from 'lucide-react';
import useCart from '../../../shared/context/CartContext';
import { ordersService } from '../../sales/orders/services/ordersService';
import { toast } from 'sonner';

export const CartDrawer = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart, setIsCartOpen, isCartOpen } = useCart();
  const [isCheckout, setIsCheckout] = useState(false);
  const [customerData, setCustomerData] = useState({ nombre: '', telefono: '', direccion: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const handleCheckout = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const orderData = {
          cliente: `${customerData.nombre}`,
          documento: '',
          productos: cartItems,
          total: cartTotal,
          notas: '',
          telefono: customerData.telefono,
          direccion: customerData.direccion,
          origin: 'web',
          creadoPor: 'Invitado',
        };

        ordersService.create(orderData);

        // ordersService already dispatches required events; keep for backward compat
        try { window.dispatchEvent(new CustomEvent('syspharma_orders_updated', { detail: {} })); } catch (e) {}
        try { window.dispatchEvent(new Event('syspharma_orders_updated')); } catch (e) {}
        try { window.dispatchEvent(new Event('storage')); } catch (e) {}

        clearCart();
        setIsSubmitting(false);
        setIsCheckout(false);
        setIsCartOpen(false);
        toast.success('¡Pedido realizado con éxito!');
      } catch (e) {
        console.error('Error creating order from cart:', e);
        setIsSubmitting(false);
        toast.error('Error al procesar el pedido');
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>

      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><ShoppingBag className="text-emerald-600"/> Tu Carrito</h2>
          <button onClick={() => { setIsCartOpen(false); }} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag size={64} className="mb-4 opacity-20"/>
              <p>Tu carrito está vacío</p>
              <button onClick={() => { setIsCartOpen(false); }} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">Ver productos</button>
            </div>
          ) : isCheckout ? (
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 animate-in fade-in">
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-4">Completa tus datos para enviarte el pedido. Pago contra entrega.</div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
                <input required type="text" className="w-full border rounded-lg p-2 text-sm" placeholder="Tu nombre" value={customerData.nombre} onChange={e => setCustomerData({...customerData, nombre: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
                <input required type="tel" className="w-full border rounded-lg p-2 text-sm" placeholder="WhatsApp / Celular" value={customerData.telefono} onChange={e => setCustomerData({...customerData, telefono: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Dirección</label>
                <textarea required rows="3" className="w-full border rounded-lg p-2 text-sm resize-none" placeholder="Dirección exacta de entrega" value={customerData.direccion} onChange={e => setCustomerData({...customerData, direccion: e.target.value})} />
              </div>
              <button type="button" onClick={() => setIsCheckout(false)} className="text-sm text-gray-500 hover:underline">Volver al carrito</button>
            </form>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.imagen ? <img src={item.imagen} alt="" className="h-12 object-contain"/> : <Package size={24} className="text-gray-400"/>}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-sm line-clamp-1">{item.nombre}</h3>
                    <p className="text-emerald-600 font-bold text-sm">$ {Number(item.precio).toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-red-500"><Minus size={14}/></button>
                        <span className="text-xs font-bold w-4 text-center">{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-green-500"><Plus size={14}/></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-5 border-t bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 font-medium">Total:</span>
              <span className="text-2xl font-bold text-emerald-600">$ {cartTotal.toLocaleString()}</span>
            </div>
            {isCheckout ? (
              <button type="submit" form="checkout-form" disabled={isSubmitting} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70">{isSubmitting ? <Loader2 className="animate-spin"/> : <CheckCircle/>} Confirmar Pedido</button>
            ) : (
              <div className="space-y-2">
                <button onClick={() => setIsCheckout(true)} className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold shadow-lg transition-all active:scale-95">Continuar Compra</button>
                <button onClick={() => { clearCart(); toast('Carrito vaciado'); }} className="w-full py-2 text-sm text-gray-600 hover:underline">Vaciar carrito</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
