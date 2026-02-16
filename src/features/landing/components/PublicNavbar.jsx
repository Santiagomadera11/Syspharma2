import React, { useEffect, useState } from "react";
import { ShoppingCart, User, Stethoscope } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { read, LS } from '../../../shared/services/lsService';
import useCart from '../../../shared/context/CartContext';

export const PublicNavbar = () => {
  const location = useLocation();

  const cart = useCart();
  const CartButton = () => {
    return (
      <button onClick={() => cart.setIsCartOpen(true)} className="relative p-1.5 text-gray-400 hover:text-primary-400 transition-colors">
        <ShoppingCart size={20} />
        <span className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold rounded-full h-3.5 w-3.5 flex items-center justify-center">
          {cart.cartCount}
        </span>
      </button>
    );
  };

  const navItems = [
    { label: "Inicio", path: "/" },
    { label: "Productos", path: "/productos" },
    { label: "Servicios", path: "/servicios" },
    { label: "Contacto", path: "/contacto" },
  ];

  const isActive = (path) => location.pathname === path;
  return (
    <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100 h-14 flex items-center">
      <div className="max-w-6xl mx-auto w-full px-4">
        <div className="flex justify-between items-center">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer group">
            <div className="bg-primary-400 text-white p-1.5 rounded-lg shadow-md group-hover:bg-primary-500 transition-colors">
              <Stethoscope size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-primary-900">
              Sys<span className="text-primary-400">Pharma</span>
            </span>
          </Link>

          {/* MENÚ CENTRO */}
          <div className="hidden md:flex space-x-6 items-center font-medium text-sm text-gray-500">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors pb-1 border-b-2 ${
                  isActive(item.path)
                    ? "text-primary-400 border-primary-400"
                    : "hover:text-primary-400 border-b-2 border-transparent hover:border-primary-400"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* BOTONES DERECHA */}
          <div className="flex items-center space-x-3">
            <CartButton />

            {/* ENLACE REGISTRARSE (SOLO CLIENTES) */}
            <Link
              to="/registro"
              className="text-xs font-bold text-gray-500 hover:text-primary-600 transition-colors hidden sm:block"
            >
              Registrarse
            </Link>

            {/* BOTÓN INGRESAR */}
            <Link
              to="/login"
              className="flex items-center gap-1.5 bg-primary-400 hover:bg-primary-500 text-white px-4 py-1.5 rounded-full transition-all shadow-sm hover:shadow-md font-bold text-xs"
            >
              <User size={16} />
              <span>Ingresar</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
