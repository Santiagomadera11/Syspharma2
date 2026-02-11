import React, { useEffect, useState } from 'react';
import { Bell, Menu, Stethoscope } from 'lucide-react';

// Recibimos la función onMenuClick
export const Header = ({ onMenuClick }) => {
  const [user, setUser] = useState({ nombre: 'Usuario', rol: 'Invitado' });

  useEffect(() => {
    const storedUser = localStorage.getItem('syspharma_user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <header className="h-14 bg-primary-600 border-b border-primary-700 flex items-center justify-between px-3 sm:px-5 shadow-md z-20 text-white flex-shrink-0">
      
      {/* IZQUIERDA: Botón Menú y Logo */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        
        {/* BOTÓN MENÚ: Solo visible en móvil (lg:hidden) */}
        <button 
          onClick={onMenuClick} 
          className="lg:hidden text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition flex-shrink-0"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        
        {/* LOGO SYSPHARMA */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-white/20 p-1 sm:p-1.5 rounded-lg backdrop-blur-sm flex-shrink-0">
            <Stethoscope size={18} className="text-white" />
          </div>
          <div className="hidden xs:block min-w-0">
            <h1 className="text-base sm:text-lg font-bold tracking-wide leading-none truncate">SysPharma</h1>
            <p className="text-[8px] sm:text-[9px] text-primary-100 uppercase tracking-wider font-medium opacity-80">
              Panel
            </p>
          </div>
        </div>
      </div>

      {/* DERECHA */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <button className="relative text-primary-100 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10">
          <Bell size={20} />
          <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-400 rounded-full border border-primary-600"></span>
        </button>
        
        <div className="h-6 w-[1px] bg-primary-500 hidden sm:block"></div>

        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white leading-none group-hover:opacity-90 truncate">{user.nombre}</p>
            <p className="text-[10px] text-primary-100 font-medium uppercase mt-0.5">{user.rol}</p>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white text-primary-600 rounded-full flex items-center justify-center font-bold border-2 border-primary-200 shadow-sm text-xs flex-shrink-0">
            {user.nombre.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};