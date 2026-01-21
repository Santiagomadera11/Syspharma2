import React, { useEffect, useState } from "react";
import { Bell, Menu, Stethoscope, ShoppingCart } from "lucide-react";

export const ClientHeader = ({ onMenuClick }) => {
  const [user, setUser] = useState({ nombre: "Usuario", rol: "Cliente" });

  useEffect(() => {
    const storedUser = localStorage.getItem("syspharma_user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <header className="h-14 bg-green-600 border-b border-green-700 flex items-center justify-between px-5 shadow-md z-20 text-white flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition"
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
            <Stethoscope size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide leading-none">
              SysPharma
            </h1>
            <p className="text-[9px] text-green-100 uppercase tracking-wider font-medium opacity-80">
              Panel Cliente
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-green-100 hover:text-white transition-colors">
          <ShoppingCart size={20} />
          <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-400 rounded-full border border-green-600"></span>
        </button>

        <button className="relative text-green-100 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-400 rounded-full border border-green-600"></span>
        </button>

        <div className="h-6 w-[1px] bg-green-500 hidden sm:block"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white leading-none group-hover:opacity-90">
              {user.nombre}
            </p>
            <p className="text-[10px] text-green-100 font-medium uppercase mt-0.5">
              {user.rol}
            </p>
          </div>
          <div className="w-8 h-8 bg-white text-green-600 rounded-full flex items-center justify-center font-bold border-2 border-green-200 shadow-sm text-xs">
            {user.nombre.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};
