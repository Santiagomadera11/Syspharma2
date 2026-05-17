import React, { useState, useEffect, useRef } from "react";
import { Camera, Lock, Edit2, Check, X } from "lucide-react";
import { ChangePasswordModal } from "./components/ChangePasswordModal";
import { ToastNotification } from "../../shared/ui/ToastNotification";
import { authService } from "../auth//authService";
import { getDocumentTypes } from "../settings/services/parameterService";

export const ClientMiPerfil = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");
    } catch {
      return {};
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    telefono: "",
    documento: "",
    correo: "",
    direccion: "",
    tipoDocumento: "", // guarda el ID numérico
  });

  const [tempAvatar, setTempAvatar] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const sessionUser = authService.getCurrentUser() || {};
    setUser(sessionUser);

    const full = (sessionUser.nombre || "").trim();
    let derivedFirst = "";
    let derivedLast = "";

    if (full) {
      const parts = full.split(/\s+/);
      derivedFirst = parts.slice(0, 1).join(" ") || "";
      derivedLast = parts.slice(1).join(" ") || "";
    }

    setFormData({
      nombres: derivedFirst || sessionUser.nombres || "",
      apellidos: derivedLast || sessionUser.apellidos || "",
      telefono: sessionUser.telefono || "",
      documento: sessionUser.documento || "",
      correo: sessionUser.email || sessionUser.correo || "",
      direccion: sessionUser.direccion || "",
      // FIX: guardamos el ID numérico, no el texto
      tipoDocumento: sessionUser.tipoDocumentoId || "",
    });

    try {
      const types = getDocumentTypes();
      setDocumentTypes(types || []);
    } catch {
      setDocumentTypes([]);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!formData.nombres.trim() || !formData.apellidos.trim() || !formData.documento.trim()) {
      setToast({
        message: "Completa los campos requeridos (*)",
        type: "error",
        zIndex: 70,
      });
      return;
    }

    if (!user || !user.id) {
      setToast({
        message: "No se encontro una sesion activa de usuario",
        type: "error",
        zIndex: 70,
      });
      return;
    }

    try {
      const result = await authService.updateProfile(user.id, {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.correo,
        // FIX: mandamos el ID real como número, no hardcodeado en 1
        tipoDocumentoId: formData.tipoDocumento ? Number(formData.tipoDocumento) : null,
        documento: formData.documento,
        telefono: formData.telefono,
        direccion: formData.direccion,
      });

      if (result.error) {
        setToast({ message: result.message, type: "error", zIndex: 70 });
        return;
      }

      const unmanagedName = `${formData.nombres.trim()} ${formData.apellidos.trim()}`.trim();
      const sessionUpdates = {
        nombre: unmanagedName,
        email: formData.correo,
        correo: formData.correo,
        documento: formData.documento,
        telefono: formData.telefono,
        direccion: formData.direccion,
        // FIX: sincronizamos el ID en sesión para que al reabrir el form cargue correcto
        tipoDocumentoId: formData.tipoDocumento ? Number(formData.tipoDocumento) : null,
      };

      const updatedUserSession = authService.updateUserInSession(sessionUpdates);
      if (updatedUserSession) {
        setUser(updatedUserSession);
      }

      setIsEditing(false);
      setToast({
        message: "Perfil actualizado correctamente en el sistema",
        type: "success",
        zIndex: 70,
      });
    } catch (error) {
      setToast({
        message: "Error de conexion al guardar los cambios",
        type: "error",
        zIndex: 70,
      });
    }
  };

  const handlePasswordChanged = () => {
    setToast({
      message: "Contraseña actualizada correctamente",
      type: "success",
      zIndex: 70,
    });
  };

  const getInitials = () => {
    const full = (user.nombre || formData.nombres || "").trim();
    if (!full) return "US";
    const parts = full.split(/\s+/);
    const firstName = parts[0] || "";
    const firstLast = parts[1] || "";
    return `${firstName.charAt(0) || ""}${firstLast.charAt(0) || ""}`.toUpperCase();
  };

  const lastPasswordUpdate = user.lastPasswordUpdate
    ? new Date(user.lastPasswordUpdate).toLocaleDateString()
    : new Date(user.createdAt || Date.now()).toLocaleDateString();

  return (
    <div className="h-full flex flex-col gap-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gestiona tu información personal y seguridad
        </p>
      </div>

      {/* Grid Layout: Card 1 (1/3) + Card 2 (2/3) */}
      <div className="grid grid-cols-3 gap-6 items-start">
        {/* Card 1: Avatar y Información Básica */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center justify-start">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center border-4 border-blue-300 shadow-lg overflow-hidden">
              {tempAvatar ? (
                <img src={tempAvatar} alt="avatar-preview" className="w-full h-full object-cover" />
              ) : user.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-blue-600">{getInitials()}</span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => setTempAvatar(ev.target.result);
                reader.readAsDataURL(file);
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full shadow-lg transition-all active:scale-95"
            >
              <Camera size={18} />
            </button>

            {tempAvatar && (
              <div className="mt-3 text-center w-full">
                <button
                  onClick={() => {
                    const updated = authService.updateUserInSession({ avatar: tempAvatar });
                    if (updated) setUser(updated);
                    setTempAvatar(null);
                    setToast({ message: "Foto actualizada", type: "success", zIndex: 70 });
                  }}
                  className="mt-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-bold"
                >
                  Confirmar Foto
                </button>
              </div>
            )}
          </div>

          <h3 className="text-base font-bold text-gray-900 text-center mt-3 line-clamp-2">
            {user.nombre || "Nombre no asignado"}
          </h3>
          <p className="text-xs text-gray-600 text-center mt-1 truncate max-w-full">
            {user.email || user.correo || "Sin correo"}
          </p>
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mt-2 capitalize">
            {user.rol || "Usuario"}
          </span>
        </div>

        {/* Card 2: Información Personal */}
        <div className="col-span-2 bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col justify-start">
          <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Información Personal</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all active:scale-95"
              >
                <Edit2 size={16} /> Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all active:scale-95"
                >
                  <X size={16} /> Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg"
                >
                  <Check size={16} /> Guardar
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Nombres <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm read-only:bg-gray-50 read-only:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Apellidos <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm read-only:bg-gray-50 read-only:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Tipo de Documento</label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-50 disabled:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              >
                <option value="">--</option>
                {/* FIX: value usa dt.id (número) en vez de dt.value (texto) */}
                {documentTypes.map((dt) => (
                  <option key={dt.id} value={dt.id}>{dt.value}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Número de Documento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm read-only:bg-gray-50 read-only:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Celular</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm read-only:bg-gray-50 read-only:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Correo <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                readOnly={true}
                className="w-full px-3 py-2 border-2 border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm read-only:bg-gray-50 read-only:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Seguridad */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Seguridad</h3>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5 flex gap-4 mb-6">
          <Lock className="text-blue-600 flex-shrink-0 mt-0.5" size={24} />
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-900">Recomendación de Seguridad</p>
            <p className="text-sm text-blue-700 mt-2">
              Se recomienda cambiar la contraseña regularmente para mantener tu cuenta segura.
            </p>
            <p className="text-xs text-blue-600 mt-3 font-semibold">
              Última actualización: {lastPasswordUpdate}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg flex items-center gap-3 transition-all active:scale-95 shadow-md"
        >
          <Lock size={20} /> Cambiar Contraseña
        </button>
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onPasswordChanged={handlePasswordChanged}
      />

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

export default ClientMiPerfil;