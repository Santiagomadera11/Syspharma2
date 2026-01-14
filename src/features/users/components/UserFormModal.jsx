import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { ToastNotification } from "../../../shared/ui/ToastNotification";
import { rolesService } from "../../settings/rolesService";

export const UserFormModal = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    documento: "",
    nombre: "",
    email: "",
    rol: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    estado: true,
  });
  const [toast, setToast] = useState(null);
  const [rolesOptions, setRolesOptions] = useState([]);

  useEffect(() => {
    if (userToEdit) {
      setFormData({ ...userToEdit, password: "", confirmPassword: "" });
    } else {
      setFormData({
        tipoDocumento: "",
        documento: "",
        nombre: "",
        email: "",
        rol: "",
        password: "",
        confirmPassword: "",
        telefono: "",
        estado: true,
      });
    }
    // load roles from rolesService
    setRolesOptions(rolesService.getAll());
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validation: all fields required except telefono when creating
    if (!userToEdit) {
      const required = [
        "tipoDocumento",
        "documento",
        "nombre",
        "email",
        "rol",
        "password",
        "confirmPassword",
      ];
      for (const k of required) {
        if (!formData[k] || String(formData[k]).trim() === "") {
          setToast({
            message: "Completa todos los campos obligatorios.",
            type: "error",
            zIndex: 70,
          });
          return;
        }
      }
      if (formData.password !== formData.confirmPassword) {
        setToast({
          message: "Las contraseñas no coinciden.",
          type: "error",
          zIndex: 70,
        });
        return;
      }
    }

    // prepare payload (exclude confirmPassword)
    const payload = { ...formData };
    delete payload.confirmPassword;

    onSave(payload);
    setToast({
      message: userToEdit
        ? "Usuario actualizado correctamente"
        : "Usuario creado correctamente",
      type: "success",
      zIndex: 70,
    });
    setTimeout(() => {
      onClose();
    }, 600);
  };

  // Clases comunes para inputs compactos
  const inputClass =
    "w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-all bg-gray-50 focus:bg-white";
  const labelClass =
    "block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      {/* Modal Compacto */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] animate-fade-in-up">
        {/* Encabezado Delgado */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <h2 className="text-sm font-bold text-gray-800">
            {userToEdit ? "Editar Usuario" : "Nuevo Usuario"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Formulario con Scroll Invisible */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3"
        >
          {/* Fila 1: Documento (1/3 y 2/3) */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className={labelClass}>Tipo Doc *</label>
              <select
                name="tipoDocumento"
                value={formData.tipoDocumento}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">--</option>
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelClass}>Número *</label>
              <input
                type="text"
                name="documento"
                value={formData.documento}
                onChange={handleChange}
                placeholder="Ej: 12345678"
                className={inputClass}
                required
              />
            </div>
          </div>

          {/* Nombre */}
          <div>
            <label className={labelClass}>Nombre Completo *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Juan Pérez"
              className={inputClass}
              required
            />
          </div>

          {/* Fila 2: Email y Teléfono (Mitad y mitad) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="juan@mail.com"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="300..."
                className={inputClass}
              />
            </div>
          </div>

          {/* Fila 3: Rol y Estado */}
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className={labelClass}>Rol *</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                className={inputClass}
                required
              >
                <option value="">Seleccionar</option>
                {rolesOptions.length === 0 && (
                  <option value="">-- No hay roles definidos --</option>
                )}
                {rolesOptions.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Switch Compacto */}
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg h-[34px]">
              <span className="text-[10px] font-bold text-gray-600 uppercase">
                Activo
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="estado"
                  checked={formData.estado}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>

          {/* Contraseñas */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className={labelClass}>
                Contraseña {userToEdit && "(Opcional)"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass}
                  required={!userToEdit}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {!userToEdit && (
              <div>
                <label className="block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide truncate">
                  Confirmar *
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
            )}
          </div>
        </form>

        {/* Footer de Botones */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-50 transition-colors text-xs"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-[#34D399] hover:bg-emerald-500 text-white font-bold py-2 rounded-lg shadow-sm transition-all text-xs"
          >
            {userToEdit ? "Guardar" : "Crear"}
          </button>
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
