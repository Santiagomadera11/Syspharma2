import React, { useState, useEffect, useRef } from "react";
import { X, Save, AlertCircle, Upload } from "lucide-react";
import { formValidations } from "../../../../shared/utils/formValidations";

const ProductModal = ({ isOpen, onClose, onSave, initialData, categories = [], providers = [] }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    tipoProducto: "Producto General",
    categoria: "",
    proveedor: "",
    precio: "",
    stock: "",
    estado: "Activo",
    imagen: null,
    // Campos técnicos (solo para medicamentos)
    composicion: "",
    concentracion: "",
    presentacion: "",
    viaAdministracion: "",
    registroSanitario: "",
    requiereFormula: false,
    // Configuración de Visibilidad
    esDestacado: false,
    enOferta: false,
    porcentajeDescuento: 0,
    esRecomendado: false,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Control del panel colapsable de "Configuración de Visibilidad"
  const [showVisibility, setShowVisibility] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.imagen || null);
    } else {
      setFormData({
        nombre: "",
        tipoProducto: "Producto General",
        categoria: "",
        proveedor: "",
        precio: "",
        stock: "",
        estado: "Activo",
        imagen: null,
        composicion: "",
        concentracion: "",
        presentacion: "",
        viaAdministracion: "",
        registroSanitario: "",
        requiereFormula: false,
        esDestacado: false,
        enOferta: false,
        porcentajeDescuento: 0,
        esRecomendado: false,
      });
      setImagePreview(null);
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setFormData({ ...formData, imagen: base64 });
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const isMedicamento = formData.tipoProducto === "Medicamento";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-sm">
            {initialData ? "Editar Producto" : "Nuevo Producto"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar">
          {/* Imagen del Producto */}
          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Imagen del Producto
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500 transition bg-gray-50">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center"
              >
                {imagePreview ? (
                  <div className="flex flex-col items-center">
                    <img src={imagePreview} alt="Preview" className="max-h-32 max-w-full object-contain mb-2 rounded" />
                    <p className="text-xs text-gray-500">Haz clic para cambiar imagen</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload size={24} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-600">Sube una imagen</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF hasta 5MB</p>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Nombre */}
          <div className="col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              value={formData.nombre}
              onChange={(e) => {
                setFormData({ ...formData, nombre: e.target.value });
              }}
            />
          </div>

          {/* Tipo de Producto */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Tipo de Producto
            </label>
            <select
              className="w-full text-sm border border-gray-300 rounded px-3 py-2"
              value={formData.tipoProducto}
              onChange={(e) =>
                setFormData({ ...formData, tipoProducto: e.target.value })
              }
            >
              <option value="Producto General">Producto General</option>
              <option value="Medicamento">Medicamento</option>
            </select>
          </div>

          {/* Grid de campos básicos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Categoría
              </label>
              <select
                className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
              >
                <option value="">Seleccionar...</option>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.nombre}>
                      {cat.nombre}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay categorías disponibles</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Proveedor
              </label>
              <select
                className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                value={formData.proveedor}
                onChange={(e) =>
                  setFormData({ ...formData, proveedor: e.target.value })
                }
              >
                <option value="">Seleccionar...</option>
                {providers.length > 0 ? (
                  providers.map((provider) => (
                    <option key={provider.id} value={provider.empresa || provider.nombre}>
                      {provider.empresa || provider.nombre}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay proveedores disponibles</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Precio ($)
              </label>
              <input
                type="number"
                className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                value={formData.precio}
                onChange={(e) =>
                  setFormData({ ...formData, precio: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
              />
            </div>
          </div>

          {/* Sección Información Técnica - Medicamentos */}
          {isMedicamento && (
            <div className="mt-4 pt-4 border-t border-gray-200 animate-in fade-in duration-300 slide-in-from-top-2">
              <h4 className="font-bold text-gray-800 text-sm mb-3">
                Información Técnica
              </h4>
              <div className="space-y-3">
                {/* Composición */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Composición
                  </label>
                  <textarea
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                    rows="2"
                    placeholder="Ej: Amoxicilina trihidratada..."
                    value={formData.composicion}
                    onChange={(e) =>
                      setFormData({ ...formData, composicion: e.target.value })
                    }
                  />
                </div>

                {/* Grid para Concentración y Presentación */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Concentración
                    </label>
                    <input
                      type="text"
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                      placeholder="Ej: 500mg"
                      value={formData.concentracion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          concentracion: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Presentación
                    </label>
                    <input
                      type="text"
                      className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                      placeholder="Ej: Cápsula, Tableta"
                      value={formData.presentacion}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          presentacion: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Vía de Administración */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Vía de Administración
                  </label>
                  <select
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                    value={formData.viaAdministracion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        viaAdministracion: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Oral">Oral</option>
                    <option value="Inyectable">Inyectable</option>
                    <option value="Tópica">Tópica</option>
                    <option value="Inhalatoria">Inhalatoria</option>
                    <option value="Sublingual">Sublingual</option>
                    <option value="Rectal">Rectal</option>
                  </select>
                </div>

                {/* Registro Sanitario */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Registro Sanitario
                  </label>
                  <input
                    type="text"
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                    placeholder="Ej: M-12345-2024"
                    value={formData.registroSanitario}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        registroSanitario: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Switch Requiere Fórmula Médica */}
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    formData.requiereFormula
                      ? "bg-blue-100 border-blue-400"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <label className="text-xs font-bold text-gray-700">
                    Requiere Fórmula Médica
                  </label>
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        requiereFormula: !formData.requiereFormula,
                      })
                    }
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${
                      formData.requiereFormula
                        ? "bg-blue-600 shadow-md shadow-blue-200"
                        : "bg-gray-300 shadow-md shadow-gray-200"
                    }`}
                    role="switch"
                    aria-checked={formData.requiereFormula}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.requiereFormula
                          ? "translate-x-5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sección Configuración de Visibilidad (colapsable) */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              aria-expanded={showVisibility ? "true" : "false"}
              onClick={() => setShowVisibility((v) => !v)}
              className="w-full flex items-center justify-between gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-800">📍 Configuración de Visibilidad</span>

                {/* Resumen rápido */}
                <div className="flex items-center gap-2">
                  {formData.esDestacado && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">Destacado</span>
                  )}
                  {formData.enOferta && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">Oferta</span>
                  )}
                  {formData.esRecomendado && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">Recomendado</span>
                  )}
                </div>
              </div>

              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${showVisibility ? 'rotate-180' : 'rotate-0'}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                xmlns="http://www.w3.org/2000/svg"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showVisibility && (
              <div className="mt-3 space-y-3">
                {/* Switch Destacado */}
                <div className="flex items-center justify-between p-3 rounded-lg border transition-all bg-white border-gray-200 hover:border-emerald-300">
                  <label className="text-xs font-bold text-gray-700">Mostrar en Destacados</label>
                  <button
                    onClick={() => setFormData({ ...formData, esDestacado: !formData.esDestacado })}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${formData.esDestacado ? 'bg-emerald-600 shadow-md shadow-emerald-200' : 'bg-gray-300 shadow-md shadow-gray-200'}`}
                    role="switch"
                    aria-checked={formData.esDestacado}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.esDestacado ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Switch Oferta */}
                <div className="flex items-center justify-between p-3 rounded-lg border transition-all bg-white border-gray-200 hover:border-emerald-300">
                  <label className="text-xs font-bold text-gray-700">Mostrar en Ofertas</label>
                  <button
                    onClick={() => setFormData({ ...formData, enOferta: !formData.enOferta })}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${formData.enOferta ? 'bg-emerald-600 shadow-md shadow-emerald-200' : 'bg-gray-300 shadow-md shadow-gray-200'}`}
                    role="switch"
                    aria-checked={formData.enOferta}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.enOferta ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                {/* Porcentaje Descuento - Solo si está en Oferta */}
                {formData.enOferta && (
                  <div className="pl-3 pr-3 py-2">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Porcentaje de Descuento (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      className="w-full text-sm border border-emerald-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="Ej: 15"
                      value={formData.porcentajeDescuento}
                      onChange={(e) => setFormData({ ...formData, porcentajeDescuento: Math.min(100, Math.max(0, Number(e.target.value))) })}
                    />
                  </div>
                )}

                {/* Switch Recomendado */}
                <div className="flex items-center justify-between p-3 rounded-lg border transition-all bg-white border-gray-200 hover:border-emerald-300">
                  <label className="text-xs font-bold text-gray-700">Mostrar en Recomendados</label>
                  <button
                    onClick={() => setFormData({ ...formData, esRecomendado: !formData.esRecomendado })}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${formData.esRecomendado ? 'bg-emerald-600 shadow-md shadow-emerald-200' : 'bg-gray-300 shadow-md shadow-gray-200'}`}
                    role="switch"
                    aria-checked={formData.esRecomendado}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.esRecomendado ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 text-xs font-bold text-white bg-[#34D399] hover:bg-emerald-500 rounded flex items-center gap-1"
          >
            <Save size={14} /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProductModal;
