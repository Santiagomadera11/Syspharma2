import React, { useState } from 'react';
import { Heart, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const todosLosProductos = [
  { id: 1, nombre: "Acetaminofén 500mg", laboratorio: "Genfar", precio: 2500, imagen: "💊" },
  { id: 2, nombre: "Dolex Forte", laboratorio: "GSK", precio: 8000, imagen: "💊" },
  { id: 3, nombre: "Vitamina C", laboratorio: "MK", precio: 12000, imagen: "🍊" },
  { id: 4, nombre: "Suero Oral", laboratorio: "Pedialyte", precio: 9500, imagen: "💧" },
  { id: 5, nombre: "Ibuprofeno", laboratorio: "La Sante", precio: 3200, imagen: "💊" },
  { id: 6, nombre: "Aspirina 100mg", laboratorio: "Bayer", precio: 15000, imagen: "❤️" },
];

export const FeaturedProducts = () => {
  const [paginaActual, setPaginaActual] = useState(0);
  const productosPorPagina = 4;

  const inicio = paginaActual * productosPorPagina;
  const fin = inicio + productosPorPagina;
  const productosVisibles = todosLosProductos.slice(inicio, fin);
  const totalPaginas = Math.ceil(todosLosProductos.length / productosPorPagina);

  return (
    // Reducimos el padding vertical a py-8
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

        {/* Grid compacta gap-4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[280px]"> 
          {productosVisibles.map((producto) => (
            <div key={producto.id} className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col h-full">
              
              <button className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full text-gray-400 hover:text-red-500 shadow-sm z-10">
                <Heart size={14} />
              </button>

              {/* Imagen más pequeña h-32 */}
              <div className="h-32 bg-gray-50 flex items-center justify-center p-2 group-hover:bg-primary-50 transition-colors">
                <div className="text-4xl">{producto.imagen}</div>
              </div>

              <div className="p-3 flex-1 flex flex-col">
                <p className="text-[10px] text-primary-400 font-semibold">{producto.laboratorio}</p>
                <h3 className="text-gray-800 font-bold text-sm mb-1 truncate">{producto.nombre}</h3>
                
                <div className="flex gap-0.5 mb-2">
                  {[1,2,3,4,5].map(i => <Star key={i} size={8} className="text-yellow-400 fill-yellow-400" />)}
                </div>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-base font-bold text-primary-900">${producto.precio.toLocaleString()}</span>
                  <button className="bg-primary-100 text-primary-600 hover:bg-primary-400 hover:text-white p-1.5 rounded-lg transition-all shadow-sm">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};