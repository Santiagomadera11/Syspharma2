import React, { useEffect, useState } from "react";
import { Plus, Heart, Grid3x3, List, Search, Pill } from "lucide-react";
import { LS, read, write } from '../../shared/services/lsService';
import { ToastNotification } from '../../shared/ui/ToastNotification';
import ProductCardGrid, { ProductRowList, fmt as cardFmt } from './components/ProductCard';

const ClientProductos = () => {
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
  const [cartCounts, setCartCounts] = useState({});
  const [notification, setNotification] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const load = () => {
      try {
        const storedProducts = JSON.parse(localStorage.getItem("syspharma_products") || "[]");
        const mappedProducts = Array.isArray(storedProducts) ? storedProducts.map(p => ({
          id: p.id,
          name: p.nombre,
          price: p.precio,
          image: p.imagen || "",
          category: p.categoria || "Otros",
          marca: p.laboratorio || "Genérico",
          stock: p.stock ?? p.existencia ?? 0,
        })) : [];
        setProducts(mappedProducts);
      } catch {
        setProducts([]);
      }

      try {
        const fav = read(LS.FAVORITES) || [];
        setFavorites(Array.isArray(fav) ? fav : []);
      } catch {
        setFavorites([]);
      }
    };

    load();

    const handleProductsUpdate = () => load();
    window.addEventListener(`${LS.PRODUCTS}_updated`, handleProductsUpdate);
    return () => window.removeEventListener(`${LS.PRODUCTS}_updated`, handleProductsUpdate);
  }, []);

  useEffect(() => {
    const loadCartCounts = () => {
      try {
        const saved = read(LS.CART) || [];
        const arr = (saved || []).map((it) => (it && typeof it === 'object' ? it : { id: it, cantidad: 1 }));
        const map = {};
        arr.forEach((it) => { map[it.id] = (map[it.id] || 0) + (it.cantidad || 1); });
        setCartCounts(map);
      } catch {
        setCartCounts({});
      }
    };

    loadCartCounts();
    window.addEventListener(`${LS.CART}_updated`, loadCartCounts);
    window.addEventListener(`${LS.PRODUCTS}_updated`, loadCartCounts);
    return () => {
      window.removeEventListener(`${LS.CART}_updated`, loadCartCounts);
      window.removeEventListener(`${LS.PRODUCTS}_updated`, loadCartCounts);
    };
  }, []);

  const saveCartAndNotify = (id) => {
    const raw = read(LS.CART) || [];
    const prods = products || [];
    const prod = prods.find((p) => p.id === id || p.id === Number(id));
    const stock = prod ? (prod.stock ?? 0) : 0;

    const arr = (raw || []).map((it) => (it && typeof it === 'object' ? it : { id: it, cantidad: 1 }));
    const existing = arr.find((it) => it.id === id);
    const currentQty = existing ? existing.cantidad : 0;
    if (currentQty >= stock) {
      setNotification('Stock máximo alcanzado');
      setTimeout(() => setNotification(null), 2500);
      return;
    }

    if (existing) {
      existing.cantidad = Math.min(stock, existing.cantidad + 1);
      existing.precio = Number(prod ? prod.price ?? prod.precio ?? existing.precio : existing.precio) || 0;
    } else {
      arr.push({ id, cantidad: 1, precio: Number(prod ? prod.price ?? prod.precio ?? 0 : 0) || 0 });
    }

    write(LS.CART, arr);
    setToast({ message: 'Producto añadido al carrito', type: 'success', zIndex: 70 });
  };

  const toggleFavorite = (id) => {
    try {
      const raw = read(LS.FAVORITES) || [];
      const arr = Array.isArray(raw) ? raw : [];
      const exists = arr.find((it) => (it && typeof it === 'object' ? it.id === id : it === id));
      let next;
      if (exists) next = arr.filter((it) => (it && typeof it === 'object' ? it.id !== id : it !== id));
      else next = [...arr, id];
      write(LS.FAVORITES, next);
    } catch {
      write(LS.FAVORITES, [id]);
    }
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
                  isFav={favorites.some(f => (f && typeof f === 'object') ? f.id === p.id : f === p.id)}
                  onToggleFav={toggleFavorite}
                  onAdd={saveCartAndNotify}
                  disabled={(cartCounts[p.id] || 0) >= (p.stock || 0) || (p.stock || 0) <= 0}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((p) => (
                <ProductRowList
                  key={p.id}
                  product={p}
                  isFav={favorites.some(f => (f && typeof f === 'object') ? f.id === p.id : f === p.id)}
                  onToggleFav={toggleFavorite}
                  onAdd={saveCartAndNotify}
                  disabled={(cartCounts[p.id] || 0) >= (p.stock || 0) || (p.stock || 0) <= 0}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    {toast && (
      <ToastNotification message={toast.message} type={toast.type} zIndex={toast.zIndex} onClose={() => setToast(null)} />
    )}
    </div>
  );
};

export default ClientProductos;
