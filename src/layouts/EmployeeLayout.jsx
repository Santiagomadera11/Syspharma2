import React, { useState } from "react";
import { Outlet } from "react-router-dom";

// 1. IMPORTAR LOS COMPONENTES DE UI (Ajusta si tus carpetas son diferentes)
// Intenta con una de estas dos opciones si la primera falla:
import EmployeeSidebar from "../layouts/Sidebar/EmployeeSidebar"; 
// O si tienes el sidebar en la misma carpeta layouts:
// import EmployeeSidebar from "./Sidebar/EmployeeSidebar";

import { Header } from "../layouts/Header/Header";

// 2. IMPORTAR EL LISTENER Y EL TOASTER
// Nota: Usamos ../../ si estamos en src/layouts/ para bajar a src/ y entrar a shared
import { NotificationListener } from "../shared/components/NotificationListener";
import { Toaster } from "sonner";

const EmployeeLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans text-sm flex-col md:flex-row-reverse">
      
      {/* 3. ACTIVAR EL ESCUCHA Y EL COMPONENTE VISUAL */}
      <NotificationListener />
      <Toaster richColors position="top-right" />

      <EmployeeSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex flex-col flex-1 h-full min-w-0">
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 p-4 overflow-hidden relative">
          <div className="h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto no-scrollbar p-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;