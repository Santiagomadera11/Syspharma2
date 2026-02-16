import React, { useState } from 'react';
import { Heart, Plus, Star, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useCrud } from '../../../shared/hooks/useCrud';
import ProductDetailModal from '../../../shared/ui/ProductDetailModal';
import ProductCardGrid from '../../client/components/ProductCard';
import useCart from '../../../shared/context/CartContext';
import GuestOrderModal from './GuestOrderModal';

export const FeaturedProducts = () => {
  const [paginaActual, setPaginaActual] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [guestProduct, setGuestProduct] = useState(null);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const productosPorPagina = 4;

  const { items: productos } = useCrud('syspharma_products', []);

  // Preferir productos marcados como destacados si existen
  const destacados = (productos || []).filter(p => p.esDestacado === true);
  const lista = (destacados && destacados.length > 0) ? destacados : (productos || []);

  const inicio = paginaActual * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosVisibles = lista.slice(inicio, fin);
  const totalPaginas = Math.max(1, Math.ceil(lista.length / productosPorPagina));

  return (
    <section className="py-8 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-primary-400 font-bold uppercase tracking-wider text-[10px]">Farmacia Online</span>
            <h2 className="text-xl font-bold text-primary-900">Destacados</h2>
          </div>

          <div className="flex gap-1">
            <button onClick={() => paginaActual > 0 && setPaginaActual(p => p - 1)} className="p-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => paginaActual < totalPaginas - 1 && setPaginaActual(p => p + 1)} className="p-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[280px]"> 
          {productosVisibles.map((producto) => {
            const mapped = {
              id: producto.id,
              name: producto.nombre || producto.name || 'Producto',
              marca: producto.laboratorio || producto.proveedor || producto.marca || '',
              price: Number(producto.precio ?? producto.price ?? 0),
              image: producto.imagen || producto.image || null,
              stock: producto.stock ?? producto.existencia ?? 0,
            };

            const cart = useCart();
            return (
              <div key={producto.id || producto.nombre}>
                <ProductCardGrid
                  product={mapped}
                  onOpenDetail={() => setSelectedProduct(producto)}
                  onAdd={() => { try { cart.addToCart(producto); } catch(e) { console.error(e); } }}
                  onQuickBuy={() => { setGuestProduct(producto); setIsGuestModalOpen(true); }}
                />
              </div>
            );
          })}
        </div>
          {selectedProduct && (
            <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
          )}
          {guestProduct && (
            <GuestOrderModal isOpen={isGuestModalOpen} onClose={() => { setIsGuestModalOpen(false); setGuestProduct(null); }} product={guestProduct} />
          )}
      </div>
    </section>
  );
};