import React, { useState, useEffect } from "react";
import { Heart, Search, Plus } from "lucide-react";
import useCart from "../../../shared/context/CartContext";
import GuestOrderModal from "./GuestOrderModal";
import ProductDetailModal from "../../../shared/ui/ProductDetailModal";
import { toast } from "../../../shared/utils/toast";

export const CatalogProductsSection = () => {
  // Estado para productos originales (lista completa sin modificar)
  const [productosOriginales, setProductosOriginales] = useState([]);
  // Estado para productos filtrados
  const [filteredProducts, setFilteredProducts] = useState([]);
  // Array de categorías disponibles
  const [categorias, setCategorias] = useState([]);
  // Filtros
  const [searchValue, setSearchValue] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [guestProduct, setGuestProduct] = useState(null);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const cart = useCart();

  // Cargar productos y categorías del localStorage al montar el componente
  useEffect(() => {
    cargarDatos();
    window.addEventListener("syspharma_products_updated", cargarDatos);

    return () => {
      window.removeEventListener("syspharma_products_updated", cargarDatos);
    };
  }, []);

  const cargarDatos = () => {
    try {
      // Obtener productos del localStorage
      const products = JSON.parse(
        localStorage.getItem("syspharma_products") || "[]",
      );

      console.log("📦 Datos RAW de localStorage:", products);

      // Filtrar solo productos activos (estado === true)
      const activeProducts = products.filter((p) => p.estado === true);

      console.log("✅ Productos activos:", activeProducts.length);
      if (activeProducts.length > 0) {
        console.log("📋 Primer producto:", activeProducts[0]);
      }

      // Guardar en estado original
      setProductosOriginales(activeProducts);

      // Extraer categorías únicas de los productos activos
      const uniqueCategories = [
        ...new Set(activeProducts.map((p) => p.categoria).filter(Boolean)),
      ].sort();

      setCategorias(uniqueCategories);

      console.log("📂 Categorías encontradas:", uniqueCategories);
    } catch (error) {
      console.error("❌ Error loading products:", error);
      setProductosOriginales([]);
      setCategorias([]);
    }

    // Cargar favoritos
    try {
      const fav = JSON.parse(
        localStorage.getItem("syspharma_favorites") || "[]",
      );
      setFavorites(Array.isArray(fav) ? fav : []);
    } catch {
      setFavorites([]);
    }
  };

  // FUNCIÓN ÚNICA DE FILTRADO: aplica todos los filtros simultáneamente
  const filtrarProductos = () => {
    const filtered = productosOriginales.filter((product) => {
      // Filtro 1: Búsqueda por nombre
      const matchesSearch =
        !searchValue ||
        (product.nombre &&
          product.nombre.toLowerCase().includes(searchValue.toLowerCase()));

      // Filtro 2: Categoría (si no es "Todas", filtra por la categoría seleccionada)
      const matchesCategory =
        categoriaSeleccionada === "Todas" ||
        product.categoria === categoriaSeleccionada;

      // Filtro 3: Rango de precio
      const matchesPrice =
        product.precio >= priceRange[0] && product.precio <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    });

    setFilteredProducts(filtered);
  };

  // Ejecutar filtrado cuando cambien los filtros
  useEffect(() => {
    filtrarProductos();
  }, [searchValue, categoriaSeleccionada, priceRange, productosOriginales]);

  const handleCategoryChange = (category) => {
    setCategoriaSeleccionada(category);
  };

  // Función para aplicar el filtro de precio - convierte números y valida
  const applyPriceFilter = () => {
    // Quitar $ y espacios si existen y convertir a números
    const minStr = minPriceInput
      ? String(minPriceInput).replace(/[$\s,]/g, "")
      : "0";
    const maxStr = maxPriceInput
      ? String(maxPriceInput).replace(/[$\s,]/g, "")
      : "500000";

    const min = parseInt(minStr) || 0;
    const max = parseInt(maxStr) || 500000;

    // Asegurar que min no sea mayor a max
    if (min > max) {
      toast("El precio mínimo no puede ser mayor al máximo", "error");
      return;
    }

    setPriceRange([min, max]);
  };

  const clearFilters = () => {
    setSearchValue("");
    setCategoriaSeleccionada("Todas");
    setPriceRange([0, 500000]);
    setMinPriceInput("");
    setMaxPriceInput("");
  };

  const toggleFavorite = (id) => {
    const next = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(next);
    localStorage.setItem("syspharma_favorites", JSON.stringify(next));
    window.dispatchEvent(new Event("syspharma_favorites_updated"));
  };

  const ProductCard = ({ product }) => {
    const isFav = favorites.includes(product.id);
    const isOutOfStock = (product.stockTotal || 0) <= 0;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition h-full flex flex-col">
        {/* Imagen */}
        <div className="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden group">
          {product.imagen ? (
            <img
              src={product.imagen}
              alt={product.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-gray-300 text-sm">Sin imagen</div>
          )}

          {/* Overlay de agotado */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold">Agotado</span>
            </div>
          )}

          {/* Botón Favorito */}
          <button
            onClick={() => toggleFavorite(product.id)}
            className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition"
          >
            <Heart
              size={18}
              className={isFav ? "text-red-500 fill-red-500" : "text-gray-400"}
            />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1">
            {/* Nombre */}
            <h4 className="font-semibold text-gray-800 text-sm line-clamp-2">
              {product.nombre}
            </h4>

            {/* Laboratorio/Marca */}
            {product.laboratorio && (
              <p className="text-xs text-gray-500 mt-1">
                {product.laboratorio}
              </p>
            )}

            {/* Stock Status */}
            {typeof product.stockTotal !== "undefined" && (
              <div className="mt-2">
                {product.stockTotal === 0 ? (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                    Producto agotado
                  </span>
                ) : product.stockTotal < 50 ? (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
                    Pocas unidades
                  </span>
                ) : null}
              </div>
            )}
          </div>

          {/* Precio */}
          <div className="mt-3">
            <div className="text-emerald-600 font-semibold text-lg">
              ${(product.precio || 0).toLocaleString("es-CO")}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-3 flex items-center justify-between">
            <div />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedProduct(product)}
                disabled={isOutOfStock}
                className={`${
                  isOutOfStock
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                } p-2 rounded-full transition shadow-sm`}
                title={isOutOfStock ? "Stock máximo alcanzado" : "Ver detalles"}
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => {
                  if (isOutOfStock) return;
                  setGuestProduct(product);
                  setIsGuestModalOpen(true);
                }}
                disabled={isOutOfStock}
                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow-sm disabled:bg-gray-300"
                title="Comprar ahora"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6h15l-1.5 9h-13L4 2H2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ASIDE - SIDEBAR DE FILTROS */}
      <aside className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto hidden lg:block">
        <h2 className="text-lg font-bold text-gray-900 mb-8">Filtros</h2>

        {/* CATEGORÍAS */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wide">
            Categorías
          </h3>
          <div className="space-y-3">
            {/* Opción "Todas" */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="categoria"
                value="Todas"
                checked={categoriaSeleccionada === "Todas"}
                onChange={() => handleCategoryChange("Todas")}
                className="w-4 h-4 text-emerald-600 cursor-pointer"
              />
              <span className="text-gray-700 text-sm group-hover:text-emerald-600 transition font-medium">
                Todas
              </span>
            </label>

            {/* Categorías dinámicas */}
            {categorias.map((categoria) => (
              <label
                key={categoria}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="categoria"
                  value={categoria}
                  checked={categoriaSeleccionada === categoria}
                  onChange={() => handleCategoryChange(categoria)}
                  className="w-4 h-4 text-emerald-600 cursor-pointer"
                />
                <span className="text-gray-700 text-sm group-hover:text-emerald-600 transition capitalize">
                  {categoria}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* RANGO DE PRECIO */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wide">
            Rango de Precio
          </h3>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Mínimo"
              value={minPriceInput}
              onChange={(e) => setMinPriceInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="number"
              placeholder="Máximo"
              value={maxPriceInput}
              onChange={(e) => setMaxPriceInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={applyPriceFilter}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded text-sm font-medium transition"
            >
              Aplicar
            </button>
            <button
              onClick={() => {
                setMinPriceInput("");
                setMaxPriceInput("");
                setPriceRange([0, 500000]);
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded text-sm font-medium transition"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* LIMPIAR TODOS LOS FILTROS */}
        <button
          onClick={clearFilters}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded text-sm font-medium transition"
        >
          Limpiar Filtros
        </button>
      </aside>

      {/* MAIN - CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col">
        {/* BUSCADOR SUPERIOR */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 p-6 overflow-auto">
          {/* CONTADOR */}
          {filteredProducts.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Mostrando{" "}
                <span className="font-semibold text-gray-900">
                  {filteredProducts.length}
                </span>{" "}
                de{" "}
                <span className="font-semibold text-gray-900">
                  {productosOriginales.length}
                </span>{" "}
                productos
              </p>
            </div>
          )}

          {/* GRID DE PRODUCTOS */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <p className="text-gray-500 text-lg">
                  No hay productos que coincidan con los filtros
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODALES */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
      {guestProduct && (
        <GuestOrderModal
          isOpen={isGuestModalOpen}
          onClose={() => {
            setIsGuestModalOpen(false);
            setGuestProduct(null);
          }}
          product={guestProduct}
        />
      )}
    </div>
  );
};

export default CatalogProductsSection;
