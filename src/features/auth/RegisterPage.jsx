import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Phone, ArrowRight, UserPlus, ChevronLeft } from "lucide-react";
import { ToastNotification } from "../../shared/ui/ToastNotification";
import { getDocumentTypes, fetchDocumentTypes } from "../settings/services/parameterService";
import { authService } from "../auth/authService";
import loginImage from "../../assets/login.jpg";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [documentTypes, setDocumentTypes] = useState([]);
  const [formData, setFormData] = useState({
    tipoDocumentoId: "",
    documento: "",
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // Intentar cargar desde backend, fallback a localStorage
    fetchDocumentTypes().then(types => setDocumentTypes(types));

    const handleParameterUpdate = () => setDocumentTypes(getDocumentTypes());
    window.addEventListener("syspharma_parameters_updated", handleParameterUpdate);
    return () => window.removeEventListener("syspharma_parameters_updated", handleParameterUpdate);
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();

    const email = (formData.email || "").trim().toLowerCase();

    if (!email) {
      setToast({ message: "Ingresa un correo válido", type: "error", zIndex: 70 }); return;
    }
    if (!formData.password || !formData.confirmPassword || formData.password !== formData.confirmPassword) {
      setToast({ message: "Las contraseñas no coinciden", type: "error", zIndex: 70 }); return;
    }

    const result = await authService.register({
      nombre: `${(formData.nombres || "").trim()} ${(formData.apellidos || "").trim()}`.trim(),
      email,
      password: formData.password,
      roleId: 3,
      documento: formData.documento || null,
      tipoDocumentoId: formData.tipoDocumentoId ? Number(formData.tipoDocumentoId) : null,
      telefono: formData.telefono || null,
    });

    if (result.error) {
      setToast({ message: result.message, type: "error", zIndex: 70 }); return;
    }

    setToast({ message: "Cuenta creada con éxito", type: "success", zIndex: 70 });
    setTimeout(() => navigate("/login"), 800);
  };

  return (
    <div className="min-h-screen flex w-full overflow-hidden font-sans">
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

      <div className="w-full lg:w-[30%] flex items-center justify-center bg-white px-6 shadow-2xl z-20 relative overflow-y-auto max-h-screen">
        <Link to="/" className="absolute top-4 left-6 flex items-center gap-1 text-gray-400 hover:text-primary-600 transition-colors text-xs font-medium group z-30">
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver
        </Link>

        <div className="w-full py-4">
          <div className="text-center mb-3">
            <h2 className="text-xl font-bold text-gray-900">Crear Cuenta</h2>
            <p className="text-gray-500 text-xs mt-0.5">Registro exclusivo para clientes.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-2.5">
            {/* Tipo Documento */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-0.5 ml-1">Tipo Documento</label>
              <div className="relative group">
                <User size={14} className="absolute left-3 top-2 text-gray-400" />
                <select
                  name="tipoDocumentoId"
                  onChange={handleChange}
                  value={formData.tipoDocumentoId}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all bg-gray-50"
                >
                  <option value="">Seleccionar...</option>
                  {documentTypes.map((dt) => (
                    <option key={dt.id} value={dt.id}>{dt.value}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campos de texto */}
            {[
              { label: "Número de Documento", icon: User, name: "documento", type: "text", placeholder: "Ej: 12345678", required: false },
              { label: "Nombres", icon: User, name: "nombres", type: "text", placeholder: "Ej: Juan", required: true },
              { label: "Apellidos", icon: User, name: "apellidos", type: "text", placeholder: "Ej: Pérez", required: true },
              { label: "Correo Electrónico", icon: Mail, name: "email", type: "email", placeholder: "Ej: correo@ej.com", required: true },
              { label: "Celular", icon: Phone, name: "telefono", type: "tel", placeholder: "Opcional", required: false },
              { label: "Contraseña", icon: Lock, name: "password", type: "password", placeholder: "••••••••", required: true },
              { label: "Confirmar Contraseña", icon: Lock, name: "confirmPassword", type: "password", placeholder: "••••••••", required: true },
            ].map((field, idx) => (
              <div key={idx}>
                <label className="block text-xs font-bold text-gray-700 mb-0.5 ml-1">{field.label}</label>
                <div className="relative group">
                  <field.icon size={14} className="absolute left-3 top-2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type={field.type}
                    name={field.name}
                    onChange={handleChange}
                    value={formData[field.name]}
                    className="w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all bg-gray-50"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 rounded-lg transition-all shadow-md mt-2 flex items-center justify-center gap-2 text-xs"
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