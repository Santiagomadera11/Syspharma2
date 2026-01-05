import React from 'react';
import { PublicNavbar } from './components/PublicNavbar';
import { Syringe, HeartPulse, Truck, FileText, Activity, ShieldCheck } from 'lucide-react';

export const ServicesPage = () => {
  const services = [
    { icon: Syringe, title: "Inyectología", desc: "Aplicación segura por expertos." },
    { icon: HeartPulse, title: "Toma de Presión", desc: "Monitoreo de signos vitales." },
    { icon: Truck, title: "Domicilios", desc: "Entrega rápida en toda la ciudad." },
    { icon: FileText, title: "Recetas Médicas", desc: "Cotizamos tu fórmula completa." },
    { icon: Activity, title: "Glucometría", desc: "Pruebas rápidas de azúcar." },
    { icon: ShieldCheck, title: "Asesoría", desc: "Uso correcto de medicamentos." }
  ];

  return (
    // CLAVE: flex flex-col min-h-screen
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />
      
      {/* flex-1 hace que este div ocupe todo el espacio disponible */}
      <div className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <h1 className="text-2xl font-bold text-center text-primary-900 mb-6">Nuestros Servicios</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {services.map((s, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100 flex items-start gap-3 transition-all">
              <div className="bg-primary-50 p-2 rounded-lg text-primary-500 flex-shrink-0">
                <s.icon size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-4 text-center text-xs mt-auto">
        <p>© 2025 Syspharma - Farmacenter La 10.</p>
      </footer>
    </div>
  );
};