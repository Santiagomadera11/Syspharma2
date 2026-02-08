import React, { useState, useEffect } from "react";
import { X, Save, Building2, User, Phone, Mail, MapPin, AlertCircle } from "lucide-react";
import { formValidations } from "../../../../shared/utils/formValidations";

const ProviderFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    empresa: "",
    contacto: "",
    telefono: "",
    correo: "",
    estado: "Activo",
    direccion: ""
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        empresa: "",
        contacto: "",
        telefono: "",
        correo: "",
        estado: "Activo",
        direccion: ""
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    
    let error = "";
    if (field === "empresa" || field === "contacto") {
      error = formValidations.validateName(value);
    } else if (field === "telefono") {
      error = formValidations.validatePhone(value);
    } else if (field === "correo") {
      error = formValidations.validateEmail(value);
    }
    setErrors({ ...errors, [field]: error });
  };

  const handleSubmit = () => {
    const newErrors = {
      empresa: formValidations.validateName(formData.empresa),
      contacto: formValidations.validateName(formData.contacto),
      telefono: formValidations.validatePhone(formData.telefono),
      correo: formValidations.validateEmail(formData.correo)
    };

    setErrors(newErrors);

    if (!formData.empresa || !formData.contacto || Object.values(newErrors).some(e => e)) {
      alert("Completa los campos correctamente");
      return;
    }

    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <Building2 size={16} className="text-emerald-600"/> Nuevo Proveedor
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Nombre Empresa */}
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la Empresa</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none ${
                  errors.empresa
                    ? "border-red-500 focus:ring-1 focus:ring-red-300"
                    : "border-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                }`}
                placeholder="Ej: Farmacéutica Global S.A." 
                value={formData.empresa}
                onChange={(e) => handleChange("empresa", e.target.value)}
              />
            </div>
            {errors.empresa && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                <AlertCircle size={12} />
                {errors.empresa}
              </div>
            )}
          </div>

          {/* Contacto */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de Contacto</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none ${
                  errors.contacto
                    ? "border-red-500 focus:ring-1 focus:ring-red-300"
                    : "border-gray-300 focus:border-emerald-500"
                }`}
                placeholder="Ej: Juan Pérez" 
                value={formData.contacto}
                onChange={(e) => handleChange("contacto", e.target.value)}
              />
            </div>
            {errors.contacto && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                <AlertCircle size={12} />
                {errors.contacto}
              </div>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="tel" 
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none ${
                  errors.telefono
                    ? "border-red-500 focus:ring-1 focus:ring-red-300"
                    : "border-gray-300 focus:border-emerald-500"
                }`}
                placeholder="+506 0000-0000" 
                value={formData.telefono}
                onChange={(e) => handleChange("telefono", e.target.value)}
              />
            </div>
            {errors.telefono && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                <AlertCircle size={12} />
                {errors.telefono}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="email" 
                className={`w-full pl-9 pr-3 py-2 text-sm border rounded-md focus:outline-none ${
                  errors.correo
                    ? "border-red-500 focus:ring-1 focus:ring-red-300"
                    : "border-gray-300 focus:border-emerald-500"
                }`}
                placeholder="contacto@empresa.com" 
                value={formData.correo}
                onChange={(e) => handleChange("correo", e.target.value)}
              />
            </div>
            {errors.correo && (
              <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                <AlertCircle size={12} />
                {errors.correo}
              </div>
            )}
          </div>

          {/* Estado */}
          <div className="col-span-2 md:col-span-1">
            <label className="block text-xs font-bold text-gray-700 mb-1">Estado</label>
            <select className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500 bg-white">
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          {/* Dirección */}
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Dirección Física</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
              <textarea 
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 h-20 resize-none" 
                placeholder="Provincia, Cantón, Distrito, Señas exactas..." 
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 text-xs font-bold text-white bg-[#34D399] hover:bg-emerald-500 rounded-md flex items-center gap-1 shadow-sm transition-colors"
          >
            <Save size={16} /> Guardar Proveedor
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProviderFormModal;

