import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Stethoscope,
  Clock,
  DollarSign,
  FileText,
  Eye,
  AlertCircle,
} from "lucide-react";
import { formValidations } from "../../../shared/utils/formValidations";
import { getServiceCategories } from "../../settings/services/parameterService";

const ServiceFormModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  isViewMode,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    estado: "Activo",
    precio: "",
    duracion: "",
    descripcion: "",
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [defaultCategory, setDefaultCategory] = useState("");

  useEffect(() => {
    // Load categories from localStorage
    const cats = getServiceCategories();
    setCategories(cats);
    const defaultCat = cats.length > 0 ? cats[0].value : "";
    setDefaultCategory(defaultCat);

    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nombre: "",
        categoria: defaultCat,
        estado: "Activo",
        precio: "",
        duracion: "",
        descripcion: "",
      });
    }
    setErrors({});

    // Listen for parameter updates
    const handleParameterUpdate = () => {
      const updatedCats = getServiceCategories();
      setCategories(updatedCats);
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
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Validación en tiempo real
    let error = "";
    if (field === "nombre") {
      error = formValidations.validateService(value);
    }
    setErrors({ ...errors, [field]: error });
  };

  const handleSubmit = () => {
    const nameError = formValidations.validateService(formData.nombre);
    setErrors({ ...errors, nombre: nameError });

    if (!formData.nombre || !formData.precio || nameError) {
      alert("Completa los campos obligatorios correctamente");
      return;
    }
    const dataToSave = {
      ...formData,
      precio: Number(formData.precio),
      duracion: Number(formData.duracion),
    };
    onSave(dataToSave);
    onClose();
  };

  const getTitle = () => {
    if (isViewMode) return "Detalle del Servicio";
    return initialData ? "Editar Servicio" : "Nuevo Servicio";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            {isViewMode ? (
              <Eye size={16} className="text-blue-600" />
            ) : (
              <Stethoscope size={16} className="text-emerald-600" />
            )}
            {getTitle()}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                disabled={isViewMode}
                className={`w-full pl-3 pr-3 py-2 text-sm border rounded-md focus:outline-none disabled:bg-gray-100 disabled:text-gray-500 ${
                  errors.nombre
                    ? "border-red-500 focus:ring-1 focus:ring-red-300"
                    : "border-gray-300 focus:border-emerald-500"
                }`}
                value={formData.nombre}
                onChange={(e) => handleChange("nombre", e.target.value)}
              />
              {errors.nombre && (
                <div className="flex items-center gap-1 mt-1 text-red-500 text-xs">
                  <AlertCircle size={12} />
                  {errors.nombre}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Categoría
              </label>
              <select
                disabled={isViewMode}
                className="w-full pl-2 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.value}>
                    {cat.value}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Estado
              </label>
              <select
                disabled={isViewMode}
                className="w-full pl-2 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 bg-white disabled:bg-gray-100 disabled:text-gray-500"
                value={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value })
                }
              >
                <option>Activo</option>
                <option>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md border border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Precio ($)
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <input
                  type="number"
                  disabled={isViewMode}
                  className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500"
                  value={formData.precio}
                  onChange={(e) =>
                    setFormData({ ...formData, precio: e.target.value })
                  }
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Duración (min)
              </label>
              <div className="relative">
                <Clock
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <input
                  type="number"
                  disabled={isViewMode}
                  className="w-full pl-7 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 disabled:bg-gray-100 disabled:text-gray-500"
                  value={formData.duracion}
                  onChange={(e) =>
                    setFormData({ ...formData, duracion: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Descripción
            </label>
            <div className="relative">
              <FileText
                className="absolute left-3 top-3 text-gray-400"
                size={16}
              />
              <textarea
                disabled={isViewMode}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-emerald-500 h-20 resize-none disabled:bg-gray-100 disabled:text-gray-500"
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
          >
            {isViewMode ? "Cerrar" : "Cancelar"}
          </button>
          {!isViewMode && (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-xs font-bold text-white bg-[#34D399] hover:bg-emerald-500 rounded-md flex items-center gap-1 shadow-sm transition-colors"
            >
              <Save size={16} /> Guardar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default ServiceFormModal;
