import React, { useState, useEffect } from "react";
import { X, Save, Building2, User, Phone, Mail, MapPin, AlertCircle, FileText } from "lucide-react";

const TIPOS_DOCUMENTO = ["NIT", "Cédula", "Cédula Extranjería", "Pasaporte", "RUT"];

const ProviderFormModal = ({ isOpen, onClose, onSave, initialData, mode = "create", onDelete }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    tipoDocumento: "",
    documento: "",
    estado: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        nombre: initialData.nombre || "",
        contacto: initialData.contacto || "",
        telefono: initialData.telefono || "",
        email: initialData.email || "",
        direccion: initialData.direccion || "",
        tipoDocumento: initialData.tipoDocumento || "",
        documento: initialData.documento || "",
        estado: initialData.estado !== undefined ? initialData.estado : true,
      });
    } else {
      setFormData({
        nombre: "",
        contacto: "",
        telefono: "",
        email: "",
        direccion: "",
        tipoDocumento: "",
        documento: "",
        estado: true,
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isView = mode === "view";

  const getTitle = () => {
    if (mode === "create") return "Nuevo Proveedor";
    if (mode === "edit") return "Editar Proveedor";
    return "Detalle del Proveedor";
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nombre?.trim()) newErrors.nombre = "El nombre es requerido";
    if (!formData.contacto?.trim()) newErrors.contacto = "El contacto es requerido";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Correo inválido";
    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    if (onSave) onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <Building2 size={16} className="text-emerald-600" /> {getTitle()}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Nombre */}
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la Empresa *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                disabled={isView}
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none ${
                  errors.nombre ? "border-red-500" : "border-gray-300 focus:border-emerald-500"
                } disabled:bg-gray-100 disabled:text-gray-500`}
                placeholder="Ej: Farmacéutica Global S.A."
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
              />
            </div>
            {errors.nombre && <div className="flex items-center gap-1 mt-1 text-red-500 text-xs"><AlertCircle size={12} /> {errors.nombre}</div>}
          </div>

          {/* Tipo Documento */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Documento</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <select
                disabled={isView}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                value={formData.tipoDocumento}
                onChange={(e) => handleChange("tipoDocumento", e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {TIPOS_DOCUMENTO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Documento */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Número de Documento</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                disabled={isView}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="Ej: 900123456-1"
                value={formData.documento}
                onChange={(e) => handleChange("documento", e.target.value)}
              />
            </div>
          </div>

          {/* Contacto */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de Contacto *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                disabled={isView}
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none ${
                  errors.contacto ? "border-red-500" : "border-gray-300 focus:border-emerald-500"
                } disabled:bg-gray-100 disabled:text-gray-500`}
                placeholder="Ej: Juan Pérez"
                value={formData.contacto}
                onChange={(e) => handleChange("contacto", e.target.value)}
              />
            </div>
            {errors.contacto && <div className="flex items-center gap-1 mt-1 text-red-500 text-xs"><AlertCircle size={12} /> {errors.contacto}</div>}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="tel"
                disabled={isView}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="+57 300 000 0000"
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                disabled={isView}
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none ${
                  errors.email ? "border-red-500" : "border-gray-300 focus:border-emerald-500"
                } disabled:bg-gray-100 disabled:text-gray-500`}
                placeholder="contacto@empresa.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            {errors.email && <div className="flex items-center gap-1 mt-1 text-red-500 text-xs"><AlertCircle size={12} /> {errors.email}</div>}
          </div>

          {/* Estado */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Estado</label>
            <select
              disabled={isView}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
              value={formData.estado ? "true" : "false"}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value === "true" })}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </div>

          {/* Dirección */}
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Dirección</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
              <textarea
                disabled={isView}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 h-20 resize-none disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="Dirección del proveedor..."
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-between items-center">
          <div>
            {mode === "edit" && (
              <button
                onClick={() => { if (onDelete) onDelete(formData); onClose(); }}
                className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md"
              >
                Eliminar
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors">
              {isView ? "Cerrar" : "Cancelar"}
            </button>
            {!isView && (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md flex items-center gap-1 shadow-sm transition-colors"
              >
                <Save size={14} /> Guardar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderFormModal;