import React, { useEffect, useState } from "react";
import { Bell, Menu, Stethoscope, ShoppingCart, Heart } from "lucide-react";

export const ClientHeader = ({ onMenuClick }) => {
  const [user, setUser] = useState({ nombre: "Usuario", rol: "Cliente" });
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem("syspharma_user");
    if (storedUser) setUser(JSON.parse(storedUser));

    const loadCart = () => {
      try {
        const saved = localStorage.getItem("syspharma_cart");
        const parsed = saved ? JSON.parse(saved) : [];
        setCartCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch {
        setCartCount(0);
      }
    };

    const loadFavorites = () => {
      try {
        const saved = localStorage.getItem("syspharma_favorites");
        const parsed = saved ? JSON.parse(saved) : [];
        setFavCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch {
        setFavCount(0);
      }
    };

    loadCart();
    loadFavorites();

    const cartHandler = () => loadCart();
    const favHandler = () => loadFavorites();
    window.addEventListener("syspharma_cart_updated", cartHandler);
    window.addEventListener("syspharma_favorites_updated", favHandler);
    return () => {
      window.removeEventListener("syspharma_cart_updated", cartHandler);
      window.removeEventListener("syspharma_favorites_updated", favHandler);
    };
  }, []);

  return (
    <header className="h-14 bg-green-600 border-b border-green-700 flex items-center justify-between px-3 sm:px-5 shadow-md z-20 text-white flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition flex-shrink-0"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-white/20 p-1 sm:p-1.5 rounded-lg backdrop-blur-sm flex-shrink-0">
            <Stethoscope size={18} className="text-white" />
          </div>
          <div className="hidden xs:block min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-wide leading-none truncate">
              SysPharma
            </h1>
            <p className="text-[8px] sm:text-[9px] text-green-100 uppercase tracking-wider font-medium opacity-80">
              Cliente
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <button className="relative text-green-100 hover:text-white transition-colors">
          <Heart size={20} />
          {favCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-5 bg-emerald-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center px-1 border border-green-600">
              {favCount}
            </span>
          )}
        </button>

        <button className="relative text-green-100 hover:text-white transition-colors">
          <ShoppingCart size={20} />
          {cartCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-5 bg-emerald-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center px-1 border border-green-600">
              {cartCount}
            </span>
          ) : (
            <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-400 rounded-full border border-green-600"></span>
          )}
        </button>

        <button className="relative text-green-100 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-400 rounded-full border border-green-600"></span>
        </button>

        <div className="h-6 w-[1px] bg-green-500 hidden sm:block"></div>

        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white leading-none group-hover:opacity-90 truncate">
              {user.nombre}
            </p>
            <p className="text-[10px] text-green-100 font-medium uppercase mt-0.5">
              {user.rol}
            </p>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white text-green-600 rounded-full flex items-center justify-center font-bold border-2 border-green-200 shadow-sm text-xs flex-shrink-0">
            {user.nombre.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
