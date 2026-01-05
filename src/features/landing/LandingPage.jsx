import React from 'react';
import { PublicNavbar } from './components/PublicNavbar';
import { HeroCarousel } from './components/HeroCarousel';
// Importamos MapPin para la ubicación y quitamos FileText
import { Clock, CalendarCheck, Truck, MapPin } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden flex flex-col">
      <PublicNavbar />
      
      <HeroCarousel />

      <div className="py-6 bg-white border-b border-gray-100 shadow-sm relative z-20">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          
          <FeatureItem icon={Clock} title="06:00 AM - 10:00 PM" desc="Todos los días" />
          
          <FeatureItem icon={CalendarCheck} title="Agendar Cita" desc="Sin filas" />
          
          <FeatureItem icon={Truck} title="Domicilios" desc="Rápidos y seguros" />
          
          {/* CAMBIO: Ahora mostramos la ubicación */}
          <FeatureItem icon={MapPin} title="Estamos Ubicados" desc="Barrio Galán" />
          
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-4 text-center text-xs mt-auto w-full">
        <p>© 2025 Syspharma - Farmacenter La 10.</p>
      </footer>
    </div>
  );
};

const FeatureItem = ({ icon: Icon, title, desc }) => (
  <div className="flex flex-col items-center p-2 cursor-default hover:bg-gray-50 rounded-lg transition-colors">
    <div className="text-primary-400 mb-1.5">
      <Icon size={22} />
    </div>
    <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
    <p className="text-[10px] text-gray-500">{desc}</p>
  </div>
);