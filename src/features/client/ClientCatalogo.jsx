import React, { useEffect, useState } from 'react';
import { Heart, Plus, ChevronLeft, ChevronRight, Pill, Leaf, Droplet, Sparkles, Search } from 'lucide-react';
import ProductCardGrid, { fmt as cardFmt } from './components/ProductCard';

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

const ProductCard = ({ product, isFav, onToggleFav, onAdd }) => {
  // Map from product schema (with campo nombreo, precio, imagen, laboratorio) to ProductCardGrid schema
  const mappedProduct = {
    id: product.id,
    name: product.nombre,
    price: product.precio,
    image: product.imagen || '',
    marca: product.laboratorio || '',
    stock: product.stock ?? product.existencia ?? 0,
  };
  return (
    <ProductCardGrid 
      product={mappedProduct} 
      isFav={isFav} 
      onToggleFav={onToggleFav} 
      onAdd={() => onAdd(product.id)}
      disabled={(product.stock ?? 0) <= 0}
    />
  );
};

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
  const [allProducts, setAllProducts] = useState([]);

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

    // Cargar productos desde localStorage
    try {
      const products = JSON.parse(localStorage.getItem('syspharma_products') || '[]');
      setAllProducts(Array.isArray(products) ? products : []);
    } catch {
      setAllProducts([]);
    }

    // Escuchar actualizaciones de productos
    const handleProductsUpdate = () => {
      try {
        const products = JSON.parse(localStorage.getItem('syspharma_products') || '[]');
        setAllProducts(Array.isArray(products) ? products : []);
      } catch {
        setAllProducts([]);
      }
    };

    window.addEventListener('syspharma_products_updated', handleProductsUpdate);
    return () => {
      window.removeEventListener('syspharma_products_updated', handleProductsUpdate);
    };
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

  const filterBySearchAndCategory = (productList) => {
    return productList.filter((p) => {
      const matchesCategory = !selectedCategory || p.categoria === selectedCategory;
      const matchesSearch = !searchValue || 
        p.nombre.toLowerCase().includes(searchValue.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };

  // Filtros dinámicos basados en los switches del admin
  const productosDestacados = allProducts.filter(p => p.esDestacado);
  const productosEnOferta = allProducts.filter(p => p.enOferta);
  const productosRecomendados = allProducts.filter(p => p.esRecomendado);

  const filteredDestacados = filterBySearchAndCategory(productosDestacados);
  const filteredOfertas = filterBySearchAndCategory(productosEnOferta);
  const filteredRecomendados = filterBySearchAndCategory(productosRecomendados);

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
        {filteredRecomendados.length > 0 ? (
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
        ) : (
          <div className="mb-12 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800 text-sm">
              ℹ️ No hay productos recomendados configurados por el administrador
            </p>
          </div>
        )}

        {/* Destacados */}
        {filteredDestacados.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⭐ Destacados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDestacados.map((product) => (
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

        {/* Ofertas para ti */}
        {filteredOfertas.length > 0 ? (
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
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800 text-sm">
              ℹ️ No hay ofertas disponibles en este momento
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCatalogo;
