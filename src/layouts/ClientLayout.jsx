import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import ClientSidebar from "./Sidebar/ClientSidebar";
import { ClientHeader } from "./Header/ClientHeader";

const ClientLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 font-sans text-sm flex-col md:flex-row-reverse">
      <ClientSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="flex flex-col flex-1 h-full min-w-0">
        <ClientHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

        <main className="flex-1 p-4 overflow-hidden relative">
          <div className="h-full w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-y-auto no-scrollbar p-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
