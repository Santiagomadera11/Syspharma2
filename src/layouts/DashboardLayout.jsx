import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import { Header } from "./Header/Header";

const DashboardLayout = () => {
  // Estado para controlar si el menú móvil está abierto
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    // MD:FLEX-ROW-REVERSE -> En PC (md) se pone en fila invertida (Sidebar derecha).
    // En Móvil es columna normal.
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans text-sm flex-col md:flex-row-reverse">
      {/* 1. SIDEBAR (Le pasamos el estado y la función para cerrar) */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. CONTENIDO PRINCIPAL */}
      <div className="flex flex-col flex-1 h-full min-w-0">
        {/* Header: Le pasamos la función para ABRIR el menú */}
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Área de trabajo */}
        <main className="flex-1 p-4 overflow-hidden relative">
          <div className="h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto no-scrollbar p-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
