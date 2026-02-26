import React, { useEffect, useState } from "react";
import { X, Save, Phone } from "lucide-react";
import { ToastNotification } from "../../../shared/ui/ToastNotification";
import { rolesService } from "../../settings/rolesService";

export const UserDetailModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [local, setLocal] = useState(null);
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    setRoles(rolesService.getAll());
  }, [isOpen]);

  useEffect(() => {
    setLocal(user ? { ...user } : null);
    setEditing(false);
  }, [user]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLocal((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSave = () => {
    // minimal validation: nombre and email required
    if (!local.nombre || !local.email) {
      setToast({
        message: "Nombre y correo son obligatorios",
        type: "error",
        zIndex: 70,
      });
      return;
    }
    onUpdate(local);
    setToast({ message: "Usuario actualizado", type: "success", zIndex: 70 });
    setEditing(false);
    setTimeout(() => onClose(), 700);
  };

  const display = local || user || {};
  const avatar =
    display.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
      display.nombre || display.email || Date.now(),
    )}`;

  const isActivo = display.estado;
  const getRolBadgeColor = (rol) => {
    switch (rol?.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-700";
      case "empleado":
        return "bg-blue-100 text-blue-700";
      case "cliente":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-full sm:max-w-md md:max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Hero Section - Cabecera de Perfil */}
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 pb-8 pt-4 px-6 text-center">
          {/* Badge de Estado en la esquina superior izquierda */}
          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                isActivo
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {isActivo ? "Activo" : "Inactivo"}
            </span>
          </div>

          {/* Botón X en la esquina superior derecha */}
          <div className="absolute top-4 right-4">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 p-1 rounded-full hover:bg-white/50 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Foto de Perfil centrada */}
          <div className="w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg">
            <img
              src={avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Nombre y Email */}
          <div className="mt-2">
            <h2 className="text-xl font-bold text-gray-900">{display.nombre}</h2>
            <p className="text-xs text-gray-600 mt-1">{display.email}</p>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="px-6 py-4 space-y-4">
          
          {/* Sección: Identificación */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Identificación
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              {editing ? (
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <select
                      name="tipoDocumento"
                      value={display.tipoDocumento || ""}
                      onChange={handleChange}
                      className="w-full px-2 py-2 border rounded text-sm font-medium"
                    >
                      <option value="">--</option>
                      <option value="CC">CC</option>
                      <option value="TI">TI</option>
                      <option value="CE">CE</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      name="documento"
                      value={display.documento || ""}
                      onChange={handleChange}
                      placeholder="Número"
                      className="w-full px-2 py-2 border rounded text-sm font-medium"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-900 font-semibold text-base">
                  {display.tipoDocumento || "--"} - {display.documento || "No registrado"}
                </p>
              )}
            </div>
          </div>

          {/* Sección: Contacto */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Contacto
            </p>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
              <Phone size={18} className="text-gray-600 flex-shrink-0" />
              {editing ? (
                <input
                  name="telefono"
                  value={display.telefono || ""}
                  onChange={handleChange}
                  placeholder="Número de celular"
                  className="flex-1 px-2 py-2 border rounded text-sm font-medium"
                />
              ) : (
                <p className="text-gray-900 font-semibold">
                  {display.telefono || "No registrado"}
                </p>
              )}
            </div>
          </div>

          {/* Sección: Rol del Sistema */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Rol del Sistema
            </p>
            {editing ? (
              <select
                name="rol"
                value={display.rol || ""}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg text-sm font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="">Seleccionar</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            ) : (
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getRolBadgeColor(
                  display.rol
                )}`}
              >
                {display.rol || "No asignado"}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-2 p-4 border-t ${editing ? "bg-gray-50" : ""}`}>
          {editing && (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setLocal({ ...user });
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 font-medium transition-all"
              >
                <Save size={16} /> Guardar
              </button>
            </>
          )}
        </div>

        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            zIndex={toast.zIndex}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};

export default UserDetailModal;
