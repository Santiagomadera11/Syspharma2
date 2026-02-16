import React from "react";
import { Plus, Heart, Pill } from "lucide-react";

export const fmt = (v) => {
  const n = Number(v) || 0;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
};

export const ProductCardGrid = ({
  product,
  isFav,
  onToggleFav,
  onAdd,
  onQuickBuy,
  onOpenDetail,
  disabled,
  children,
}) => (
  <div
    className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition h-full flex flex-col relative cursor-pointer"
    onClick={() => onOpenDetail && onOpenDetail(product)}
    role={onOpenDetail ? "button" : undefined}
    tabIndex={onOpenDetail ? 0 : undefined}
    onKeyDown={(e) => {
      if (onOpenDetail && (e.key === "Enter" || e.key === " "))
        onOpenDetail(product);
    }}
  >
    <div className="relative h-40 bg-gray-50 flex items-center justify-center overflow-hidden group">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <Pill size={48} className="text-gray-300" />
      )}
      {!children && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav && onToggleFav(product.id);
          }}
          className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow opacity-0 group-hover:opacity-100 transition"
        >
          <Heart
            size={18}
            className={isFav ? "text-red-500 fill-red-500" : "text-gray-400"}
          />
        </button>
      )}
    </div>
    <div className="p-4 flex flex-col flex-1">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-800 text-sm line-clamp-2">
          {product.name}
        </h4>
        {product.marca && (
          <p className="text-xs text-gray-500 mt-1">{product.marca}</p>
        )}
        {typeof product.stock !== "undefined" && (
          <div className="mt-2">
            {product.stock === 0 ? (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                Producto agotado
              </span>
            ) : product.stock < 50 ? (
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
                Pocas unidades
              </span>
            ) : null}
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="text-emerald-600 font-semibold text-lg">
          {fmt(product.price ?? product.precio ?? product.precioActual)}
        </div>
      </div>

      {/* Actions: children override default small overlay actions */}
      {children ? (
        <div className="mt-3">{children}</div>
      ) : (
        <div className="mt-3 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd && onAdd(product.id);
              }}
              disabled={disabled}
              className={`${disabled ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white"} p-2 rounded-full transition shadow-sm`}
              title={disabled ? "Stock máximo alcanzado" : "Añadir"}
            >
              <Plus size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickBuy ? onQuickBuy(product) : onAdd && onAdd(product.id);
              }}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow-sm"
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
      )}
    </div>
  </div>
);

export const ProductRowList = ({
  product,
  isFav,
  onToggleFav,
  onAdd,
  disabled,
  children,
}) => (
  <div className="bg-white border border-gray-100 rounded-lg p-4 flex items-center gap-4 hover:shadow-sm transition">
    <div className="h-20 w-20 bg-gray-50 rounded flex-shrink-0 flex items-center justify-center">
      {product.image ? (
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover rounded"
        />
      ) : (
        <Pill size={32} className="text-gray-300" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-gray-800">{product.name}</h4>
      {product.marca && (
        <p className="text-sm text-gray-500">{product.marca}</p>
      )}
      {typeof product.stock !== "undefined" && (
        <div className="mt-1">
          {product.stock === 0 ? (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
              Producto agotado
            </span>
          ) : product.stock < 50 ? (
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-medium">
              Pocas unidades
            </span>
          ) : null}
        </div>
      )}
    </div>
    <div className="flex items-center gap-3 flex-shrink-0">
      <div className="text-right">
        <div className="text-emerald-600 font-bold text-lg">
          {fmt(product.price)}
        </div>
      </div>
      {!children && (
        <>
          <button
            onClick={() => onToggleFav && onToggleFav(product.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition"
          >
            <Heart
              size={18}
              className={isFav ? "text-red-500 fill-red-500" : ""}
            />
          </button>
          <button
            onClick={() => onAdd && onAdd(product.id)}
            disabled={disabled}
            className={`${disabled ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700 text-white"} px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition`}
          >
            <Plus size={14} /> {disabled ? "Stock máximo alcanzado" : "Añadir"}
          </button>
        </>
      )}
      {children}
    </div>
  </div>
);

export default ProductCardGrid;
