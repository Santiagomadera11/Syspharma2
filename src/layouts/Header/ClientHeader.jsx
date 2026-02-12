import React, { useEffect, useState } from "react";
import { Bell, Menu, Stethoscope, ShoppingCart, Heart, Eye } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { read, write, LS } from '../../shared/services/lsService';

export const ClientHeader = ({ onMenuClick }) => {
  const [user, setUser] = useState({ nombre: "Usuario", rol: "Cliente" });
  const [cartCount, setCartCount] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

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
    window.addEventListener("syspharma_notifications_updated", loadNotifications);
    // initial notifications load
    loadNotifications();
    return () => {
      window.removeEventListener("syspharma_cart_updated", cartHandler);
      window.removeEventListener("syspharma_favorites_updated", favHandler);
      window.removeEventListener("syspharma_notifications_updated", loadNotifications);
    };
  }, []);

  function loadNotifications() {
    try {
      const arr = read(LS.NOTIFICATIONS) || [];
      setNotifications(Array.isArray(arr) ? arr : []);
    } catch {
      setNotifications([]);
    }
  }

  const navigate = useNavigate();

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
        <button onClick={() => navigate('/client/favoritos')} className="relative text-green-100 hover:text-white transition-colors" aria-label="Favoritos">
          <Heart size={20} />
          {favCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-5 bg-emerald-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center px-1 border border-green-600">
              {favCount}
            </span>
          )}
        </button>

        <button onClick={() => navigate('/client/carrito')} className="relative text-green-100 hover:text-white transition-colors" aria-label="Carrito">
          <ShoppingCart size={20} />
          {cartCount > 0 ? (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-5 bg-emerald-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center px-1 border border-green-600">
              {cartCount}
            </span>
          ) : (
            <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-400 rounded-full border border-green-600"></span>
          )}
        </button>

        <div className="relative">
          <button onClick={() => setNotifOpen((v) => !v)} className="relative text-green-100 hover:text-white transition-colors" aria-label="Notificaciones">
            <Bell size={20} />
            {notifications && notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-5 bg-emerald-600 text-white rounded-full text-[11px] font-bold flex items-center justify-center px-1 border border-green-600">
                {notifications.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-100 z-50">
              <div className="p-2 border-b flex items-center justify-between">
                <strong className="text-sm">Notificaciones</strong>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const updated = (notifications || []).map((n) => ({ ...n, read: true }));
                      write(LS.NOTIFICATIONS, updated);
                      setNotifications(updated);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2"
                  >Marcar todas</button>
                  <button onClick={() => setNotifOpen(false)} className="text-xs text-gray-500 hover:text-gray-700 px-2">Cerrar</button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {(!notifications || notifications.length === 0) ? (
                  <div className="p-3 text-sm text-gray-500">No hay notificaciones</div>
                ) : (
                  notifications.map((n, idx) => (
                    <div key={n.id || idx} className={`p-3 hover:bg-gray-50 border-b last:border-b-0 flex items-start gap-2 ${n.read ? 'opacity-60' : ''}`}>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-gray-800 truncate">{n.title || n.tipo || 'Notificación'}</div>
                        <div className="text-xs text-gray-500">{n.message || n.body || ''}</div>
                        <div className="text-[11px] text-gray-400 mt-1">{n.date || n.createdAt || ''}</div>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <button onClick={() => {
                          if (n.path) {
                            setNotifOpen(false);
                            navigate(n.path);
                            return;
                          }
                          const upd = (notifications || []).map((it, i) => i === idx ? { ...it, read: true } : it);
                          write(LS.NOTIFICATIONS, upd);
                          setNotifications(upd);
                        }} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Ver"> <Eye size={14} /> </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
