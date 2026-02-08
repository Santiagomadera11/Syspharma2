import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Stethoscope,
  User,
  Lock,
  ArrowRight,
  ChevronLeft,
  X,
  Key,
} from "lucide-react"; // <--- Agregamos ChevronLeft
import { authService } from "../auth/authService";
import { ToastNotification } from "../../shared/ui/ToastNotification";

// TU IMAGEN LOCAL
import loginImage from "../../assets/login.jpg";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [toast, setToast] = useState(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState("email"); // email, code, password
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [codeInputs, setCodeInputs] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutos
  const [codeExpired, setCodeExpired] = useState(false);
  const codeInputRefs = useRef([]);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Temporizador para el código de verificación
  useEffect(() => {
    if (recoveryStep === "code" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && recoveryStep === "code") {
      setCodeExpired(true);
    }
  }, [timeLeft, recoveryStep]);

  const handleSendCode = (e) => {
    e.preventDefault();
    if (!recoveryEmail) {
      setToast({
        message: "Ingresa tu correo electrónico",
        type: "error",
        zIndex: 70,
      });
      return;
    }

    // Generar código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);

    setRecoveryStep("code");
    setTimeLeft(180);
    setCodeExpired(false);
    setToast({
      message: "Código enviado. Revisa tu correo y la consola.",
      type: "success",
      zIndex: 70,
    });
  };

  const handleCodeInputChange = (index, value) => {
    if (!/^\d?$/.test(value)) return; // Solo dígitos
    const newCodeInputs = [...codeInputs];
    newCodeInputs[index] = value;
    setCodeInputs(newCodeInputs);

    // Auto-focus al siguiente input
    if (value && index < 5) {
      codeInputRefs.current[index + 1].focus();
    }
  };

  const handleCodeInputKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codeInputs[index] && index > 0) {
      codeInputRefs.current[index - 1].focus();
    }
  };

  const handleVerifyCode = () => {
    const enteredCode = codeInputs.join("");
    if (enteredCode !== verificationCode) {
      setToast({
        message: "Código incorrecto",
        type: "error",
        zIndex: 70,
      });
      return;
    }
    setRecoveryStep("password");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setToast({
        message: "Completa todos los campos",
        type: "error",
        zIndex: 70,
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({
        message: "Las contraseñas no coinciden",
        type: "error",
        zIndex: 70,
      });
      return;
    }

    // Encontrar el usuario y actualizar la contraseña
    const users = JSON.parse(localStorage.getItem("sys_users") || "[]");
    const userIndex = users.findIndex(
      (u) => u.email.toLowerCase() === recoveryEmail.toLowerCase(),
    );

    if (userIndex === -1) {
      setToast({
        message: "Usuario no encontrado",
        type: "error",
        zIndex: 70,
      });
      return;
    }

    users[userIndex].password = newPassword;
    localStorage.setItem("sys_users", JSON.stringify(users));

    setToast({
      message: "Contraseña actualizada exitosamente",
      type: "success",
      zIndex: 70,
    });

    // Resetear modal
    setTimeout(() => {
      setShowRecoveryModal(false);
      setRecoveryStep("email");
      setRecoveryEmail("");
      setCodeInputs(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmPassword("");
    }, 800);
  };

  const handleResendCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    setCodeInputs(["", "", "", "", "", ""]);
    setTimeLeft(180);
    setCodeExpired(false);
    setToast({
      message: "Nuevo código enviado",
      type: "success",
      zIndex: 70,
    });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = authService.login(
      credentials.email.trim(),
      credentials.password,
    );
    if (!user) {
      setToast({
        message: "Credenciales inválidas. Verifica email y contraseña.",
        type: "error",
        zIndex: 70,
      });
      return;
    }

    // Validar si hay error (cuenta inactiva)
    if (user.error) {
      setToast({
        message: user.message,
        type: "error",
        zIndex: 70,
      });
      return;
    }

    // Redireccionar según el rol
    if (user.rol === "Administrador") {
      navigate("/admin/dashboard");
    } else if (user.rol === "Empleado") {
      navigate("/employee/inicio");
    } else if (user.rol === "Cliente") {
      navigate("/client/catalogo");
    } else {
      navigate("/");
    }
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
                  onClick={(e) => {
                    e.preventDefault();
                    setShowRecoveryModal(true);
                  }}
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

      {/* Modal Recuperar Contraseña */}
      {showRecoveryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-cyan-100 bg-cyan-50">
              <div className="flex items-center gap-2">
                <Key size={20} className="text-cyan-700" />
                <h2 className="text-lg font-semibold text-cyan-900">
                  Recuperar Contraseña
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowRecoveryModal(false);
                  setRecoveryStep("email");
                  setRecoveryEmail("");
                  setCodeInputs(["", "", "", "", "", ""]);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="p-1 hover:bg-cyan-100 rounded-lg transition-colors text-cyan-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {recoveryStep === "email" && (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Ingresa tu correo para recibir el código de verificación.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
                      Correo Electrónico
                    </label>
                    <div className="relative group">
                      <User
                        size={14}
                        className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-500 transition-colors"
                      />
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="tu@email.com"
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all bg-gray-50"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-lg transition-all text-sm"
                  >
                    Enviar Código
                  </button>
                </form>
              )}

              {recoveryStep === "code" && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Ingresa el código de 6 dígitos
                    </p>
                    <div className="flex gap-2 justify-between">
                      {codeInputs.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (codeInputRefs.current[idx] = el)}
                          type="text"
                          maxLength="1"
                          value={digit}
                          onChange={(e) =>
                            handleCodeInputChange(idx, e.target.value)
                          }
                          onKeyDown={(e) => handleCodeInputKeyDown(idx, e)}
                          disabled={codeExpired}
                          className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700">
                      Tiempo restante:
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        timeLeft <= 60 ? "text-red-600" : "text-primary-600"
                      }`}
                    >
                      {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:
                      {String(timeLeft % 60).padStart(2, "0")}
                    </span>
                  </div>

                  {codeExpired ? (
                    <button
                      onClick={handleResendCode}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-lg transition-all text-sm"
                    >
                      Reenviar Código
                    </button>
                  ) : (
                    <button
                      onClick={handleVerifyCode}
                      disabled={codeInputs.join("").length !== 6}
                      className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-bold py-2.5 rounded-lg transition-all text-sm disabled:cursor-not-allowed"
                    >
                      Verificar Código
                    </button>
                  )}
                </div>
              )}

              {recoveryStep === "password" && (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Ingresa tu nueva contraseña.
                  </p>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
                      Nueva Contraseña
                    </label>
                    <div className="relative group">
                      <Lock
                        size={14}
                        className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-500 transition-colors"
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all bg-gray-50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">
                      Confirmar Contraseña
                    </label>
                    <div className="relative group">
                      <Lock
                        size={14}
                        className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-primary-500 transition-colors"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-400 outline-none transition-all bg-gray-50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 rounded-lg transition-all text-sm"
                  >
                    Actualizar Contraseña
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
