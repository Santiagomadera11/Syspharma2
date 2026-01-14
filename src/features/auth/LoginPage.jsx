import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Stethoscope, User, Lock, ArrowRight, ChevronLeft } from "lucide-react"; // <--- Agregamos ChevronLeft
import { authService } from "../auth/authService";
import { ToastNotification } from "../../shared/ui/ToastNotification";

// TU IMAGEN LOCAL
import loginImage from "../../assets/login.jpg";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = authService.login(
      credentials.email.trim(),
      credentials.password
    );
    if (!user) {
      setToast({
        message: "Credenciales inválidas. Verifica email y contraseña.",
        type: "error",
        zIndex: 70,
      });
      return;
    }
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex w-full overflow-hidden font-sans">
      {/* --- LADO IZQUIERDO (70%) --- */}
      <div className="hidden lg:flex lg:w-[70%] bg-primary-900 relative items-center justify-center">
        <img
          src={loginImage}
          alt="Farmacia Syspharma"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 text-center px-20">
          <div className="inline-flex bg-white/20 p-5 rounded-3xl mb-8 backdrop-blur-md border border-white/30 shadow-2xl">
            <Stethoscope className="text-white" size={64} />
          </div>
          <h2 className="text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
            SysPharma
          </h2>
          <p className="text-primary-50 text-2xl max-w-2xl mx-auto leading-relaxed font-light drop-shadow-md">
            El sistema integral para la gestión farmacéutica moderna.
          </p>
        </div>
      </div>

      {/* --- LADO DERECHO (30%) --- */}
      {/* Agregamos 'relative' para posicionar el botón de volver */}
      <div className="w-full lg:w-[30%] flex items-center justify-center bg-white px-6 md:px-10 shadow-2xl z-20 relative">
        {/* --- BOTÓN VOLVER AL INICIO --- */}
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-1 text-gray-400 hover:text-primary-600 transition-colors text-sm font-medium group"
        >
          <ChevronLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Volver al inicio
        </Link>

        <div className="w-full">
          <div className="text-center mb-8 mt-8">
            {" "}
            {/* mt-8 para dar espacio al botón de volver */}
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Bienvenido
            </h2>
            <p className="text-gray-500 text-xs">
              Ingresa a tu cuenta para continuar.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
                Correo Electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User
                    size={16}
                    className="text-gray-400 group-focus-within:text-primary-500 transition-colors"
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@syspharma.com"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1 ml-1">
                <label className="block text-xs font-bold text-gray-700">
                  Contraseña
                </label>
                <a
                  href="#"
                  className="text-[10px] text-primary-600 hover:text-primary-800 font-bold hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock
                    size={16}
                    className="text-gray-400 group-focus-within:text-primary-500 transition-colors"
                  />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all text-sm bg-gray-50 focus:bg-white"
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-4 text-sm"
            >
              Iniciar Sesión <ArrowRight size={16} />
            </button>

            <div className="text-center pt-4 border-t border-gray-100 mt-6">
              <p className="text-xs text-gray-500">
                ¿Eres cliente nuevo?{" "}
                <Link
                  to="/registro"
                  className="text-primary-600 font-bold hover:underline"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          zIndex={toast.zIndex}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
