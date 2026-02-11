import React, { useState, useEffect } from "react";
import { X, Save, ShoppingCart, Plus, Trash2 } from "lucide-react";
import { productService } from "../../products/services/productService";

const PurchaseModal = ({ isOpen, onClose, initialData = null, mode = 'create', onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    proveedor: "",
    fecha: new Date().toISOString().slice(0,10),
    factura: "",
    total: 25000,
    items: 1,
    estado: "Pendiente",
  });
  
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productCost, setProductCost] = useState("");
  const [productQuantity, setProductQuantity] = useState("");
  const [purchaseItems, setPurchaseItems] = useState([]);

  // Cargar productos
  useEffect(() => {
    const loadProducts = () => {
      const data = productService.getAll();
      setProducts(data);
    };

    loadProducts();

    // Escuchar cambios en productos
    const handleProductChange = () => {
      loadProducts();
    };
    window.addEventListener("products:changed", handleProductChange);

    return () => {
      window.removeEventListener("products:changed", handleProductChange);
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
    } else {
      setFormData({
        proveedor: "",
        fecha: new Date().toISOString().slice(0,10),
        factura: "",
        total: 0,
        items: 0,
        estado: "Pendiente",
      });
    }
    setPurchaseItems([]);
    setSelectedProduct("");
    setProductCost("");
    setProductQuantity("");
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

  const handleSubmit = () => {
    const payload = {
      id: formData.id,
      proveedor: formData.proveedor,
      fecha: formData.fecha,
      total: Number(formData.total) || 0,
      items: Number(formData.items) || 0,
      estado: formData.estado || 'Pendiente',
      factura: formData.factura || ''
    };
    if (onSave) onSave(payload);
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

    const product = products.find(p => p.id === Number(selectedProduct));
    if (!product) {
      alert('Producto no encontrado');
      return;
    }

    const subtotal = Number(productCost) * Number(productQuantity);
    const newItem = {
      id: Date.now(), // ID único temporal
      productId: product.id,
      nombre: product.nombre,
      quantity: Number(productQuantity),
      cost: Number(productCost),
      subtotal: subtotal
    };

    setPurchaseItems([...purchaseItems, newItem]);
    setSelectedProduct("");
    setProductCost("");
    setProductQuantity("");
  };

  // Función para eliminar producto de la compra
  const handleRemoveItem = (itemId) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== itemId));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* max-h-[90vh] permite que el modal tenga su propio scroll si es necesario, sin afectar la página de atrás */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center flex-shrink-0">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
            <ShoppingCart size={16} className="text-primary-500"/> {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body (Scrollable internamente) */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* 1. Datos Generales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Proveedor</label>
              <select 
                disabled={isView}
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500 bg-white"
                value={formData.proveedor}
                onChange={(e) => setFormData({...formData, proveedor: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                <option>Farmacéutica Global</option>
                <option>Laboratorios Pfizer</option>
                <option>Droguería Central</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Fecha de Compra</label>
              <input 
                disabled={isView}
                type="date" 
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500"
                value={formData.fecha}
                onChange={(e) => setFormData({...formData, fecha: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">N° Factura</label>
              <input 
                disabled={isView}
                type="text" 
                className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-emerald-500" 
                placeholder="FAC-0000"
                value={formData.factura}
                onChange={(e) => setFormData({...formData, factura: e.target.value})}
              />
            </div>
          </div>

          {/* 2. Barra para Agregar Productos */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
             <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 border-b border-gray-200 pb-1">Agregar Items</h4>
             <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                   <label className="block text-[10px] font-bold text-gray-600 mb-1">Producto</label>
                   <select 
                     disabled={isView}
                     className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:border-emerald-500 bg-white"
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
                </div>
                <div className="w-full md:w-32">
                   <label className="block text-[10px] font-bold text-gray-600 mb-1">Costo Unit.</label>
                   <input 
                     disabled={isView}
                     type="number" 
                     className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:border-emerald-500" 
                     placeholder="0.00"
                     value={productCost}
                     onChange={(e) => setProductCost(e.target.value)}
                   />
                </div>
                <div className="w-full md:w-24">
                   <label className="block text-[10px] font-bold text-gray-600 mb-1">Cantidad</label>
                   <input 
                     disabled={isView}
                     type="number" 
                     className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:border-emerald-500" 
                     placeholder="1"
                     value={productQuantity}
                     onChange={(e) => setProductQuantity(e.target.value)}
                   />
                </div>
                 <button 
                   onClick={handleAddProduct}
                   disabled={isView || !selectedProduct}
                   className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white px-4 py-1.5 rounded-md text-sm font-medium h-[34px] flex items-center justify-center gap-1 shadow-sm transition-colors w-full md:w-auto"
                 >
                   <Plus size={14}/> Agregar
                 </button>
             </div>
          </div>

          {/* 3. Tabla de Productos Agregados */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-bold">
                  <tr>
                     <th className="px-4 py-2">Producto</th>
                     <th className="px-4 py-2 text-center">Cant</th>
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
                        <td className="px-4 py-2 text-right text-xs text-gray-600">$ {item.cost.toLocaleString()}</td>
                        <td className="px-4 py-2 text-right text-xs font-bold text-gray-800">$ {item.subtotal.toLocaleString()}</td>
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
                      <td colSpan={5} className="px-4 py-6 text-center text-xs text-gray-400 italic bg-gray-50/30">
                        No hay productos agregados
                      </td>
                    </tr>
                  )}
               </tbody>
               <tfoot className="bg-gray-50 border-t border-gray-200">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total a Pagar:</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-primary-500">$ { (formData.total || 0).toLocaleString() }</td>
                    <td></td>
                  </tr>
               </tfoot>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex justify-end gap-2 flex-shrink-0">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancelar
          </button>
           {!isView && (
            <button onClick={handleSubmit} className="px-4 py-2 text-xs font-bold text-white bg-primary-500 hover:bg-primary-600 rounded-md flex items-center gap-1 shadow-sm transition-colors">
              <Save size={16} /> {mode === 'edit' ? 'Guardar' : 'Finalizar Compra'}
            </button>
           )}
        </div>

      </div>
    </div>
  );
};

export default PurchaseModal;