import React, { useEffect, useState } from "react";
import { X, Save } from "lucide-react";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border">
              <img
                src={avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="font-bold">{display.nombre}</div>
              <div className="text-xs text-gray-500">{display.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-gray-500 p-1 rounded-full"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 border rounded-md">
            <div className="text-[11px] text-gray-500 mb-1">Tipo Documento</div>
            {editing ? (
              <select
                name="tipoDocumento"
                value={display.tipoDocumento || ""}
                onChange={handleChange}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="">--</option>
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
              </select>
            ) : (
              <div className="font-medium">
                {display.tipoDocumento || "No registrado"}
              </div>
            )}
          </div>

          <div className="p-3 border rounded-md">
            <div className="text-[11px] text-gray-500 mb-1">
              Número Documento
            </div>
            {editing ? (
              <input
                name="documento"
                value={display.documento || ""}
                onChange={handleChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            ) : (
              <div className="font-medium">
                {display.documento || "No registrado"}
              </div>
            )}
          </div>

          <div className="p-3 border rounded-md">
            <div className="text-[11px] text-gray-500 mb-1">Celular</div>
            {editing ? (
              <input
                name="telefono"
                value={display.telefono || ""}
                onChange={handleChange}
                className="w-full px-2 py-1 border rounded text-sm"
              />
            ) : (
              <div className="font-medium">
                {display.telefono || "Número no registrado"}
              </div>
            )}
          </div>

          <div className="p-3 border rounded-md">
            <div className="text-[11px] text-gray-500 mb-1">Rol</div>
            {editing ? (
              <select
                name="rol"
                value={display.rol || ""}
                onChange={handleChange}
                className="w-full px-2 py-1 border rounded text-sm"
              >
                <option value="">Seleccionar</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="font-medium">{display.rol}</div>
            )}
          </div>

          <div className="p-3 border rounded-md">
            <div className="text-[11px] text-gray-500 mb-1">Estado</div>
            {editing ? (
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  name="estado"
                  checked={!!display.estado}
                  onChange={handleChange}
                />
                <span className="text-sm">
                  {display.estado ? "Activo" : "Inactivo"}
                </span>
              </label>
            ) : (
              <div className="font-medium">
                {display.estado ? "Activo" : "Inactivo"}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 p-3 border-t bg-gray-50">
          {editing && (
            <>
              <button
                onClick={() => {
                  setEditing(false);
                  setLocal({ ...user });
                }}
                className="px-3 py-1 border rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-primary-600 text-white rounded flex items-center gap-2"
              >
                <Save size={14} /> Guardar
              </button>
            </>
          )}
          {!editing && (
            <button onClick={onClose} className="px-3 py-1 border rounded">
              Cerrar
            </button>
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
