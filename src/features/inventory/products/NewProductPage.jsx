import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, DollarSign, Package, X, CheckCircle, AlertCircle } from "lucide-react";
import { productService } from "./services/productService";
import { categoryService } from "../categories/services/categoryService";
import { providerService } from "../providers/services/providerService";

const NewProductPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    tipoProducto: "Producto General",
    categoriaId: "",
    proveedorId: "",
    precio: "",
    stock: "",
    estado: true,
    esDestacado: false,
    enOferta: false,
    porcentajeDescuento: 0,
    esRecomendado: false,
    composicion: "",
    concentracion: "",
    presentacion: "",
    viaAdministracion: "",
    registroSanitario: "",
    requiereFormula: false,
    imagen: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmData, setConfirmData] = useState({
    type: "success",
    title: "",
    message: "",
    onConfirm: null,
  });
  const fileRef = React.createRef();

  useEffect(() => {
    const loadData = async () => {
      const cats = await categoryService.getAll();
      const provs = await providerService.getAll();
      setCategories(cats);
      setProviders(provs);
    };
    loadData();

    const editingProduct = localStorage.getItem("syspharma_editing_product");
    if (editingProduct) {
      try {
        const product = JSON.parse(editingProduct);
        setIsEditing(true);
        setEditingProductId(product.id);
        setFormData({
          nombre: product.nombre || "",
          tipoProducto: product.tipoProducto || "Producto General",
          categoriaId: product.categoriaId || "",
          proveedorId: product.proveedorId || "",
          precio: product.precio || "",
          stock: product.stock || "",
          estado: product.estado !== undefined ? product.estado : true,
          esDestacado: product.esDestacado || false,
          enOferta: product.enOferta || false,
          porcentajeDescuento: product.porcentajeDescuento || 0,
          esRecomendado: product.esRecomendado || false,
          composicion: product.composicion || "",
          concentracion: product.concentracion || "",
          presentacion: product.presentacion || "",
          viaAdministracion: product.viaAdministracion || "",
          registroSanitario: product.registroSanitario || "",
          requiereFormula: product.requiereFormula || false,
          imagen: product.imagen || null,
        });
        if (product.imagen) setImagePreview(product.imagen);
        localStorage.removeItem("syspharma_editing_product");
      } catch (error) {
        console.error("Error reading editing product:", error);
      }
    }

    const onChange = async () => {
      const cats = await categoryService.getAll();
      const provs = await providerService.getAll();
      setCategories(cats);
      setProviders(provs);
    };

    window.addEventListener("categories:changed", onChange);
    window.addEventListener("providers:changed", onChange);
    return () => {
      window.removeEventListener("categories:changed", onChange);
      window.removeEventListener("providers:changed", onChange);
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setFormData((f) => ({ ...f, imagen: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const showError = (title, message) => {
    setConfirmData({ type: "error", title, message, onConfirm: () => setShowConfirmModal(false) });
    setShowConfirmModal(true);
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) return showError("Campo Requerido", "Por favor ingresa el nombre del producto");
    if (!formData.categoriaId) return showError("Campo Requerido", "Por favor selecciona una categoría");
    if (!formData.precio || Number(formData.precio) <= 0) return showError("Precio Inválido", "Por favor ingresa un precio válido mayor a 0");

    const payload = {
      nombre: formData.nombre.trim(),
      categoriaId: Number(formData.categoriaId),
      proveedorId: formData.proveedorId ? Number(formData.proveedorId) : null,
      precio: Number(formData.precio),
      precioCompra: null,
      stock: Number(formData.stock) || 0,
      imagen: formData.imagen || null,
      descripcion: null,
      sku: null,
      codigoBarras: null,
    };

    try {
      if (isEditing) {
        await productService.update({ id: editingProductId, ...payload });
        window.dispatchEvent(new CustomEvent("products:changed"));
        setConfirmData({
          type: "success",
          title: "Producto Actualizado",
          message: `${formData.nombre} se ha actualizado correctamente`,
          onConfirm: () => { setShowConfirmModal(false); navigate("/admin/productos"); },
        });
      } else {
        const created = await productService.create(payload);

        // Sincronizar a localStorage para landing pública
        const stored = JSON.parse(localStorage.getItem("syspharma_products") || "[]");
        const newProduct = {
          id: created.id,
          nombre: created.nombre,
          precio: created.precio,
          stock: created.stock,
          imagen: created.imagen,
          categoria: categories.find(c => c.id === Number(formData.categoriaId))?.nombre || "Sin categoría",
          estado: true,
        };
        localStorage.setItem("syspharma_products", JSON.stringify([...stored, newProduct]));
        console.log("✅ Producto guardado en localStorage:", newProduct);

        window.dispatchEvent(new CustomEvent("products:changed"));
        window.dispatchEvent(new Event("syspharma_products_updated"));

        setConfirmData({
          type: "success",
          title: "Producto Registrado",
          message: `${formData.nombre} creado exitosamente`,
          onConfirm: () => {
            setShowConfirmModal(false);
            setFormData({
              nombre: "", tipoProducto: "Producto General", categoriaId: "", proveedorId: "",
              precio: "", stock: "", estado: true, esDestacado: false, enOferta: false,
              porcentajeDescuento: 0, esRecomendado: false, composicion: "", concentracion: "",
              presentacion: "", viaAdministracion: "", registroSanitario: "", requiereFormula: false, imagen: null,
            });
            setImagePreview(null);
            navigate("/admin/productos");
          },
        });
      }
      setShowConfirmModal(true);
    } catch (error) {
      const msg = error?.response?.data?.message || "Error al guardar el producto. Intenta nuevamente.";
      showError("Error", msg);
      console.error("Error:", error);
    }
  };

  return (
    <div className="h-full p-6 font-sans text-gray-800 bg-white md:bg-transparent">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-md hover:bg-gray-100 border border-gray-100">
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-lg font-bold">{isEditing ? "Editar Producto" : "Agregar Producto"}</h1>
              <p className="text-xs text-gray-500">{isEditing ? `Editando: ${formData.nombre}` : "Crear un nuevo producto en el inventario"}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={handleSave} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-md text-sm font-medium shadow-sm">
              <Save size={14} /> Guardar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-gray-100 rounded-lg p-6 shadow-sm">
            <div className="space-y-4">

              {/* Imagen */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Imagen del Producto</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500 transition bg-gray-50">
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()} className="w-full flex flex-col items-center">
                    {imagePreview ? (
                      <div className="flex flex-col items-center">
                        <img src={imagePreview} alt="Preview" className="max-h-36 max-w-full object-contain mb-2 rounded" />
                        <p className="text-xs text-gray-500">Haz clic para cambiar imagen</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Package size={28} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-gray-600">Sube una imagen</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 5MB</p>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre</label>
                <input type="text" className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                  value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Producto</label>
                <select className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                  value={formData.tipoProducto} onChange={(e) => setFormData({ ...formData, tipoProducto: e.target.value })}>
                  <option value="Producto General">Producto General</option>
                  <option value="Medicamento">Medicamento</option>
                </select>
              </div>

              {/* Categoría - usa id */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Categoría</label>
                <select className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                  value={formData.categoriaId}
                  onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Proveedor - usa id */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Proveedor</label>
                <select className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                  value={formData.proveedorId}
                  onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Precio ($)</label>
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input type="number" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded"
                    value={formData.precio} onChange={(e) => setFormData({ ...formData, precio: e.target.value })} />
                </div>
                <div className="relative">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Stock</label>
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input type="number" className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded"
                    value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} />
                </div>
              </div>

              {/* Medicamento */}
              {formData.tipoProducto === "Medicamento" && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-bold text-gray-800 text-sm mb-3">Información Técnica</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Composición</label>
                      <textarea className="w-full text-sm border border-gray-300 rounded px-3 py-2" rows={2}
                        value={formData.composicion} onChange={(e) => setFormData({ ...formData, composicion: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Concentración</label>
                        <input type="text" className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                          value={formData.concentracion} onChange={(e) => setFormData({ ...formData, concentracion: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Presentación</label>
                        <input type="text" className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                          value={formData.presentacion} onChange={(e) => setFormData({ ...formData, presentacion: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Vía de Administración</label>
                      <select className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                        value={formData.viaAdministracion} onChange={(e) => setFormData({ ...formData, viaAdministracion: e.target.value })}>
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
                      <input type="text" className="w-full text-sm border border-gray-300 rounded px-3 py-2"
                        value={formData.registroSanitario} onChange={(e) => setFormData({ ...formData, registroSanitario: e.target.value })} />
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-lg border transition-all ${formData.requiereFormula ? "bg-blue-100 border-blue-400" : "bg-gray-50 border-gray-200"}`}>
                      <label className="text-xs font-bold text-gray-700">Requiere Fórmula Médica</label>
                      <button onClick={() => setFormData({ ...formData, requiereFormula: !formData.requiereFormula })}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${formData.requiereFormula ? "bg-blue-600" : "bg-gray-300"}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.requiereFormula ? "translate-x-5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visibilidad */}
          <div className="md:col-span-1">
            <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm space-y-3">
              <h4 className="text-sm font-bold text-gray-800">Configuración de Visibilidad</h4>
              {[
                { label: "Mostrar en Destacados", key: "esDestacado" },
                { label: "Mostrar en Recomendados", key: "esRecomendado" },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border bg-white border-gray-200">
                  <label className="text-xs font-bold text-gray-700">{label}</label>
                  <button onClick={() => setFormData((f) => ({ ...f, [key]: !f[key] }))}
                    className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${formData[key] ? "bg-emerald-600" : "bg-gray-300"}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData[key] ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-white border-gray-200">
                <label className="text-xs font-bold text-gray-700">Mostrar en Ofertas</label>
                <button onClick={() => setFormData((f) => ({ ...f, enOferta: !f.enOferta }))}
                  className={`relative inline-flex h-5 w-10 items-center rounded-full transition-all ${formData.enOferta ? "bg-emerald-600" : "bg-gray-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.enOferta ? "translate-x-5" : "translate-x-0.5"}`} />
                </button>
              </div>
              {formData.enOferta && (
                <div className="pl-3 pr-3 py-2">
                  <label className="block text-xs font-bold text-gray-700 mb-2">Porcentaje de Descuento (%)</label>
                  <input type="number" min="0" max="100" className="w-full text-sm border border-emerald-300 rounded px-3 py-2"
                    value={formData.porcentajeDescuento}
                    onChange={(e) => setFormData({ ...formData, porcentajeDescuento: Math.min(100, Math.max(0, Number(e.target.value))) })} />
                </div>
              )}
            </div>
            <div className="mt-4 text-xs text-gray-500">Los ajustes de visibilidad controlan cómo aparece el producto en el catálogo público.</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 bg-white border-t border-gray-100 p-4 sticky bottom-0 z-20">
          <div className="max-w-6xl mx-auto flex items-center justify-end">
            <button onClick={() => navigate(-1)} className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded mr-3">Cancelar</button>
            <button onClick={handleSave} className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded flex items-center gap-2">
              <Save size={14} /> Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden flex flex-col">
            <div className={`px-6 py-4 border-b flex justify-between items-center ${confirmData.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <div className="flex items-center gap-3">
                {confirmData.type === "success" ? <CheckCircle size={24} className="text-green-600" /> : <AlertCircle size={24} className="text-red-600" />}
                <h3 className="font-bold text-gray-900 text-lg">{confirmData.title}</h3>
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 text-sm leading-relaxed">{confirmData.message}</p>
            </div>
            <div className={`px-6 py-4 border-t ${confirmData.type === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <button onClick={() => confirmData.onConfirm && confirmData.onConfirm()}
                className={`w-full px-4 py-2 rounded font-semibold text-white text-sm ${confirmData.type === "success" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}`}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewProductPage;