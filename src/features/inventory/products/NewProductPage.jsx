import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, DollarSign, Package } from "lucide-react";
import { productService } from "./services/productService";
import { categoryService } from "../categories/services/categoryService";
import { providerService } from "../providers/services/providerService";

const NewProductPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    tipoProducto: "Producto General",
    categoria: "",
    proveedor: "",
    precio: "",
    stock: "",
    estado: "Activo",
    // Campos de visibilidad
    esDestacado: false,
    enOferta: false,
    porcentajeDescuento: 0,
    esRecomendado: false,
    // Campos técnicos (medicamento)
    composicion: "",
    concentracion: "",
    presentacion: "",
    viaAdministracion: "",
    registroSanitario: "",
    requiereFormula: false,
  });

  useEffect(() => {
    setCategories(categoryService.getAll());
    setProviders(providerService.getAll());

    const onChange = () => {
      setCategories(categoryService.getAll());
      setProviders(providerService.getAll());
    };

    window.addEventListener("categories:changed", onChange);
    window.addEventListener("providers:changed", onChange);
    return () => {
      window.removeEventListener("categories:changed", onChange);
      window.removeEventListener("providers:changed", onChange);
    };
  }, []);

  const handleSave = () => {
    // Normalizar tipos
    const payload = {
      ...formData,
      precio: Number(formData.precio) || 0,
      stock: Number(formData.stock) || 0,
    };

    productService.create(payload);

    // Notificar cambios y volver al listado
    window.dispatchEvent(new CustomEvent("products:changed"));
    window.dispatchEvent(new CustomEvent("syspharma_products_updated"));

    navigate("/admin/productos");
  };

  return (
    <div className="h-full p-6 font-sans text-gray-800 bg-white md:bg-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-md hover:bg-gray-100 border border-gray-100"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg font-bold">Agregar Producto</h1>
              <p className="text-xs text-gray-500">Crear un nuevo producto en el inventario</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md text-sm font-medium shadow-sm"
            >
              <Save size={14} /> Guardar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left - Datos básicos (2/3) */}
          <div className="md:col-span-2 bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
                <input
                  type="text"
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Producto</label>
                <select
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                  value={formData.tipoProducto}
                  onChange={(e) => setFormData({ ...formData, tipoProducto: e.target.value })}
                >
                  <option value="Producto General">Producto General</option>
                  <option value="Medicamento">Medicamento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Categoría</label>
                <select
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
                    ))
                  ) : (
                    <option disabled>No hay categorías disponibles</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Proveedor</label>
                <select
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                >
                  <option value="">Seleccionar...</option>
                  {providers.length > 0 ? (
                    providers.map((p) => (
                      <option key={p.id} value={p.empresa || p.nombre}>{p.empresa || p.nombre}</option>
                    ))
                  ) : (
                    <option disabled>No hay proveedores disponibles</option>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Precio ($)</label>
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="number"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Stock</label>
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="number"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>

              {/* Información técnica (solo para Medicamento) */}
              {formData.tipoProducto === 'Medicamento' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-bold text-gray-800 text-sm mb-3">Información Técnica</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Composición</label>
                      <textarea
                        className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                        rows={2}
                        placeholder="Ej: Amoxicilina trihidratada..."
                        value={formData.composicion}
                        onChange={(e) => setFormData({ ...formData, composicion: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Concentración</label>
                        <input
                          type="text"
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                          placeholder="Ej: 500mg"
                          value={formData.concentracion}
                          onChange={(e) => setFormData({ ...formData, concentracion: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Presentación</label>
                        <input
                          type="text"
                          className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                          placeholder="Ej: Cápsula, Tableta"
                          value={formData.presentacion}
                          onChange={(e) => setFormData({ ...formData, presentacion: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Vía de Administración</label>
                      <select
                        className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                        value={formData.viaAdministracion}
                        onChange={(e) => setFormData({ ...formData, viaAdministracion: e.target.value })}
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

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Registro Sanitario</label>
                      <input
                        type="text"
                        className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                        placeholder="Ej: M-12345-2024"
                        value={formData.registroSanitario}
                        onChange={(e) => setFormData({ ...formData, registroSanitario: e.target.value })}
                      />
                    </div>

                    <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${formData.requiereFormula ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border-gray-200'}`}>
                      <label className="text-xs font-bold text-gray-700">Requiere Fórmula Médica</label>
                      <button
                        onClick={() => setFormData({ ...formData, requiereFormula: !formData.requiereFormula })}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${formData.requiereFormula ? 'bg-blue-600 shadow-md shadow-blue-200' : 'bg-gray-300 shadow-md shadow-gray-200'}`}
                        role="switch"
                        aria-checked={formData.requiereFormula}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.requiereFormula ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right - Configuración de visibilidad (1/3) */}
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-gray-800">Configuración de Visibilidad</h4>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-white border-gray-200">
                <label className="text-xs font-bold text-gray-700">Mostrar en Destacados</label>
                <button
                  onClick={() => setFormData((f) => ({ ...f, esDestacado: !f.esDestacado }))}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${formData.esDestacado ? 'bg-emerald-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.esDestacado ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border bg-white border-gray-200">
                <label className="text-xs font-bold text-gray-700">Mostrar en Ofertas</label>
                <button
                  onClick={() => setFormData((f) => ({ ...f, enOferta: !f.enOferta }))}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${formData.enOferta ? 'bg-emerald-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.enOferta ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>

              {formData.enOferta && (
                <div className="pl-3 pr-3 py-2">
                  <label className="block text-xs font-bold text-gray-700 mb-2">Porcentaje de Descuento (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full text-sm border border-emerald-300 rounded px-3 py-2"
                    value={formData.porcentajeDescuento}
                    onChange={(e) => setFormData({ ...formData, porcentajeDescuento: Math.min(100, Math.max(0, Number(e.target.value))) })}
                  />
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg border bg-white border-gray-200">
                <label className="text-xs font-bold text-gray-700">Mostrar en Recomendados</label>
                <button
                  onClick={() => setFormData((f) => ({ ...f, esRecomendado: !f.esRecomendado }))}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${formData.esRecomendado ? 'bg-emerald-600' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.esRecomendado ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">Los ajustes de visibilidad controlan cómo aparece el producto en el catálogo público.</div>
          </div>
        </div>

        {/* Footer fijo dentro de la página */}
        <div className="mt-6 bg-white border-t border-gray-100 p-4 sticky bottom-0 z-20">
          <div className="max-w-6xl mx-auto flex items-center justify-end">
            <button
              onClick={() => navigate(-1)}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded mr-3"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded flex items-center gap-2"
            >
              <Save size={14} /> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProductPage;
