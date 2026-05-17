import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, UserPlus, ChevronLeft, Check, X } from "lucide-react";
import { ToastNotification } from "../../shared/ui/ToastNotification";
import { authService } from "../auth/authService";
import loginImage from "../../assets/login.jpg";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [toast, setToast] = useState(null);

  // Estados para controlar las validaciones de la contraseña
  const [passwordValidations, setPasswordValidations] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "Insegura", color: "bg-gray-200", width: "0%" });

  // Ejecutar validaciones en tiempo real cuando cambie la contraseña
  useEffect(() => {
    const pass = formData.password;
    
    const validations = {
      hasMinLength: pass.length >= 8,
      hasUppercase: /[A-Z]/.test(pass),
      hasLowercase: /[a-z]/.test(pass),
      hasNumber: /[0-9]/.test(pass),
      hasSpecialChar: /[^A-Za-z0-9]/.test(pass),
    };

    setPasswordValidations(validations);

    // Calcular cuántas reglas cumple para medir la fuerza de la contraseña
    const passedCount = Object.values(validations).filter(Boolean).length;
    
    if (pass.length === 0) {
      setPasswordStrength({ score: 0, label: "Insegura", color: "bg-gray-200", width: "0%" });
    } else if (passedCount < 3) {
      setPasswordStrength({ score: 1, label: "Debil", color: "bg-red-500", width: "33%" });
    } else if (passedCount < 5) {
      setPasswordStrength({ score: 2, label: "Media", color: "bg-amber-500", width: "66%" });
    } else {
      setPasswordStrength({ score: 3, label: "Segura", color: "bg-emerald-500", width: "100%" });
    }
  }, [formData.password]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // El formulario es válido si todo está lleno, cumple la contraseña y coincide la confirmación
  const isFormValid = 
    formData.nombres.trim() && 
    formData.apellidos.trim() && 
    formData.email.trim() && 
    Object.values(passwordValidations).every(Boolean) && 
    formData.password === formData.confirmPassword;

  const handleRegister = async (e) => {
    e.preventDefault();

    const email = (formData.email || "").trim().toLowerCase();

    if (!email) {
      setToast({ message: "Ingresa un correo valido", type: "error", zIndex: 70 }); 
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setToast({ message: "Las contrasenas no coinciden", type: "error", zIndex: 70 }); 
      return;
    }

    // Mapeo limpio para el backend en ASP.NET Core mandando nulos los opcionales
    const result = await authService.register({
      nombre: `${formData.nombres.trim()} ${formData.apellidos.trim()}`.trim(),
      email,
      password: formData.password,
      roleId: 3,
      documento: null,
      tipoDocumentoId: null,
      telefono: null,
    });

    if (result.error) {
      setToast({ message: result.message, type: "error", zIndex: 70 }); 
      return;
    }

    setToast({ message: "Cuenta creada con exito", type: "success", zIndex: 70 });
    setTimeout(() => navigate("/login"), 800);
  };

  return (
    <div className="min-h-screen flex w-full overflow-hidden font-sans">
      {/* Lado izquierdo - Decorativo */}
      <div className="hidden lg:flex lg:w-[70%] bg-primary-800 relative items-center justify-center">
        <img src={loginImage} alt="Registro Syspharma" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="relative z-10 text-center px-20">
          <div className="inline-flex bg-white/20 p-5 rounded-3xl mb-8 backdrop-blur-md border border-white/30 shadow-2xl">
            <UserPlus className="text-white" size={64} />
          </div>
          <h2 className="text-5xl font-bold text-white mb-4 tracking-tight">Únete a Nosotros</h2>
          <p className="text-primary-100 text-xl font-light">Crea tu cuenta y disfruta de todos los beneficios.</p>
        </div>
      </div>

      {/* Lado derecho - Formulario Simplificado */}
      <div className="w-full lg:w-[30%] flex items-center justify-center bg-white px-6 shadow-2xl z-20 relative overflow-y-auto max-h-screen">
        <Link to="/" className="absolute top-4 left-6 flex items-center gap-1 text-gray-400 hover:text-primary-600 transition-colors text-xs font-medium group z-30">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver
        </Link>

        <div className="w-full py-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Crear Cuenta</h2>
            <p className="text-gray-500 text-xs mt-0.5">Registro exclusivo para clientes.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3">
            {/* Nombres */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-0.5 ml-1">Nombres</label>
              <div className="relative group">
                <User size={14} className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  name="nombres"
                  onChange={handleChange}
                  value={formData.nombres}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all bg-gray-50"
                  placeholder="Ej: Juan"
                  required
                />
              </div>
            </div>

            {/* Apellidos */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-0.5 ml-1">Apellidos</label>
              <div className="relative group">
                <User size={14} className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  name="apellidos"
                  onChange={handleChange}
                  value={formData.apellidos}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all bg-gray-50"
                  placeholder="Ej: Pérez"
                  required
                />
              </div>
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-0.5 ml-1">Correo Electrónico</label>
              <div className="relative group">
                <Mail size={14} className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  onChange={handleChange}
                  value={formData.email}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all bg-gray-50"
                  placeholder="Ej: correo@ej.com"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-0.5 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock size={14} className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="password"
                  name="password"
                  onChange={handleChange}
                  value={formData.password}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all bg-gray-50"
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* Parámetros de la contraseña con medidor en tiempo real */}
              {formData.password.length > 0 && (
                <div className="mt-2 bg-gray-50 p-2 rounded-lg border border-gray-100 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                    <span>Fuerza: {passwordStrength.label}</span>
                  </div>
                  <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${passwordStrength.color} transition-all duration-300`} 
                      style={{ width: passwordStrength.width }}
                    ></div>
                  </div>

                  {/* Criterios a cumplir */}
                  <div className="grid grid-cols-1 gap-1 text-[10px] text-gray-600 pt-0.5">
                    <span className="flex items-center gap-1">
                      {passwordValidations.hasMinLength ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-gray-400" />}
                      Mínimo 8 caracteres
                    </span>
                    <span className="flex items-center gap-1">
                      {passwordValidations.hasUppercase ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-gray-400" />}
                      Al menos una mayúscula
                    </span>
                    <span className="flex items-center gap-1">
                      {passwordValidations.hasLowercase ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-gray-400" />}
                      Al menos una minúscula
                    </span>
                    <span className="flex items-center gap-1">
                      {passwordValidations.hasNumber ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-gray-400" />}
                      Al menos un número
                    </span>
                    <span className="flex items-center gap-1">
                      {passwordValidations.hasSpecialChar ? <Check size={10} className="text-emerald-500" /> : <X size={10} className="text-gray-400" />}
                      Al menos un carácter especial
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-0.5 ml-1">Confirmar Contraseña</label>
              <div className="relative group">
                <Lock size={14} className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="password"
                  name="confirmPassword"
                  onChange={handleChange}
                  value={formData.confirmPassword}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all bg-gray-50"
                  placeholder="••••••••"
                  required
                />
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <span className="text-[10px] text-red-500 ml-1 block mt-0.5">Las contraseñas no coinciden.</span>
              )}
            </div>

            {/* Botón de Registro dinámico */}
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full font-bold py-2 rounded-lg transition-all shadow-md mt-2 flex items-center justify-center gap-2 text-xs ${
                isFormValid 
                  ? "bg-primary-600 hover:bg-primary-700 text-white cursor-pointer" 
                  : "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none"
              }`}
            >
              Registrarme <ArrowRight size={14} />
            </button>

            {toast && (
              <ToastNotification message={toast.message} type={toast.type} zIndex={toast.zIndex} onClose={() => setToast(null)} />
            )}

            <div className="text-center pt-1">
              <p className="text-xs text-gray-500">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-primary-600 font-bold hover:underline">Ingresa aquí</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;