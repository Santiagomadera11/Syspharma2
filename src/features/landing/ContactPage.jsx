import React from 'react';
import { PublicNavbar } from './components/PublicNavbar';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const ContactPage = () => {
  return (
    // CLAVE: flex flex-col min-h-screen
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PublicNavbar />
      
      {/* flex-1 centra el contenido verticalmente si sobra espacio */}
      <div className="flex-1 max-w-5xl mx-auto px-4 py-4 flex items-center w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-bold text-primary-900 mb-4">Contáctanos</h1>
            <p className="text-sm text-gray-600 mb-6">
              Barrio Galán. Estamos atentos a tus pedidos.
            </p>
            
            <div className="space-y-3">
              <ContactItem icon={MapPin} title="Ubicación" text="Calle 10 #27, Barrio Galán" />
              <ContactItem icon={Phone} title="Teléfono" text="313 616 0504" />
              <ContactItem icon={Mail} title="Email" text="farmacenterla10@gmail.com" />
              <ContactItem icon={Clock} title="Horario" text="06:00 AM - 10:00 PM" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Envíanos un mensaje</h3>
            <form className="space-y-3">
              <input type="text" className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400" placeholder="Nombre" />
              <input type="tel" className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400" placeholder="Celular" />
              <textarea rows="3" className="w-full px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary-400 resize-none" placeholder="Tu mensaje..."></textarea>

              <button className="w-full bg-primary-600 text-white font-bold py-2 rounded-lg hover:bg-primary-700 transition text-sm">
                Enviar
              </button>
            </form>
          </div>

        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-4 text-center text-xs mt-auto">
        <p>© 2025 Syspharma - Farmacenter La 10.</p>
      </footer>
    </div>
  );
};

const ContactItem = ({ icon: Icon, title, text }) => (
  <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-100 shadow-sm">
    <div className="bg-primary-50 p-1.5 rounded text-primary-600">
      <Icon size={16} />
    </div>
    <div>
      <h4 className="font-bold text-xs text-gray-800">{title}</h4>
      <p className="text-xs text-gray-600">{text}</p>
    </div>
  </div>
);