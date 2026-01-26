import React, { useState, useEffect } from "react";
import { Camera, Lock, Edit2, Check, X } from "lucide-react";
import { ChangePasswordModal } from "./components/ChangePasswordModal";
import { ToastNotification } from "../../shared/ui/ToastNotification";

/**
 * ClientMiPerfil - Vista de perfil para clientes (Fiel a Figma)
 * Card 1: Avatar + Nombre + Rol (columna angosta)
 * Card 2: Información Personal (columna ancha, editable)
 * Card 3: Seguridad (ancho completo)
 */
export const ClientMiPerfil = () => {
  const [user, setUser] = useState({
    nombres: "",
    apellidos: "",
    rol: "cliente",
    numeroContacto: "",
    documento: "",
    fechaNacimiento: "",
    correo: "",
    direccion: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    numeroContacto: "",
    documento: "",
    fechaNacimiento: "",
    correo: "",
    direccion: "",
  });

  // Cargar datos del usuario al montar
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("syspharma_user") || "{}");
    setUser(userData);
    setFormData({
      nombres: userData.nombres || "",
      apellidos: userData.apellidos || "",
      numeroContacto: userData.numeroContacto || "",
      documento: userData.documento || "",
      fechaNacimiento: userData.fechaNacimiento || "",
      correo: userData.correo || userData.email || "",
      direccion: userData.direccion || "",
    });
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
      !formData.correo
    ) {
      setToast({
        message: "Completa los campos requeridos",
        type: "error",
        zIndex: 70,
      });
      return;
    }

    try {
      // Actualizar en localStorage
      const updatedUser = {
        ...user,
        ...formData,
      };
      localStorage.setItem("syspharma_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditing(false);
      setToast({
        message: "Perfil actualizado correctamente",
        type: "success",
        zIndex: 70,
      });
    } catch (error) {
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
    const names = `${formData.nombres || ""} ${formData.apellidos || ""}`;
    return names
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center border-4 border-blue-300 shadow-lg">
              <span className="text-3xl font-bold text-blue-600">
                {getInitials()}
              </span>
            </div>
            <button className="absolute bottom-1 right-1 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full shadow-lg transition-all active:scale-95 hover:shadow-xl">
              <Camera size={18} />
            </button>
          </div>

          {/* Nombre - De user state */}
          <h2 className="text-base font-bold text-gray-900 text-center mt-3 line-clamp-2">
            {user.nombres || "Usuario"} {user.apellidos || ""}
          </h2>

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

            {/* Fila 2: Documento */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Documento <span className="text-red-500">*</span>
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

            {/* Fila 2: Teléfono */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                Teléfono
              </label>
              <input
                type="tel"
                name="numeroContacto"
                value={formData.numeroContacto}
                onChange={handleInputChange}
                readOnly={!isEditing}
                placeholder="+57 300 0000000"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm read-only:bg-gray-50 read-only:text-gray-700 read-only:cursor-default read-only:border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-gray-400"
              />
            </div>

            {/* Fila 3: Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                F. Nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                readOnly={!isEditing}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm read-only:bg-gray-50 read-only:text-gray-700 read-only:cursor-default read-only:border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
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
                placeholder="Calle, número, apartamento, ciudad..."
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
