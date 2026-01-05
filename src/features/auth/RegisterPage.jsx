import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, UserPlus, ChevronLeft } from 'lucide-react'; // <--- Agregamos ChevronLeft

// TU IMAGEN LOCAL
import loginImage from '../../assets/login.jpg'; 

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = (e) => {
    e.preventDefault();
    const newUser = { id: Date.now(), ...formData, role: 'client' };
    const existingUsers = JSON.parse(localStorage.getItem('syspharma_users') || '[]');
    localStorage.setItem('syspharma_users', JSON.stringify([...existingUsers, newUser]));
    alert('¡Cuenta creada con éxito!');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex w-full overflow-hidden font-sans">
      
      {/* --- LADO IZQUIERDO (70%) --- */}
      <div className="hidden lg:flex lg:w-[70%] bg-primary-800 relative items-center justify-center">
        <img 
          src={loginImage} 
          alt="Registro Syspharma" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="relative z-10 text-center px-20">
          <div className="inline-flex bg-white/20 p-5 rounded-3xl mb-8 backdrop-blur-md border border-white/30 shadow-2xl">
            <UserPlus className="text-white" size={64} />
          </div>
          <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">Únete a Nosotros</h2>
          <p className="text-primary-100 text-xl font-light">
            Crea tu cuenta y disfruta de todos los beneficios.
          </p>
        </div>
      </div>

      {/* --- LADO DERECHO (30%) --- */}
      <div className="w-full lg:w-[30%] flex items-center justify-center bg-white px-6 shadow-2xl z-20 overflow-y-auto relative">
        
        {/* --- BOTÓN VOLVER AL INICIO --- */}
        <Link to="/" className="absolute top-6 left-6 flex items-center gap-1 text-gray-400 hover:text-primary-600 transition-colors text-sm font-medium group z-30">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver
        </Link>

        <div className="w-full py-8 mt-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
            <p className="text-gray-500 text-xs mt-1">Registro exclusivo para clientes.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {[
              { label: 'Nombre Completo', icon: User, name: 'nombre', type: 'text', placeholder: 'Ej: Juan Pérez' },
              { label: 'Correo Electrónico', icon: Mail, name: 'email', type: 'email', placeholder: 'correo@ej.com' },
              { label: 'Celular', icon: Phone, name: 'telefono', type: 'tel', placeholder: '313...' },
              { label: 'Contraseña', icon: Lock, name: 'password', type: 'password', placeholder: '••••••••' }
            ].map((field, idx) => (
              <div key={idx}>
                <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">{field.label}</label>
                <div className="relative group">
                  <field.icon size={16} className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input required type={field.type} name={field.name} onChange={handleChange} className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all bg-gray-50" placeholder={field.placeholder} />
                </div>
              </div>
            ))}

            <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-all shadow-md mt-4 flex items-center justify-center gap-2 text-sm">
              Registrarme <ArrowRight size={16} />
            </button>

            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                ¿Ya tienes cuenta? <Link to="/login" className="text-primary-600 font-bold hover:underline">Ingresa aquí</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};