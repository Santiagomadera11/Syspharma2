import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Save, X } from "lucide-react";
import { ConfirmDialog } from "../../../shared/ui/ConfirmDialog.jsx";
import {
  getServiceCategories,
  getPaymentMethods,
  getDocumentTypes,
  addParameter,
  updateParameter,
  deleteParameter,
} from "../services/parameterService";

const ParameterManagement = ({ user }) => {
  // Solo administradores pueden ver y gestionar parámetros
  if (user?.rol !== "Administrador") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          ⚠️ Acceso restringido: Solo administradores pueden gestionar
          parámetros
        </p>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState("categories");
  const [categories, setCategories] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' o 'edit'
  const [currentType, setCurrentType] = useState("serviceCategories");
  const [editingId, setEditingId] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");

  // Carga los parámetros al montar el componente
  useEffect(() => {
    loadParameters();

    // Escucha los cambios de parámetros desde otras pestañas/usuarios
    const handleParameterUpdate = () => {
      loadParameters();
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
  }, []);

  const loadParameters = () => {
    setCategories(getServiceCategories());
    setPaymentMethods(getPaymentMethods());
    setDocumentTypes(getDocumentTypes());
  };

  const getCurrentData = () => {
    switch (currentType) {
      case "serviceCategories":
        return categories;
      case "paymentMethods":
        return paymentMethods;
      case "documentTypes":
        return documentTypes;
      default:
        return [];
    }
  };

  const openAddModal = (type) => {
    setCurrentType(type);
    setModalMode("add");
    setInputValue("");
    setEditingId(null);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (type, id, value) => {
    setCurrentType(type);
    setModalMode("edit");
    setEditingId(id);
    setInputValue(value);
    setError("");
    setShowModal(true);
  };

  const handleSave = () => {
    if (!inputValue.trim()) {
      setError("El valor no puede estar vacío");
      return;
    }

    const currentData = getCurrentData();
    const isDuplicate =
      currentData?.some(
        (item) =>
          item.value.toLowerCase() === inputValue.toLowerCase() &&
          item.id !== editingId,
      ) || false;

    if (isDuplicate) {
      setError("Este valor ya existe");
      return;
    }

    if (modalMode === "add") {
      addParameter(currentType, inputValue.trim());
    } else {
      updateParameter(currentType, editingId, inputValue.trim());
    }

    loadParameters();
    setShowModal(false);
    setInputValue("");
    setError("");
  };

  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "Confirmar eliminación",
    message: "¿Estás seguro de que deseas eliminar este parámetro?",
    onConfirm: null,
  });

  const handleDelete = (type, id) => {
    setConfirmConfig({
      open: true,
      title: "Confirmar eliminación",
      message: "¿Estás seguro de que deseas eliminar este parámetro?",
      onConfirm: () => {
        deleteParameter(type, id);
        loadParameters();
      },
    });
  };

  const ParameterTable = ({ data, type, label }) => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-emerald-900">{label}</h3>
        <button
          onClick={() => openAddModal(type)}
          className="flex items-center gap-2 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      {data && data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  #
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Valor
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {item.value}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(type, item.id, item.value)}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(type, item.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500">
          <p className="text-sm">No hay parámetros configurados</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tabs de navegación */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "categories"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Categorías de Servicio
        </button>
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "payments"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Métodos de Pago
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "documents"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Tipos de Documento
        </button>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === "categories" && (
        <ParameterTable
          data={categories}
          type="serviceCategories"
          label="Categorías de Servicio"
        />
      )}
      {activeTab === "payments" && (
        <ParameterTable
          data={paymentMethods}
          type="paymentMethods"
          label="Métodos de Pago"
        />
      )}
      {activeTab === "documents" && (
        <ParameterTable
          data={documentTypes}
          type="documentTypes"
          label="Tipos de Documento"
        />
      )}

      {/* Modal para agregar/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                {modalMode === "add" ? "Agregar nuevo" : "Editar"} parámetro
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:bg-white/20 p-1 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor *
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    setError("");
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    error ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ingresa el valor"
                  autoFocus
                />
                {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  <Save size={18} />
                  Guardar
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  <X size={18} />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nota informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          ℹ️ Los cambios realizados aquí se aplicarán inmediatamente en todos
          los formularios y vistas de la aplicación. Todos los usuarios verán
          los cambios en tiempo real.
        </p>
      </div>

      {/* confirm dialog */}
      <ConfirmDialog
        open={confirmConfig.open}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onCancel={() => setConfirmConfig((c) => ({ ...c, open: false }))}
        onConfirm={() => {
          confirmConfig.onConfirm && confirmConfig.onConfirm();
          setConfirmConfig((c) => ({ ...c, open: false }));
        }}
      />
    </div>
  );
};

export default ParameterManagement;
