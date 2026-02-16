import React, { useState } from 'react';
import { Heart, Plus, Star, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useCrud } from '../../../shared/hooks/useCrud';
import ProductDetailModal from '../../../shared/ui/ProductDetailModal';
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
            const title = producto.nombre || producto.name || 'Producto';
            const brand = producto.laboratorio || producto.proveedor || producto.marca || '';
            const price = Number(producto.precio ?? producto.price ?? 0);
            const img = producto.imagen || producto.image || null;

            return (
              <div key={producto.id || title}
                   onClick={() => setSelectedProduct(producto)}
                   role="button"
                   tabIndex={0}
                   onKeyDown={(e) => { if (e.key === 'Enter') setSelectedProduct(producto); }}
                   className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col h-full cursor-pointer">
                <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-gray-400 hover:text-red-500 shadow-sm z-10">
                  <Heart size={14} />
                </button>

                <div className="h-32 bg-gray-50 flex items-center justify-center p-2 group-hover:bg-primary-50 transition-colors">
                  {img ? (
                    <img src={img} alt={title} className="max-h-24 object-contain" />
                  ) : (
                    <div className="text-4xl">{producto.icono || '💊'}</div>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <p className="text-[10px] text-primary-400 font-semibold">{brand}</p>
                  <h3 className="text-gray-800 font-bold text-sm mb-1 truncate">{title}</h3>

                  <div className="flex gap-0.5 mb-2">
                    {[1,2,3,4,5].map(i => <Star key={i} size={8} className="text-yellow-400 fill-yellow-400" />)}
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-base font-bold text-primary-900">${price.toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      <button className="bg-primary-100 text-primary-600 hover:bg-primary-400 hover:text-white p-1.5 rounded-lg transition-all shadow-sm">
                        <Plus size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setGuestProduct(producto); setIsGuestModalOpen(true); }} title="Comprar ahora" className="bg-blue-600 text-white p-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
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