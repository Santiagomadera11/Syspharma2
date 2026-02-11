import React, { useEffect, useState } from "react";
import { Plus, Heart, Grid3x3, List, Search, Pill } from "lucide-react";

const fmt = (v) =>
  v && typeof v === "number"
    ? new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v)
    : "$0";

const ProductCardGrid = ({ product, isFav, onToggleFav, onAdd }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition h-full flex flex-col">
    <div className="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden group">
      {product.image ? (
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      ) : (
        <Pill size={48} className="text-gray-300" />
      )}
      <button
        onClick={() => onToggleFav(product.id)}
        className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition"
      >
        <Heart size={18} className={isFav ? "text-red-500 fill-red-500" : "text-gray-400"} />
      </button>
    </div>
    <div className="p-4 flex flex-col flex-1">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800 text-sm line-clamp-2">{product.name}</h4>
        {product.marca && <p className="text-xs text-gray-500 mt-1">{product.marca}</p>}
      </div>
      <div className="text-emerald-600 font-bold text-lg mt-3">{fmt(product.price)}</div>
      <button
        onClick={() => onAdd(product.id)}
        className="mt-3 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition"
      >
        <Plus size={14} /> Añadir
      </button>
    </div>
  </div>
);

const ProductRowList = ({ product, isFav, onToggleFav, onAdd }) => (
  <div className="bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4 hover:shadow-sm transition">
    <div className="h-20 w-20 bg-gray-50 rounded flex-shrink-0 flex items-center justify-center">
      {product.image ? (
        <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded" />
      ) : (
        <Pill size={32} className="text-gray-300" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-gray-800">{product.name}</h4>
      {product.marca && <p className="text-sm text-gray-500">{product.marca}</p>}
    </div>
    <div className="flex items-center gap-3 flex-shrink-0">
      <div className="text-right">
        <div className="text-emerald-600 font-bold text-lg">{fmt(product.price)}</div>
      </div>
      <button
        onClick={() => onToggleFav(product.id)}
        className="p-1 text-gray-400 hover:text-red-500 transition"
      >
        <Heart size={18} className={isFav ? "text-red-500 fill-red-500" : ""} />
      </button>
      <button
        onClick={() => onAdd(product.id)}
        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition"
      >
        <Plus size={14} /> Añadir
      </button>
    </div>
  </div>
);

export const ClientProductos = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

  useEffect(() => {
    // Cargar productos desde localStorage
    try {
      const storedProducts = JSON.parse(localStorage.getItem("syspharma_products") || "[]");
      // Mapear campos del servicio al formato esperado
      const mappedProducts = Array.isArray(storedProducts) ? storedProducts.map(p => ({
        id: p.id,
        name: p.nombre,
        price: p.precio,
        image: p.imagen || "",
        category: p.categoria || "Otros",
        marca: p.laboratorio || "Genérico",
      })) : [];
      setProducts(mappedProducts);
    } catch {
      setProducts([]);
    }

    // Cargar favoritos
    try {
      const fav = JSON.parse(localStorage.getItem("syspharma_favorites") || "[]");
      setFavorites(Array.isArray(fav) ? fav : []);
    } catch {
      setFavorites([]);
    }

    // Escuchar actualizaciones de productos
    const handleProductsUpdate = () => {
      try {
        const storedProducts = JSON.parse(localStorage.getItem("syspharma_products") || "[]");
        const mappedProducts = Array.isArray(storedProducts) ? storedProducts.map(p => ({
          id: p.id,
          name: p.nombre,
          price: p.precio,
          image: p.imagen || "",
          category: p.categoria || "Otros",
          marca: p.laboratorio || "Genérico",
        })) : [];
        setProducts(mappedProducts);
      } catch {
        setProducts([]);
      }
    };

    window.addEventListener("syspharma_products_updated", handleProductsUpdate);
    return () => {
      window.removeEventListener("syspharma_products_updated", handleProductsUpdate);
    };
  }, []);

  const saveCartAndNotify = (id) => {
    try {
      const saved = JSON.parse(localStorage.getItem("syspharma_cart") || "[]");
      const arr = Array.isArray(saved) ? saved : [];
      arr.push(id);
      localStorage.setItem("syspharma_cart", JSON.stringify(arr));
      window.dispatchEvent(new Event("syspharma_cart_updated"));
    } catch {
      localStorage.setItem("syspharma_cart", JSON.stringify([id]));
      window.dispatchEvent(new Event("syspharma_cart_updated"));
    }
  };

  const toggleFavorite = (id) => {
    const next = favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id];
    setFavorites(next);
    localStorage.setItem("syspharma_favorites", JSON.stringify(next));
    window.dispatchEvent(new Event("syspharma_favorites_updated"));
  };

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const maxPrice = Math.max(...products.map((p) => p.price), 500000);

  const filtered = products.filter((p) => {
    const searchMatch = search === "" || 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.marca && p.marca.toLowerCase().includes(search.toLowerCase()));
    const inCategory = categoryFilter ? p.category === categoryFilter : true;
    const inPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    return searchMatch && inCategory && inPrice;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      {/* Search Bar */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o marca..."
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-full focus:outline-none focus:border-emerald-600 transition"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center border border-gray-200 rounded-lg bg-white">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 ${
              viewMode === "grid"
                ? "bg-emerald-600 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Grid3x3 size={18} />
          </button>
          <div className="w-px h-6 bg-gray-200"></div>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 ${
              viewMode === "list"
                ? "bg-emerald-600 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Minimal Filters */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <div className="space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Categoría</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCategoryFilter("")}
                  className={`block text-sm ${
                    categoryFilter === "" ? "font-semibold text-emerald-600" : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Todas
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`block text-sm ${
                      categoryFilter === cat ? "font-semibold text-emerald-600" : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-gray-800 text-sm mb-3">Rango de Precio</h3>
              <div className="flex flex-col gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-full border border-gray-200 px-3 py-2 rounded text-sm focus:outline-none focus:border-emerald-600"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value || 0), priceRange[1]])}
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-full border border-gray-200 px-3 py-2 rounded text-sm focus:outline-none focus:border-emerald-600"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value || maxPrice)])}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-100">
              <p className="text-gray-500">No productos encontrados</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((p) => (
                <ProductCardGrid
                  key={p.id}
                  product={p}
                  isFav={favorites.includes(p.id)}
                  onToggleFav={toggleFavorite}
                  onAdd={saveCartAndNotify}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <ProductRowList
                  key={p.id}
                  product={p}
                  isFav={favorites.includes(p.id)}
                  onToggleFav={toggleFavorite}
                  onAdd={saveCartAndNotify}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientProductos;
