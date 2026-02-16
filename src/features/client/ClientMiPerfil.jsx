import React, { useState, useEffect, useRef } from "react";
import { Camera, Lock, Edit2, Check, X } from "lucide-react";
import { ChangePasswordModal } from "./components/ChangePasswordModal";
import { ToastNotification } from "../../shared/ui/ToastNotification";
import { userService } from "../users/services/userService";
import { getDocumentTypes } from "../settings/services/parameterService";

/**
 * ClientMiPerfil - Vista de perfil para clientes (Fiel a Figma)
 * Card 1: Avatar + Nombre + Rol (columna angosta)
 * Card 2: Información Personal (columna ancha, editable)
 * Card 3: Seguridad (ancho completo)
 */
export const ClientMiPerfil = () => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("syspharma_user") || "{}");
    } catch {
      return {};
    }
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState(() => {
    try {
      const sessionUser = JSON.parse(
        localStorage.getItem("syspharma_user") || "{}",
      );
      // Get complete user data from syspharma_users by email
      const allUsers = JSON.parse(
        localStorage.getItem("syspharma_users") || "[]",
      );
      const completeUser =
        allUsers.find((u) => u.email === sessionUser.email) || sessionUser;

      // If registration used a single `nombre` field, split it into nombres/apellidos
      const full = (completeUser.nombre || completeUser.nombres || "").trim();
      let first = "";
      let last = "";
      if (full) {
        const parts = full.split(/\s+/);
        first = parts.slice(0, 1).join(" ") || "";
        last = parts.slice(1).join(" ") || completeUser.apellidos || "";
      }
      return {
        nombres: first || completeUser.nombres || "",
        apellidos: last || completeUser.apellidos || "",
        telefono: completeUser.telefono || completeUser.numeroContacto || "",
        documento:
          completeUser.documento ||
          completeUser.identificacion ||
          completeUser.numeroDocumento ||
          "",
        correo: completeUser.correo || completeUser.email || "",
        direccion: completeUser.direccion || "",
        tipoDocumento:
          completeUser.tipoDocumento || completeUser.tipo_doc || "",
      };
    } catch {
      return {
        nombres: "",
        apellidos: "",
        telefono: "",
        documento: "",
        correo: "",
        direccion: "",
        tipoDocumento: "",
      };
    }
  });
  const [tempAvatar, setTempAvatar] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const fileInputRef = useRef(null);

  // Cargar datos del usuario al montar
  useEffect(() => {
    const sessionUser = JSON.parse(
      localStorage.getItem("syspharma_user") || "{}",
    );
    setUser(sessionUser);
    // Get complete user data from syspharma_users by email
    try {
      const allUsers = JSON.parse(
        localStorage.getItem("syspharma_users") || "[]",
      );
      const completeUser =
        allUsers.find((u) => u.email === sessionUser.email) || sessionUser;
      // derive names from single `nombre` if present
      const full = (completeUser.nombre || completeUser.nombres || "").trim();
      const derivedFirst = full
        ? full.split(/\s+/).slice(0, 1).join(" ")
        : completeUser.nombres || "";
      const derivedLast = full
        ? full.split(/\s+/).slice(1).join(" ") || completeUser.apellidos || ""
        : completeUser.apellidos || "";
      setFormData({
        nombres: derivedFirst,
        apellidos: derivedLast,
        telefono: completeUser.telefono || completeUser.numeroContacto || "",
        documento:
          completeUser.documento ||
          completeUser.identificacion ||
          completeUser.numeroDocumento ||
          "",
        correo: completeUser.correo || completeUser.email || "",
        direccion: completeUser.direccion || "",
        tipoDocumento:
          completeUser.tipoDocumento || completeUser.tipo_doc || "",
      });
    } catch (err) {
      // fallback to session user only
      setFormData({
        nombres: (sessionUser.nombre || "").split(/\s+/).slice(0, 1).join(" "),
        apellidos: (sessionUser.nombre || "").split(/\s+/).slice(1).join(" "),
        telefono: "",
        documento: "",
        correo: sessionUser.email || "",
        direccion: "",
        tipoDocumento: "",
      });
    }
    // cargar tipos de documento
    try {
      const types = getDocumentTypes();
      setDocumentTypes(types || []);
    } catch (err) {
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

  const handleSaveProfile = () => {
    // Validar campos requeridos
    if (
      !formData.nombres ||
      !formData.apellidos ||
      !formData.documento ||
      !formData.telefono ||
      !formData.direccion
    ) {
      setToast({
        message: "Completa los campos requeridos",
        type: "error",
        zIndex: 70,
      });
      return;
    }

    try {
      // Use stored syspharma_user as source of truth and merge changes
      const stored = JSON.parse(localStorage.getItem("syspharma_user") || "{}");
      const updatedUser = {
        ...stored,
        ...formData,
      };
      // Recreate single `nombre` field to keep registration shape
      try {
        const n = (formData.nombres || "").trim();
        const a = (formData.apellidos || "").trim();
        if (n || a) {
          updatedUser.nombre = `${n} ${a}`.trim();
        }
      } catch (err) {
        // ignore
      }
      // normalize common aliases so global users array keys are updated too
      if (updatedUser.correo && !updatedUser.email)
        updatedUser.email = updatedUser.correo;
      if (updatedUser.telefono && !updatedUser.numeroContacto)
        updatedUser.numeroContacto = updatedUser.telefono;
      if (updatedUser.numeroContacto && !updatedUser.telefono)
        updatedUser.telefono = updatedUser.numeroContacto;
      if (updatedUser.tipoDocumento && !updatedUser.tipo_doc)
        updatedUser.tipo_doc = updatedUser.tipoDocumento;
      if (updatedUser.tipo_doc && !updatedUser.tipoDocumento)
        updatedUser.tipoDocumento = updatedUser.tipo_doc;
      // Preserve sensitive fields explicitly
      if (stored.password) updatedUser.password = stored.password;
      if (stored.rol) updatedUser.rol = stored.rol;

      localStorage.setItem("syspharma_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      // Also update global users array if user has an id or email match
      try {
        const allUsers = userService.getAll();
        const found = allUsers.find((u) => {
          // match by id
          if (u.id && updatedUser.id && u.id === updatedUser.id) return true;
          // match by email/correo
          const uEmail = u.email || u.correo || "";
          const updatedEmail =
            updatedUser.email || updatedUser.correo || updatedUser.mail || "";
          if (uEmail && updatedEmail && uEmail === updatedEmail) return true;
          // match by documento as fallback
          const uDoc = u.documento || u.identificacion || "";
          const updatedDoc =
            updatedUser.documento || updatedUser.identificacion || "";
          if (uDoc && updatedDoc && uDoc === updatedDoc) return true;
          return false;
        });
        if (found) {
          const merged = { ...found, ...updatedUser };
          if (found.password && !merged.password)
            merged.password = found.password;
          if (found.rol && !merged.rol) merged.rol = found.rol;
          userService.update(merged);
        }
      } catch (err) {
        // ignore
      }
      setIsEditing(false);
      setToast({
        message: "Perfil actualizado correctamente",
        type: "success",
        zIndex: 70,
      });
    } catch {
      setToast({
        message: "Error al actualizar perfil",
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
    // Use first name and first last name initials (supports `nombre` single-field)
    const full = (user.nombre || formData.nombres || "").trim();
    let firstName = "";
    let firstLast = "";
    if (full && user.nombre) {
      // If user has single `nombre`, split it
      const parts = full.split(/\s+/);
      firstName = parts[0] || "";
      firstLast = parts[1] || "";
    } else {
      // Otherwise use nombres/apellidos from formData
      firstName = (formData.nombres || "").split(" ")[0] || "";
      firstLast = (formData.apellidos || "").split(" ")[0] || "";
    }
    const initials = `${firstName.charAt(0) || ""}${firstLast.charAt(0) || ""}`;
    return initials.toUpperCase();
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

      {/* Grid Layout: Card 1 (1/3) + Card 2 (2/3) - Sin scroll, items-start */}
      <div className="grid grid-cols-3 gap-6 items-start">
        {/* Card 1: Avatar y Información Básica */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col items-center justify-start">
          {/* Avatar */}
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center border-4 border-blue-300 shadow-lg overflow-hidden">
              {tempAvatar ? (
                <img
                  src={tempAvatar}
                  alt="avatar-preview"
                  className="w-full h-full object-cover"
                />
              ) : user.avatar ? (
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-blue-600">
                  {getInitials()}
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files && e.target.files[0];
                if (!file) return;
                try {
                  const reader = new FileReader();
                  reader.onload = function (ev) {
                    const dataUrl = ev.target.result;
                    // set preview only, do NOT persist yet
                    setTempAvatar(dataUrl);
                  };
                  reader.readAsDataURL(file);
                } catch (err) {
                  // ignore
                }
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full shadow-lg transition-all active:scale-95 hover:shadow-xl"
            >
              <Camera size={18} />
            </button>
            {/* Confirmar Foto - solo aparece si hay preview */}
            {tempAvatar && (
              <div className="mt-3 text-center w-full">
                <button
                  onClick={() => {
                    try {
                      // Persist avatar to current session user
                      const stored = JSON.parse(
                        localStorage.getItem("syspharma_user") || "{}",
                      );
                      const updated = {
                        ...stored,
                        avatar: tempAvatar,
                        lastAvatarUpdate: new Date().toISOString(),
                      };
                      // Ensure we don't remove password/rol
                      if (stored.password) updated.password = stored.password;
                      if (stored.rol) updated.rol = stored.rol;
                      localStorage.setItem(
                        "syspharma_user",
                        JSON.stringify(updated),
                      );
                      setUser(updated);

                      // update global users if exists
                      try {
                        const allUsers = userService.getAll();
                        const found = allUsers.find(
                          (u) =>
                            u.id === updated.id || u.email === updated.email,
                        );
                        if (found) {
                          userService.update({ ...found, avatar: tempAvatar });
                        }
                      } catch (err) {
                        // ignore
                      }

                      setTempAvatar(null);
                      setToast({
                        message: "Foto actualizada",
                        type: "success",
                        zIndex: 70,
                      });
                    } catch (err) {
                      setToast({
                        message: "Error guardando la foto",
                        type: "error",
                        zIndex: 70,
                      });
                    }
                  }}
                  className="mt-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-bold"
                >
                  Confirmar Foto
                </button>
              </div>
            )}
          </div>

          {/* Nombre - De user state */}
          <h3 className="text-base font-bold text-gray-900 text-center mt-3 line-clamp-2">
            {(user.nombres || user.nombre || "").trim() ||
            (user.apellidos || "").trim()
              ? `${(user.nombres || user.nombre || "").trim()} ${(user.apellidos || "").trim()}`.trim()
              : "Nombre no asignado"}
          </h3>

          {/* Correo Electrónico */}
          <p className="text-xs text-gray-600 text-center mt-1 truncate">
            {user.correo || user.email || "sin correo"}
          </p>

          {/* Badge Rol - De user state */}
          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mt-2 capitalize">
            {user.rol === "cliente" ? "Cliente" : user.rol || "Cliente"}
          </span>
        </div>

        {/* Card 2: Información Personal - 2 columnas de ancho */}
        <div className="col-span-2 bg-white rounded-xl shadow-md border border-gray-100 p-6 flex flex-col justify-start">
          {/* Header con botón Editar/Guardar */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">
              Información Personal
            </h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all active:scale-95"
              >
                <Edit2 size={16} />
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all active:scale-95"
                >
                  <X size={16} />
                  Cancelar
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md hover:shadow-lg"
                >
                  <Check size={16} />
                  Guardar
                </button>
              </div>
            )}
          </div>

          {/* Formulario - Grid de 2 columnas */}
          <div className="grid grid-cols-2 gap-4">
            {/* Fila 1: Nombres */}
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
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm read-only:bg-gray-50 read-only:text-gray-700 read-only:cursor-default read-only:border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Fila 1: Apellidos */}
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
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm read-only:bg-gray-50 read-only:text-gray-700 read-only:cursor-default read-only:border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Fila 2: Tipo de Documento */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Tipo de Documento
              </label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white disabled:bg-gray-50 disabled:text-gray-700 disabled:cursor-default disabled:border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              >
                <option value="">--</option>
                {documentTypes.map((dt) => (
                  <option key={dt.id} value={dt.value}>
                    {dt.value}
                  </option>
                ))}
              </select>
            </div>

            {/* Fila 2: Número de Documento */}
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
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm read-only:bg-gray-50 read-only:text-gray-700 read-only:cursor-default read-only:border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Fila 3: Celular */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Celular <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm read-only:bg-gray-50 read-only:text-gray-700 read-only:cursor-default read-only:border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400"
              />
            </div>

            {/* Fila 3: Correo */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Correo <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm read-only:bg-gray-50 read-only:text-gray-700 read-only:cursor-default read-only:border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              />
            </div>

            {/* Fila 4: Dirección (col-span-2) */}
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm read-only:bg-gray-50 read-only:text-gray-700 read-only:cursor-default read-only:border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Seguridad - Full Width */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Seguridad</h3>

        {/* Aviso de Seguridad */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5 flex gap-4 mb-6">
          <Lock className="text-blue-600 flex-shrink-0 mt-0.5" size={24} />
          <div className="flex-1">
            <p className="text-sm font-bold text-blue-900">
              Recomendación de Seguridad
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Se recomienda cambiar la contraseña regularmente para mantener tu
              cuenta segura.
            </p>
            <p className="text-xs text-blue-600 mt-3 font-semibold">
              Última actualización: {lastPasswordUpdate}
            </p>
          </div>
        </div>

        {/* Botón Cambiar Contraseña */}
        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-lg flex items-center gap-3 transition-all active:scale-95 shadow-md hover:shadow-lg"
        >
          <Lock size={20} />
          Cambiar Contraseña
        </button>
      </div>

      {/* Modal Cambiar Contraseña */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onPasswordChanged={handlePasswordChanged}
      />

      {/* Toast Notification */}
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
