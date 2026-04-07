import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog.jsx";
import {
  fetchDocumentTypes, createTipoDocumento, updateTipoDocumento, deleteTipoDocumento,
  fetchPaymentMethods, createMetodoPago, updateMetodoPago, deleteMetodoPago,
  fetchServiceCategories, createCategoriaServicio, updateCategoriaServicio, deleteCategoriaServicio,
} from "../services/parameterService";

const TABS = [
  { id: "categories", label: "Categorías de Servicio", type: "serviceCategories" },
  { id: "payments", label: "Métodos de Pago", type: "paymentMethods" },
  { id: "documents", label: "Tipos de Documento", type: "documentTypes" },
];

const ParameterManagement = ({ user }) => {
  if (user?.rol !== "Administrador") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">⚠️ Solo administradores pueden gestionar parámetros.</p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("categories");
  const [data, setData] = useState({ serviceCategories: [], paymentMethods: [], documentTypes: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentType, setCurrentType] = useState("serviceCategories");
  const [editingItem, setEditingItem] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const [confirmConfig, setConfirmConfig] = useState({
    open: false, title: "", message: "", onConfirm: null,
  });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, payments, docs] = await Promise.all([
        fetchServiceCategories(),
        fetchPaymentMethods(),
        fetchDocumentTypes(),
      ]);
      setData({ serviceCategories: cats, paymentMethods: payments, documentTypes: docs });
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    loadAll();
    window.addEventListener("syspharma_parameters_updated", loadAll);
    return () => window.removeEventListener("syspharma_parameters_updated", loadAll);
  }, [loadAll]);

  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const openAddModal = (type) => {
    setCurrentType(type);
    setModalMode("add");
    setInputValue("");
    setEditingItem(null);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (type, item) => {
    setCurrentType(type);
    setModalMode("edit");
    setEditingItem(item);
    setInputValue(item.value);
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!inputValue.trim()) { setError("El valor no puede estar vacío"); return; }
    const current = data[currentType] || [];
    const isDuplicate = current.some(i => i.value.toLowerCase() === inputValue.toLowerCase() && i.id !== editingItem?.id);
    if (isDuplicate) { setError("Este valor ya existe"); return; }

    setSaving(true);
    try {
      if (modalMode === "add") {
        if (currentType === "serviceCategories") await createCategoriaServicio(inputValue.trim());
        else if (currentType === "paymentMethods") await createMetodoPago(inputValue.trim());
        else await createTipoDocumento(inputValue.trim());
        setNotification({ message: "Parámetro creado correctamente", type: "success" });
      } else {
        if (currentType === "serviceCategories") await updateCategoriaServicio(editingItem.id, inputValue.trim());
        else if (currentType === "paymentMethods") await updateMetodoPago(editingItem.id, inputValue.trim());
        else await updateTipoDocumento(editingItem.id, inputValue.trim());
        setNotification({ message: "Parámetro actualizado correctamente", type: "success" });
      }
      await loadAll();
      setShowModal(false);
      setInputValue("");
      setError("");
    } catch (err) {
      setError(err?.response?.data?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (type, item) => {
    setConfirmConfig({
      open: true,
      title: "Eliminar parámetro",
      message: `¿Eliminar "${item.value}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        try {
          if (type === "serviceCategories") await deleteCategoriaServicio(item.id);
          else if (type === "paymentMethods") await deleteMetodoPago(item.id);
          else await deleteTipoDocumento(item.id);
          setNotification({ message: "Parámetro eliminado correctamente", type: "success" });
          await loadAll();
        } catch (err) {
          setNotification({ message: err?.response?.data?.message || "Error al eliminar", type: "error" });
        }
      },
    });
  };

  const ParameterTable = ({ type, label }) => {
    const items = data[type] || [];
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-emerald-900">{label}</h3>
          <button onClick={() => openAddModal(type)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 text-sm font-medium">
            <Plus size={16} /> Agregar
          </button>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No hay parámetros configurados</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Valor</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.value}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => openEditModal(type, item)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(type, item)}
                        className="inline-flex items-center gap-1 text-red-600 hover:bg-red-50 px-2 py-1 rounded">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const activeTabData = TABS.find(t => t.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-600 hover:text-gray-900"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTabData && <ParameterTable type={activeTabData.type} label={activeTabData.label} />}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                {modalMode === "add" ? "Agregar" : "Editar"} parámetro
              </h3>
              <button onClick={() => setShowModal(false)} className="text-white hover:bg-white/20 p-1 rounded"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Valor *</label>
                <input type="text" value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${error ? "border-red-500" : "border-gray-300"}`}
                  placeholder="Ingresa el valor" autoFocus />
                {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50">
                  <Save size={18} /> {saving ? "Guardando..." : "Guardar"}
                </button>
                <button onClick={() => setShowModal(false)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium">
                  <X size={18} /> Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">ℹ️ Los cambios se guardan en la base de datos y se aplican inmediatamente en todos los formularios.</p>
      </div>

      <ConfirmDialog open={confirmConfig.open} title={confirmConfig.title} message={confirmConfig.message}
        onCancel={() => setConfirmConfig(c => ({ ...c, open: false }))}
        onConfirm={() => { confirmConfig.onConfirm?.(); setConfirmConfig(c => ({ ...c, open: false })); }} />

      {notification && (
        <div className={`fixed bottom-4 left-4 px-4 py-3 rounded-lg shadow-lg z-50 text-sm font-medium ${
          notification.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default ParameterManagement;