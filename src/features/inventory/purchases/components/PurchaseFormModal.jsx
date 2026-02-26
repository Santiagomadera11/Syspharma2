import React, { useState, useEffect } from "react";
import { X, Save, ShoppingCart, Plus, Trash2, CheckCircle, Printer } from "lucide-react";
import { productService } from "../../products/services/productService";
import { providerService } from "../../providers/services/providerService";

const PurchaseModal = ({ isOpen, onClose, initialData = null, mode = 'create', onSave, onDelete }) => {
  // Role-based color styling
  const currentUser = JSON.parse(localStorage.getItem("syspharma_user") || "{}");
  const isEmployee = currentUser.rol === "Empleado";
  const headerBgColor = isEmployee ? "bg-blue-50" : "bg-green-50";
  const headerBorderColor = isEmployee ? "border-blue-200" : "border-green-200";
  const buttonBgColor = isEmployee ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700";
  const focusBorderColor = isEmployee ? "focus:border-blue-500" : "focus:border-emerald-500";
  const confirmIconColor = isEmployee ? "text-blue-600" : "text-green-600";

  const [formData, setFormData] = useState({
    proveedor: "",
    fecha: new Date().toISOString().slice(0,10),
    factura: "",
    total: 25000,
    items: 1,
    estado: "Pendiente",
  });
  
  const [products, setProducts] = useState([]);
  const [providers, setProviders] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productCost, setProductCost] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [productLote, setProductLote] = useState("");
  const [productVencimiento, setProductVencimiento] = useState("");
  const [productIva, setProductIva] = useState("");
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [archivoFactura, setArchivoFactura] = useState(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  // Cargar productos y proveedores
  useEffect(() => {
    const loadProducts = () => {
      const data = productService.getAll();
      setProducts(data);
    };

    const loadProviders = () => {
      const data = providerService.getAll();
      setProviders(data);
    };

    loadProducts();
    loadProviders();

    // Escuchar cambios en productos y proveedores
    const handleProductChange = () => {
      loadProducts();
    };
    const handleProviderChange = () => {
      loadProviders();
    };
    window.addEventListener("products:changed", handleProductChange);
    window.addEventListener("providers:changed", handleProviderChange);

    return () => {
      window.removeEventListener("products:changed", handleProductChange);
      window.removeEventListener("providers:changed", handleProviderChange);
    };
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        proveedor: initialData.proveedor || "",
        fecha: initialData.fecha || new Date().toISOString().slice(0,10),
        factura: initialData.factura || "",
        total: initialData.total || 0,
        items: initialData.items || 0,
        estado: initialData.estado || "Pendiente",
        id: initialData.id,
      });
      // Cargar los items de la compra si existen
      if (initialData.items && Array.isArray(initialData.items)) {
        setPurchaseItems(initialData.items);
      } else {
        setPurchaseItems([]);
      }
    } else {
      setFormData({
        proveedor: "",
        fecha: new Date().toISOString().slice(0,10),
        factura: "",
        total: 0,
        items: 0,
        estado: "Pendiente",
      });
      setPurchaseItems([]);
    }
    setSelectedProduct("");
    setProductCost("");
    setProductQuantity("");
    setProductLote("");
    setProductVencimiento("");
    setProductIva("");
    setArchivoFactura(null);
  }, [initialData, isOpen]);

  // Recalcular totales cuando cambian los items
  useEffect(() => {
    const totalCost = purchaseItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const totalItems = purchaseItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    setFormData(prev => ({
      ...prev,
      total: totalCost,
      items: totalItems
    }));
  }, [purchaseItems]);

  if (!isOpen) return null;

  const isView = mode === 'view';

  const handleFinalizePurchase = () => {
    // Validar que haya items
    if (purchaseItems.length === 0) {
      alert('Por favor agrega al menos un producto a la compra');
      return;
    }

    // Validar proveedor y factura
    if (!formData.proveedor.trim()) {
      alert('Por favor selecciona un proveedor');
      return;
    }

    if (!formData.factura.trim()) {
      alert('Por favor ingresa el número de factura');
      return;
    }

    // Procesar cada item de compra
    purchaseItems.forEach((item) => {
      const product = productService.getById(item.productId);
      
      if (!product) {
        console.warn(`Producto ${item.productId} no encontrado`);
        return;
      }

      // Actualizar stock del producto
      const currentStock = product.stock || product.existencia || 0;
      const newStock = currentStock + item.quantity;

      // Inicializar array de lotes si no existe
      const lotes = product.lotes || [];

      // Crear objeto del lote con información completa
      const nuevoLote = {
        idLote: Date.now() + Math.random(),
        numeroLote: item.lote,
        fechaVence: item.vencimiento,
        cantidad: item.quantity,
        fechaIngreso: new Date().toISOString().split('T')[0],
        costUnit: item.cost,
        iva: item.iva
      };

      // Agregar el nuevo lote
      lotes.push(nuevoLote);

      // Actualizar el producto en localStorage
      const updatedProduct = {
        ...product,
        stock: newStock,
        existencia: newStock,
        lotes: lotes
      };

      productService.update(updatedProduct);
    });

    // Guardar la compra en el historial
    const compra = {
      id: formData.id || Date.now(),
      proveedor: formData.proveedor,
      fecha: formData.fecha,
      factura: formData.factura,
      total: Number(formData.total) || 0,
      cantidadItems: purchaseItems.length,
      items: purchaseItems,
      estado: formData.estado || 'Completado',
      archivoFactura: archivoFactura ? archivoFactura.name : null
    };

    // Limpiar el formulario
    setPurchaseItems([]);
    setFormData({
      proveedor: '',
      fecha: new Date().toISOString().slice(0, 10),
      factura: '',
      total: 0,
      items: 0,
      estado: 'Pendiente'
    });
    setArchivoFactura(null);
    
    // Cerrar modal después de 1 segundo para mostrar confirmación
    setTimeout(() => {
      onClose();
    }, 1500);

    // Mostrar confirmación
    setConfirmationMessage('✅ Compra registrada con éxito y stock actualizado');
    setIsConfirmationOpen(true);

    // Notificar cambios en productos
    window.dispatchEvent(new CustomEvent('products:changed'));

    // Llamar callback si existe
    if (onSave) onSave(compra);
  };

  const handleDelete = () => {
    if (onDelete && formData.id) onDelete({ id: formData.id });
  };

  const title = isView ? 'Ver Compra' : (mode === 'edit' ? 'Editar Compra' : 'Registrar Compra');

  // Función para agregar producto a la compra
  const handleAddProduct = () => {
    if (!selectedProduct) {
      alert('Por favor selecciona un producto');
      return;
    }

    if (!productCost || Number(productCost) <= 0) {
      alert('Por favor ingresa un costo válido');
      return;
    }

    if (!productQuantity || Number(productQuantity) <= 0) {
      alert('Por favor ingresa una cantidad válida');
      return;
    }

    if (!productLote.trim()) {
      alert('Por favor ingresa el número de lote');
      return;
    }

    if (!productVencimiento) {
      alert('Por favor ingresa la fecha de vencimiento');
      return;
    }

    const product = products.find(p => p.id === Number(selectedProduct));
    if (!product) {
      alert('Producto no encontrado');
      return;
    }

    const costBase = Number(productCost) * Number(productQuantity);
    const ivaValue = productIva ? Number(productIva) : 0;
    const ivaAmount = (costBase * ivaValue) / 100;
    const subtotal = costBase + ivaAmount;

    const newItem = {
      id: Date.now(),
      productId: product.id,
      nombre: product.nombre,
      quantity: Number(productQuantity),
      cost: Number(productCost),
      lote: productLote.trim(),
      vencimiento: productVencimiento,
      iva: ivaValue,
      subtotal: subtotal,
      precioVenta: product.precio || product.price || 0
    };

    setPurchaseItems([...purchaseItems, newItem]);
    setSelectedProduct("");
    setProductCost("");
    setProductQuantity("");
    setProductLote("");
    setProductVencimiento("");
    setProductIva("");
  };

  // Función para eliminar producto de la compra
  const handleRemoveItem = (itemId) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== itemId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
      {/* max-h-[90vh] permite que el modal tenga su propio scroll si es necesario, sin afectar la página de atrás */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-[90vw] md:max-w-3xl lg:max-w-4xl flex flex-col max-h-[90vh] overflow-y-auto">
        {/* smaller padding container */}
        
        {/* Header */}
        <div className={`${headerBgColor} px-4 py-3 border-b ${headerBorderColor} flex justify-between items-center flex-shrink-0`}>
          <h3 className="font-bold text-gray-900 text-lg">
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex-1 pb-6">
          
          {isView ? (
            // ✅ VISTA DE FACTURA (READ-ONLY)
            <>
              {/* Header Info */}
              <div className="grid grid-cols-3 gap-6 mb-8 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">PROVEEDOR</p>
                  <p className="text-lg font-bold text-gray-900">{formData.proveedor}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">FECHA</p>
                  <p className="text-lg font-bold text-gray-900">{formData.fecha}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">N° FACTURA</p>
                  <p className="text-lg font-bold text-gray-900">{formData.factura}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 pb-2 border-b border-gray-200">Productos</h4>
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-300">
                    <tr>
                      <th className="text-left px-2 py-2 text-xs font-bold text-gray-700">Producto</th>
                      <th className="text-center px-2 py-2 text-xs font-bold text-gray-700">Cant</th>
                      <th className="text-center px-2 py-2 text-xs font-bold text-gray-700">Lote</th>
                      <th className="text-center px-2 py-2 text-xs font-bold text-gray-700">Vencimiento</th>
                      <th className="text-right px-2 py-2 text-xs font-bold text-gray-700">Costo Unit.</th>
                      <th className="text-right px-2 py-2 text-xs font-bold text-gray-700">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-2 py-3 text-gray-800">{item.nombre}</td>
                        <td className="px-2 py-3 text-center text-gray-700 font-medium">{item.quantity}</td>
                        <td className="px-2 py-3 text-center text-gray-700">{item.lote}</td>
                        <td className="px-2 py-3 text-center text-gray-700">{item.vencimiento}</td>
                        <td className="px-2 py-3 text-right text-gray-700 font-medium">
                          ${Number(item.cost || 0).toLocaleString()}
                        </td>
                        <td className="px-2 py-3 text-right text-gray-900 font-bold">
                          ${Number(item.subtotal || 0).toLocaleString(undefined, {maximumFractionDigits: 2})}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Total */}
              <div className="flex justify-end mb-6">
                <div className={`${headerBgColor} border-2 ${headerBorderColor} rounded-lg px-8 py-4`}>
                  <p className="text-xs text-gray-600 font-bold mb-1 uppercase">Total a Pagar</p>
                  <p className={`text-3xl font-bold ${confirmIconColor}`}>
                    ${Number(formData.total || 0).toLocaleString(undefined, {maximumFractionDigits: 2})}
                  </p>
                </div>
              </div>

              {/* Support Document Link */}
              {archivoFactura && (
                <div className="text-center">
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-2 mx-auto">
                    📄 Ver adjunto
                  </button>
                </div>
              )}
            </>
          ) : (
            // ✅ FORMULARIO DE EDICIÓN/CREACIÓN
            <>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-700 mb-1">Proveedor</label>
              <select 
                disabled={isView}
                className={`w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none ${focusBorderColor} bg-white`}
                value={formData.proveedor}
                onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {providers.length > 0 ? (
                  providers.map((prov) => (
                    <option key={prov.id} value={prov.empresa}>
                      {prov.empresa}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay proveedores disponibles</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de Compra</label>
              <input 
                disabled={isView}
                type="date" 
                className={`w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none ${focusBorderColor}`}
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">N° Factura</label>
              <input 
                disabled={isView}
                type="text" 
                className={`w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none ${focusBorderColor}`}
                placeholder="FAC-0000"
                value={formData.factura}
                onChange={(e) => setFormData({...formData, factura: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Soporte de Factura</label>
              <label className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
                <span className="text-blue-600">📎</span>
                <span className="text-gray-600">{archivoFactura ? archivoFactura.name : 'Adjuntar archivo'}</span>
                <input 
                  disabled={isView}
                  type="file" 
                  className="hidden" 
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setArchivoFactura(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          {/* 2. Barra para Agregar Productos */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
             <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 border-b border-gray-200 pb-1">Agregar Items</h4>
             <div className="space-y-3">
                <div className="flex flex-col md:flex-row gap-3 items-end">
                   <div className="flex-1 w-full">
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Producto</label>
                      <div>
                        <select 
                          disabled={isView}
                          className={`w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none ${focusBorderColor} bg-white`}
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                          <option value="">Seleccionar producto...</option>
                          {products.length > 0 ? (
                            products.map((prod) => (
                              <option key={prod.id} value={prod.id}>
                                {prod.nombre}
                              </option>
                            ))
                          ) : (
                            <option disabled>No hay productos disponibles</option>
                          )}
                        </select>
                        {selectedProduct && products.find(p => p.id === Number(selectedProduct)) && (
                          <p className="text-[10px] text-gray-500 mt-1">
                            💰 Precio Venta: ${(products.find(p => p.id === Number(selectedProduct))?.precio || 0).toLocaleString()}
                          </p>
                        )}
                      </div>
                   </div>
                   <div className="w-full md:w-28">
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Costo Unit.</label>
                      <input 
                        disabled={isView}
                        type="number" 
                        className={`w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none ${focusBorderColor}`}
                        placeholder="0.00"
                        value={productCost}
                        onChange={(e) => setProductCost(e.target.value)}
                      />
                   </div>
                   <div className="w-full md:w-20">
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Cant.</label>
                      <input 
                        disabled={isView}
                        type="number" 
                        className={`w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none ${focusBorderColor}`}
                        placeholder="1"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(e.target.value)}
                      />
                   </div>
                </div>
                <div className="flex flex-col md:flex-row gap-3 items-end">
                   <div className="w-full md:w-32">
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Lote *</label>
                      <input 
                        disabled={isView}
                        type="text" 
                        className={`w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none ${focusBorderColor}`}
                        placeholder="Lote"
                        value={productLote}
                        onChange={(e) => setProductLote(e.target.value)}
                      />
                   </div>
                   <div className="w-full md:w-40">
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">Vencimiento *</label>
                      <input 
                        disabled={isView}
                        type="date" 
                        className={`w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none ${focusBorderColor}`}
                        value={productVencimiento}
                        onChange={(e) => setProductVencimiento(e.target.value)}
                      />
                   </div>
                   <div className="w-full md:w-24">
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">IVA (%)</label>
                      <input 
                        disabled={isView}
                        type="number" 
                        className={`w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none ${focusBorderColor}`}
                        placeholder="0"
                        value={productIva}
                        onChange={(e) => setProductIva(e.target.value)}
                      />
                   </div>
                   <button 
                     onClick={handleAddProduct}
                     disabled={isView || !selectedProduct}
                     className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-1.5 rounded-md text-sm font-medium h-[34px] flex items-center justify-center gap-1 shadow-sm transition-colors w-full md:w-auto"
                   >
                     <Plus size={14}/> Agregar
                   </button>
                </div>
             </div>
          </div>

          {/* 3. Tabla de Productos Agregados */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold">
                  <tr>
                     <th className="px-4 py-2">Producto</th>
                     <th className="px-4 py-2 text-center">Cant</th>
                     <th className="px-4 py-2">Lote</th>
                     <th className="px-4 py-2">Venc.</th>
                     <th className="px-4 py-2 text-right">Costo</th>
                     <th className="px-4 py-2 text-right">Subtotal</th>
                     <th className="px-4 py-2 text-center"></th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {purchaseItems.length > 0 ? (
                    purchaseItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-xs font-medium text-gray-700">{item.nombre}</td>
                        <td className="px-4 py-2 text-center text-xs text-gray-600">{item.quantity}</td>
                        <td className="px-4 py-2 text-xs text-gray-600">{item.lote}</td>
                        <td className="px-4 py-2 text-xs text-gray-600">{new Date(item.vencimiento).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-right text-xs text-gray-600">$ {item.cost.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-xs font-bold text-gray-800">
                          $ {item.subtotal.toLocaleString(undefined, {maximumFractionDigits: 2})}
                          {item.iva > 0 && <span className="text-[10px] text-gray-500"> (+{item.iva}% IVA)</span>}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isView}
                            className="text-gray-400 hover:text-red-500 disabled:text-gray-300 transition-colors"
                          >
                            <Trash2 size={14}/>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-6 text-center text-xs text-gray-400 italic bg-gray-50/30">
                        No hay productos agregados
                      </td>
                    </tr>
                  )}
               </tbody>
               <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total a Pagar:</td>
                    <td className={`px-4 py-3 text-right text-sm font-bold ${confirmIconColor}`}>$ { (formData.total || 0).toLocaleString(undefined, {maximumFractionDigits: 2}) }</td>
                    <td></td>
                  </tr>
               </tfoot>
            </table>
          </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`${headerBgColor} border-t ${headerBorderColor} p-4 flex-shrink-0 flex gap-3`}>
          {isView ? (
            <button 
              onClick={onClose}
              className={`w-full px-4 py-2 text-sm font-bold text-white ${buttonBgColor} rounded flex items-center justify-center gap-2 transition-colors shadow-sm`}
            >
              <Printer size={16} /> Imprimir Comprobante
            </button>
          ) : (
            <button 
              onClick={handleFinalizePurchase} 
              disabled={purchaseItems.length === 0}
              className={`w-full px-4 py-2 text-sm font-bold text-white ${buttonBgColor} disabled:bg-gray-400 disabled:cursor-not-allowed rounded flex items-center justify-center gap-2 shadow-sm transition-colors`}
            >
              <Save size={16} /> {mode === 'edit' ? 'Guardar' : 'Finalizar Compra'}
            </button>
          )}
        </div>

      </div>

      {/* ✅ Modal de Confirmación */}
      {isConfirmationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            
            {/* Header Verde */}
            <div className={`${headerBgColor} px-6 py-4 border-b ${headerBorderColor} flex justify-between items-center`}>
              <h3 className="font-bold text-gray-900 text-lg">
                Compra Registrada
              </h3>
              <button 
                onClick={() => setIsConfirmationOpen(false)} 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex flex-col items-center text-center">
              <CheckCircle size={48} className={`${confirmIconColor} mb-4`} />
              <p className="text-gray-700 font-medium text-sm mb-2">
                {confirmationMessage}
              </p>
              <p className="text-gray-500 text-xs">
                El stock de los productos ha sido actualizado correctamente en el inventario.
              </p>
            </div>

            {/* Footer Verde */}
            <div className={`${headerBgColor} border-t ${headerBorderColor} p-4`}>
              <button 
                onClick={() => setIsConfirmationOpen(false)}
                className={`w-full px-4 py-2 text-sm font-bold text-white ${buttonBgColor} rounded transition-colors shadow-sm`}
              >
                Aceptar
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseModal;