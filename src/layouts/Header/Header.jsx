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
    <header className="h-14 bg-primary-600 border-b border-primary-700 flex items-center justify-between px-5 shadow-md z-20 text-white flex-shrink-0">
      
      {/* IZQUIERDA: Botón Menú y Logo */}
      <div className="flex items-center gap-3">
        
        {/* BOTÓN MENÚ: Solo visible en móvil (md:hidden) y ahora FUNCIONA */}
        <button 
          onClick={onMenuClick} 
          className="md:hidden text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition"
        >
          <Menu size={24} />
        </button>
        
        {/* LOGO SYSPHARMA */}
        <div className="flex items-center gap-2">
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
            <Stethoscope size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide leading-none">SysPharma</h1>
            <p className="text-[9px] text-primary-100 uppercase tracking-wider font-medium opacity-80">
              Panel Administrativo
            </p>
          </div>
        </div>
      </div>

      {/* DERECHA (Igual) */}
      <div className="flex items-center gap-4">
        <button className="relative text-primary-100 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="absolute top-0 right-0.5 w-2 h-2 bg-red-400 rounded-full border border-primary-600"></span>
        </button>
        
        <div className="h-6 w-[1px] bg-primary-500 hidden sm:block"></div>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white leading-none group-hover:opacity-90">{user.nombre}</p>
            <p className="text-[10px] text-primary-100 font-medium uppercase mt-0.5">{user.rol}</p>
          </div>
          <div className="w-8 h-8 bg-white text-primary-600 rounded-full flex items-center justify-center font-bold border-2 border-primary-200 shadow-sm text-xs">
            {user.nombre.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
};