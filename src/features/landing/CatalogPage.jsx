import React from "react";
import { PublicNavbar } from "./components/PublicNavbar";
import { FeaturedProducts } from "./components/FeaturedProducts";

export const CatalogPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />

      <div className="bg-white text-gray-800 py-6 text-center">
        <h1 className="text-2xl font-bold mb-1">Catálogo</h1>
        <p className="text-gray-600 text-xs">Todos los productos</p>
      </div>

      <div className="py-2 flex-1">
        <FeaturedProducts />
      </div>

      <footer className="bg-gray-900 text-gray-400 py-4 text-center text-xs mt-auto">
        <p>© 2025 Syspharma - Farmacenter La 10.</p>
      </footer>
    </div>
  );
};

export default CatalogPage;
