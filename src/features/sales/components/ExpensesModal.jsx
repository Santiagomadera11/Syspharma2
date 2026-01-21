import React, { useEffect, useState } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { expensesService } from "../services/expensesService";
import { ToastNotification } from "../../../shared/ui/ToastNotification";

export const ExpensesModal = ({ isOpen, onClose }) => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    descripcion: "",
    monto: "",
    categoria: "Otro",
  });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadExpenses();
    }
  }, [isOpen]);

  const loadExpenses = () => {
    setExpenses(expensesService.getTodayExpenses());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleAddExpense = () => {
    if (!formData.descripcion || !formData.monto) {
      setToast({
        message: "Completa descripción y monto",
        type: "error",
        zIndex: 70,
      });
      return;
    }
    expensesService.create({
      descripcion: formData.descripcion,
      monto: parseFloat(formData.monto),
      categoria: formData.categoria,
    });
    setFormData({ descripcion: "", monto: "", categoria: "Otro" });
    setShowForm(false);
    loadExpenses();
    setToast({ message: "Gasto registrado", type: "success", zIndex: 70 });
  };

  const handleDeleteExpense = (id) => {
    if (window.confirm("¿Eliminar gasto?")) {
      expensesService.delete(id);
      loadExpenses();
      setToast({ message: "Gasto eliminado", type: "success", zIndex: 70 });
    }
  };

  const total = expenses.reduce((sum, e) => sum + (e.monto || 0), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-orange-50 to-red-50">
          <h2 className="text-lg font-bold text-gray-800">Gastos del día</h2>
          <button onClick={onClose} className="text-gray-500 p-1">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-auto">
          {expenses.length === 0 && !showForm ? (
            <div className="text-center py-6 text-gray-400">
              No hay gastos registrados
            </div>
          ) : (
            <div className="space-y-2">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-800">
                      {exp.descripcion}
                    </div>
                    <div className="text-xs text-gray-500">
                      {exp.hora} • {exp.categoria}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-orange-600">
                      ${exp.monto.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded border border-red-200"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showForm && (
            <div className="mt-4 p-3 border rounded-lg bg-orange-50">
              <input
                type="text"
                name="descripcion"
                placeholder="Descripción del gasto"
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded mb-2 text-sm"
              />
              <input
                type="number"
                name="monto"
                placeholder="Monto"
                value={formData.monto}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded mb-2 text-sm"
              />
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded mb-2 text-sm"
              >
                <option value="Otro">Otro</option>
                <option value="Transporte">Transporte</option>
                <option value="Comida">Comida</option>
                <option value="Mantenimiento">Mantenimiento</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleAddExpense}
                  className="flex-1 bg-orange-600 text-white py-1.5 rounded text-sm font-semibold hover:bg-orange-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 border py-1.5 rounded text-sm hover:bg-gray-100"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-4 bg-gray-50 flex items-center justify-between">
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
            >
              <Plus size={16} /> Agregar gasto
            </button>
          )}
          <div className="text-right">
            <div className="text-xs text-gray-500">Total gastos:</div>
            <div className="text-2xl font-bold text-orange-600">
              ${total.toLocaleString()}
            </div>
          </div>
        </div>

        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            zIndex={70}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default ExpensesModal;
