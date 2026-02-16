import React, { useState, useEffect } from "react";
import { X, Eye, EyeOff, AlertCircle } from "lucide-react";
import { ToastNotification } from "../../../shared/ui/ToastNotification";
import { rolesService } from "../../settings/rolesService";
import { formValidations } from "../../../shared/utils/formValidations";
import { getDocumentTypes } from "../../settings/services/parameterService";

export const UserFormModal = ({ isOpen, onClose, onSave, userToEdit }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    tipoDocumento: "",
    documento: "",
    nombres: "",
    apellidos: "",
    email: "",
    rol: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    estado: true,
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);

  useEffect(() => {
    if (userToEdit) {
      // Map userToEdit shape (which may have `nombre` single field) to modal fields
      const nombreFull = userToEdit.nombre || userToEdit.nombres || "";
      const nameParts = (nombreFull || "").trim().split(/\s+/);
      const firstName = nameParts.slice(0, 1).join(" ") || "";
      const lastName =
        nameParts.slice(1).join(" ") || userToEdit.apellidos || "";

      setFormData({
        tipoDocumento: userToEdit.tipoDocumento || userToEdit.tipo_doc || "",
        documento: userToEdit.documento || "",
        nombres: userToEdit.nombres || firstName,
        apellidos: userToEdit.apellidos || lastName,
        email: userToEdit.email || userToEdit.correo || "",
        rol: userToEdit.rol || "",
        password: "",
        confirmPassword: "",
        telefono: userToEdit.telefono || userToEdit.numeroContacto || "",
        estado:
          typeof userToEdit.estado === "boolean" ? userToEdit.estado : true,
      });
    } else {
      setFormData({
        tipoDocumento: "",
        documento: "",
        nombres: "",
        apellidos: "",
        email: "",
        rol: "",
        password: "",
        confirmPassword: "",
        telefono: "",
        estado: true,
      });
    }
    setErrors({});
    // load roles from rolesService
    setRolesOptions(rolesService.getAll());

    // Load document types
    const types = getDocumentTypes();
    setDocumentTypes(types);

    // Listen for parameter updates
    const handleParameterUpdate = () => {
      const updatedTypes = getDocumentTypes();
      setDocumentTypes(updatedTypes);
    };

    window.addEventListener(
      "syspharma_parameters_updated",
      handleParameterUpdate,
    );
    return () => {
      window.removeEventListener(
        "syspharma_parameters_updated",
        handleParameterUpdate,
      );
    };
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: newValue });

    // Validar campo en tiempo real
    let error = "";
    if (name === "nombres" || name === "apellidos") {
      error = formValidations.validateName(newValue);
    } else if (name === "documento") {
      error = formValidations.validateDocument(newValue);
    } else if (name === "telefono") {
      error = formValidations.validatePhone(newValue);
    } else if (name === "email") {
      error = formValidations.validateEmail(newValue);
    }

    setErrors({ ...errors, [name]: error });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar todos los campos
    let newErrors = {};
    newErrors.nombres = formValidations.validateName(formData.nombres);
    newErrors.apellidos = formValidations.validateName(formData.apellidos);
    newErrors.documento = formValidations.validateDocument(formData.documento);
    newErrors.telefono = formValidations.validatePhone(formData.telefono);
    newErrors.email = formValidations.validateEmail(formData.email);

    setErrors(newErrors);

    // Validation: all fields required except telefono when creating
    if (!userToEdit) {
      const required = [
        "tipoDocumento",
        "documento",
        "nombres",
        "apellidos",
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

    // Verificar que no haya errores
    if (Object.values(newErrors).some((error) => error)) {
      setToast({
        message: "Por favor corrija los errores en el formulario.",
        type: "error",
        zIndex: 70,
      });
      return;
    }

    // prepare payload (exclude confirmPassword)
    let payload = { ...formData };
    delete payload.confirmPassword;

    // If editing existing user, avoid overwriting password when left empty
    if (userToEdit) {
      // Merge with original user to preserve fields like password/avatar/email when empty in the form
      payload = {
        ...userToEdit,
        ...payload,
      };

      // If password field is empty, remove it from payload so update() won't overwrite existing password
      if (!formData.password) {
        delete payload.password;
      }
    }

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
  const inputClass = (hasError = false) =>
    `w-full px-3 py-1.5 border rounded-lg text-xs outline-none focus:ring-1 transition-all bg-gray-50 focus:bg-white ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-red-300"
        : "border-gray-200 focus:border-primary-400 focus:ring-primary-100"
    }`;
  const labelClass =
    "block text-[10px] font-bold text-gray-600 mb-1 uppercase tracking-wide";

  const ErrorMessage = ({ error }) => {
    if (!error) return null;
    return (
      <div className="flex items-center gap-1 mt-0.5 text-red-500 text-[9px]">
        <AlertCircle size={10} />
        {error}
      </div>
    );
  };

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
                {documentTypes.map((dt) => (
                  <option key={dt.id} value={dt.value}>
                    {dt.value}
                  </option>
                ))}
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
                className={inputClass(!!errors.documento)}
                required
              />
              <ErrorMessage error={errors.documento} />
            </div>
          </div>

          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Nombres *</label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                placeholder="Juan"
                className={inputClass(!!errors.nombres)}
                required
              />
              <ErrorMessage error={errors.nombres} />
            </div>
            <div>
              <label className={labelClass}>Apellidos *</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="Pérez"
                className={inputClass(!!errors.apellidos)}
                required
              />
              <ErrorMessage error={errors.apellidos} />
            </div>
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
                className={inputClass(!!errors.email)}
                required
              />
              <ErrorMessage error={errors.email} />
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="300..."
                className={inputClass(!!errors.telefono)}
              />
              <ErrorMessage error={errors.telefono} />
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
