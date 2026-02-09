import React, { useEffect, useState } from 'react';
import { Heart, Plus, ChevronLeft, ChevronRight, Pill, Leaf, Droplet, Sparkles, Search } from 'lucide-react';

// Hero Carousel Data (con imágenes placeholder - reemplaza URLs con imágenes reales)
const heroSlides = [
  {
    id: 1,
    title: '¡De vuelta a un cuerpo sano!',
    subtitle: 'Aprovecha hasta 40% dto en referencias seleccionadas',
    image: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    buttonText: '¡Comprar ahora!',
  },
  {
    id: 2,
    title: 'Suplementos que Transforman',
    subtitle: 'Descubre nuestras marcas premium en vitaminas',
    image: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
    buttonText: '¡Comprar ahora!',
  },
  {
    id: 3,
    title: 'Salud sin Compromiso',
    subtitle: 'Envío gratis en compras mayores a $80.000',
    image: 'linear-gradient(135deg, #6ee7b7 0%, #34d399 100%)',
    buttonText: '¡Comprar ahora!',
  },
];

// Mini-Promos (categorías secundarias)
const miniPromos = [
  {
    id: 1,
    title: 'Proteínas',
    discount: '25%',
    image: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  },
  {
    id: 2,
    title: 'Cuidado Capilar',
    discount: '30%',
    image: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
  },
  {
    id: 3,
    title: 'Para Bebés',
    discount: '20%',
    image: 'linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%)',
  },
];

const categoryButtons = [
  { id: 'medicamentos', icon: Pill, label: 'Medicamentos' },
  { id: 'insumos', icon: Droplet, label: 'Insumos' },
  { id: 'suplementos', icon: Leaf, label: 'Suplementos' },
  { id: 'cuidado', icon: Sparkles, label: 'Cuidado Personal' },
];

// Productos mock
const mockProducts = {
  recomendados: [
    { id: 1, name: 'Paracetamol 500mg', price: 12000, stock: 45, marca: 'Tafirol', category: 'medicamentos' },
    { id: 2, name: 'Ibupirac 400mg', price: 15000, stock: 32, marca: 'Actron', category: 'medicamentos' },
    { id: 3, name: 'Vitamina C 100 cáps', price: 45000, stock: 18, marca: 'Natura', category: 'suplementos' },
    { id: 4, name: 'Algodón 100g', price: 3000, stock: 120, marca: 'Genérico', category: 'insumos' },
    { id: 5, name: 'Suero Fisiológico 500ml', price: 8000, stock: 100, marca: 'Baxter', category: 'insumos' },
    { id: 6, name: 'Mascarilla N95 Premium', price: 5000, stock: 200, marca: '3M', category: 'insumos' },
  ],
  ofertas: [
    { id: 7, name: 'Bloqueador Solar SPF50', price: 42000, discount: 30, stock: 25, marca: 'Coppertone', category: 'cuidado' },
    { id: 8, name: 'Gel Antibacterial 500ml', price: 18000, discount: 20, stock: 60, marca: 'Dettol', category: 'insumos' },
    { id: 9, name: 'Multivitamínico Diario', price: 55000, discount: 15, stock: 40, marca: 'One-a-Day', category: 'suplementos' },
    { id: 10, name: 'Termómetro Digital', price: 85000, discount: 10, stock: 15, marca: 'Omron', category: 'medicamentos' },
  ],
};

const fmt = (v) =>
  v && typeof v === 'number'
    ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v)
    : '$0';

