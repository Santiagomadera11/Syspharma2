import React, { useState } from "react";
import { X, Lock, AlertCircle, CheckCircle } from "lucide-react";

/**
 * Modal para cambiar contraseña con validación en 2 pasos
 */
export const ChangePasswordModal = ({ isOpen, onClose, onPasswordChanged }) => {
  const [step, setStep] = useState(1); // Paso 1: validar actual, Paso 2: nueva contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleValidateCurrentPassword = (e) => {
    e.preventDefault();
    setError("");

    if (!currentPassword) {
      setError("Ingresa tu contraseña actual");
      return;
    }

    const user = JSON.parse(localStorage.getItem("syspharma_user") || "{}");

    // Validar contraseña (asumiendo que se guarda en plain text por ahora)
    if (currentPassword !== (user.password || "")) {
      setError("La contraseña actual no es correcta");
      return;
    }

    // Pasar al paso 2
    setStep(2);
    setCurrentPassword("");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword) {
      setError("Ingresa la nueva contraseña");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);

      // Actualizar contraseña en localStorage
      const user = JSON.parse(localStorage.getItem("syspharma_user") || "{}");
      user.password = newPassword;
      user.lastPasswordUpdate = new Date().toISOString();
      localStorage.setItem("syspharma_user", JSON.stringify(user));

      // Reset form
      setStep(1);
      setNewPassword("");
      setConfirmPassword("");
      setError("");

      // Callback
      if (onPasswordChanged) {
        onPasswordChanged();
      }

      // Cerrar modal después de 1 segundo
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      setError("Error al actualizar contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
        {/* Modal */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full mx-4">
          {/* Header */}
          <div className="px-6 py-5 border-b border-cyan-100 bg-cyan-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="text-cyan-700" size={20} />
              <div>
                <h2 className="text-lg font-semibold text-cyan-900">
                  Cambiar Contraseña
                </h2>
                <p className="text-xs text-cyan-700">
                  {step === 1
                    ? "Verificación de seguridad"
                    : "Nueva contraseña"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-cyan-600 hover:bg-cyan-100 transition-colors p-1 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Paso 1: Validar contraseña actual */}
            {step === 1 && (
              <form
                onSubmit={handleValidateCurrentPassword}
                className="space-y-4"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex gap-2">
                  <AlertCircle
                    className="text-blue-600 flex-shrink-0"
                    size={18}
                  />
                  <p className="text-sm text-blue-700">
                    Por seguridad, ingresa tu contraseña actual para continuar
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:bg-blue-50 text-gray-900"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                    <AlertCircle
                      className="text-red-600 flex-shrink-0"
                      size={18}
                    />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-2.5 rounded-lg font-bold text-white transition-all ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                  }`}
                >
                  {loading ? "Validando..." : "Continuar"}
                </button>
              </form>
            )}

            {/* Paso 2: Nueva contraseña */}
            {step === 2 && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex gap-2">
                  <CheckCircle
                    className="text-green-600 flex-shrink-0"
                    size={18}
                  />
                  <p className="text-sm text-green-700">
                    ✓ Verificación completada. Ingresa tu nueva contraseña
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:bg-blue-50 text-gray-900"
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:bg-blue-50 text-gray-900"
                    disabled={loading}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                    <AlertCircle
                      className="text-red-600 flex-shrink-0"
                      size={18}
                    />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setNewPassword("");
                      setConfirmPassword("");
                      setError("");
                    }}
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-lg font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`flex-1 py-2.5 rounded-lg font-bold text-white transition-all ${
                      loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 active:scale-95"
                    }`}
                  >
                    {loading ? "Actualizando..." : "Cambiar Contraseña"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordModal;
