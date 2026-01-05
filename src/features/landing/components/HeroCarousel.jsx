import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const slides = [
  {
    id: 1,
    title: "Tu Salud Primero",
    desc: "Expertos cuidando de ti y tu familia.",
    gradient: "bg-gradient-to-r from-primary-900 via-primary-700 to-primary-400"
  },
  {
    id: 2,
    title: "Inyectología Segura",
    desc: "Profesionales capacitados en sede.",
    gradient: "bg-gradient-to-r from-blue-900 via-blue-700 to-blue-400"
  },
  {
    id: 3,
    title: "Dermocosmética",
    desc: "Cuida tu piel con las mejores marcas.",
    gradient: "bg-gradient-to-r from-teal-800 via-teal-600 to-primary-300"
  }
];

export const HeroCarousel = () => {
  const [curr, setCurr] = useState(0);

  const prev = () => setCurr((curr) => (curr === 0 ? slides.length - 1 : curr - 1));
  const next = () => setCurr((curr) => (curr === slides.length - 1 ? 0 : curr + 1));

  useEffect(() => {
    const slideInterval = setInterval(next, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    // Cambio: h-[380px] para hacerlo panorámico y corto
    <div className="relative overflow-hidden w-full h-[380px] bg-gray-100">
      <div 
        className="flex transition-transform ease-out duration-700 h-full" 
        style={{ transform: `translateX(-${curr * 100}%)` }}
      >
        {slides.map((s) => (
          <div 
            key={s.id} 
            className={`w-full flex-shrink-0 h-full flex flex-col justify-center items-start pl-10 md:pl-20 pr-10 text-white ${s.gradient}`}
          >
            <div className="max-w-xl animate-fade-in-up">
              <span className="bg-white/20 text-white px-3 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm mb-3 inline-block border border-white/30">
                Novedades
              </span>
              {/* Textos más pequeños */}
              <h1 className="text-4xl font-extrabold mb-3 leading-tight drop-shadow-sm">
                {s.title}
              </h1>
              <p className="text-lg opacity-90 mb-6 font-light">
                {s.desc}
              </p>
              
              <Link to="/servicios">
                <button className="bg-white text-primary-900 px-6 py-2 rounded-full font-bold hover:bg-gray-50 transition-all shadow-lg hover:scale-105 active:scale-95 text-sm">
                  Ver Servicios
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 right-6 flex gap-2">
        <button onClick={prev} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm transition">
          <ChevronLeft size={20} />
        </button>
        <button onClick={next} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm transition">
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};