// ========== Component: HeroCarousel ==========
const HeroCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => setCurrent(index);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % heroSlides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);

  const slide = heroSlides[current];

  return (
    <div className="relative w-full bg-gray-200 rounded-xl overflow-hidden mb-8 h-96 shadow-lg">
      {/* Background Image/Gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: slide.image,
        }}
      />

      {/* Overlay Dark */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 z-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
          {slide.title}
        </h1>
        <p className="text-lg md:text-xl mb-8 drop-shadow-md max-w-2xl">
          {slide.subtitle}
        </p>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full transition shadow-lg">
          {slide.buttonText}
        </button>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/50 hover:bg-white text-gray-900 p-2 rounded-full transition"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/50 hover:bg-white text-gray-900 p-2 rounded-full transition"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === current ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// ========== Component: SearchBar ==========
const SearchBar = ({ onSearch, searchValue }) => (
  <div className="mb-8">
    <div className="relative max-w-2xl mx-auto">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
      <input
        type="text"
        placeholder="Busca por nombre, laboratorio, marca..."
        value={searchValue}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
      />
    </div>
  </div>
);

// ========== Component: MiniPromos ==========
const MiniPromos = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
    {miniPromos.map((promo) => (
      <div
        key={promo.id}
        className="relative h-32 rounded-lg overflow-hidden cursor-pointer group shadow-md"
        style={{ background: promo.image }}
      >
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10">
          <p className="text-2xl font-bold">{promo.discount}</p>
          <p className="text-sm font-semibold">{promo.title}</p>
        </div>
      </div>
    ))}
  </div>
);

const ProductCard = ({ product, isFav, onToggleFav, onAdd }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition group">
    {/* Image Area */}
    <div className="relative h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
      <Pill size={56} className="text-gray-300" />
      
      {/* Badge Descuento */}
      {product.discount && (
        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          -{product.discount}%
        </div>
      )}

      {/* Heart Button */}
      <button
        onClick={() => onToggleFav(product.id)}
        className="absolute top-2 left-2 bg-white p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition"
      >
        <Heart size={16} className={isFav ? 'text-red-500 fill-red-500' : 'text-gray-400'} />
      </button>
    </div>

    {/* Info */}
    <div className="p-3 flex flex-col h-40">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{product.marca}</p>
      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mt-1 flex-1">{product.name}</h4>
      
      {/* Stock */}
      <p className={`text-xs mt-2 ${product.stock > 20 ? 'text-emerald-600' : product.stock > 5 ? 'text-yellow-600' : 'text-red-600'}`}>
        {product.stock > 0 ? `${product.stock} en stock` : 'Sin stock'}
      </p>

      {/* Price & Button */}
      <div className="flex items-center justify-between gap-2 mt-3">
        <div className="text-emerald-600 font-bold text-sm">{fmt(product.price)}</div>
        <button
          onClick={() => onAdd(product.id)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded flex items-center gap-1 transition"
        >
          <Plus size={14} /> Añadir
        </button>
      </div>
    </div>
  </div>
);

const CouponBanner = ({ userName }) => {
  const [current, setCurrent] = useState(0);
  const coupons = [
    { code: 'BIENVENIDA10', discount: '10%', category: 'vitaminas', message: `¡Hola ${userName}! Tienes 10% en vitaminas` },
    { code: 'RAPIDO15', discount: '15%', category: 'medicamentos', message: 'Compra rápido: 15% en medicamentos' },
    { code: 'ENVIO20', discount: 'ENVÍO GRATIS', category: 'general', message: 'En compras mayores a $50.000' },
  ];

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-6 px-4 mb-6 rounded-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1">{coupons[current].message}</p>
          <p className="text-xs text-emerald-100">Código: <span className="font-mono font-bold text-white">{coupons[current].code}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrent((prev) => (prev - 1 + coupons.length) % coupons.length)}
            className="p-1 hover:bg-emerald-500 rounded"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => setCurrent((prev) => (prev + 1) % coupons.length)}
            className="p-1 hover:bg-emerald-500 rounded"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ClientCatalogo = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [userName, setUserName] = useState('Usuario');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    // Cargar usuario
    try {
      const user = JSON.parse(localStorage.getItem('syspharma_user') || '{}');
      setUserName(user.nombre || 'Usuario');
    } catch {
      setUserName('Usuario');
    }

    // Cargar favoritos
    try {
      const fav = JSON.parse(localStorage.getItem('syspharma_favorites') || '[]');
      setFavorites(Array.isArray(fav) ? fav : []);
    } catch {
      setFavorites([]);
    }
  }, []);

  const toggleFavorite = (id) => {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem('syspharma_favorites', JSON.stringify(next));
    window.dispatchEvent(new Event('syspharma_favorites_updated'));
  };

  const saveCartAndNotify = (id) => {
    try {
      const saved = JSON.parse(localStorage.getItem('syspharma_cart') || '[]');
      const arr = Array.isArray(saved) ? saved : [];
      arr.push(id);
      localStorage.setItem('syspharma_cart', JSON.stringify(arr));
      window.dispatchEvent(new Event('syspharma_cart_updated'));
    } catch {
      localStorage.setItem('syspharma_cart', JSON.stringify([id]));
      window.dispatchEvent(new Event('syspharma_cart_updated'));
    }
  };

  const filterBySearchAndCategory = (products) => {
    return products.filter((p) => {
      const matchesCategory = !selectedCategory || p.category === selectedCategory;
      const matchesSearch = !searchValue || 
        p.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        p.marca.toLowerCase().includes(searchValue.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  const filteredRecomendados = filterBySearchAndCategory(mockProducts.recomendados);
  const filteredOfertas = filterBySearchAndCategory(mockProducts.ofertas);

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Search Bar */}
        <SearchBar onSearch={setSearchValue} searchValue={searchValue} />

        {/* Mini Promotions */}
        <MiniPromos />

        {/* Category Navigation */}
        <div className="bg-white rounded-lg p-4 mb-8 border border-gray-100">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex flex-col items-center gap-2 px-4 py-2 rounded-lg transition flex-shrink-0 ${
                selectedCategory === null ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Pill size={20} />
              </div>
              <span className="text-xs font-semibold whitespace-nowrap">Todos</span>
            </button>

            {categoryButtons.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setSelectedCategory(id)}
                className={`flex flex-col items-center gap-2 px-4 py-2 rounded-lg transition flex-shrink-0 ${
                  selectedCategory === id ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon size={20} />
                </div>
                <span className="text-xs font-semibold whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Nuestros Recomendados */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Nuestros Recomendados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRecomendados.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFav={favorites.includes(product.id)}
                onToggleFav={toggleFavorite}
                onAdd={saveCartAndNotify}
              />
            ))}
          </div>
        </div>

        {/* Ofertas para ti */}
        {filteredOfertas.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Ofertas para ti</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredOfertas.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFav={favorites.includes(product.id)}
                  onToggleFav={toggleFavorite}
                  onAdd={saveCartAndNotify}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCatalogo;
