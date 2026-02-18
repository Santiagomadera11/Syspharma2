import React, { useMemo, useState, useEffect } from "react";
import { Shield, Edit, Trash2, Info, Settings } from "lucide-react";
import { PERMISSIONS_CONFIG } from "./rolesConfig";
import { ToastNotification } from "../../shared/ui/ToastNotification";
import { rolesService } from "./rolesService";
import { permissionService } from "./permissionService";
import { userService } from "../users/services/userService";
import ParameterManagement from "./components/ParameterManagement";

const ROLES_KEY = "syspharma_roles";

const COLOR_OPTIONS = [
  { id: "turquoise", name: "Turquesa", hex: "#4fd1c5" },
  { id: "blue", name: "Azul", hex: "#3b82f6" },
  { id: "green", name: "Verde", hex: "#10b981" },
  { id: "yellow", name: "Amarillo", hex: "#f59e0b" },
  { id: "red", name: "Rojo", hex: "#ef4444" },
  { id: "purple", name: "Morado", hex: "#8b5cf6" },
  { id: "gray", name: "Gris", hex: "#6b7280" },
];

export const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("roles"); // 'roles' or 'parameters'
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState("form"); // 'form' | 'perms'
  const [roles, setRoles] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [editRole, setEditRole] = useState(null); // role being edited
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  const [toast, setToast] = useState(null);

  // Form state
  const [roleName, setRoleName] = useState("");
  const [roleColor, setRoleColor] = useState(COLOR_OPTIONS[0].id);
  const [roleDesc, setRoleDesc] = useState("");
  const [selectedPerms, setSelectedPerms] = useState(() => ({}));
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem("syspharma_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // load roles from rolesService and normalize
    const stored = rolesService.getAll();
    const normalized = (Array.isArray(stored) ? stored : []).map((r) => ({
      ...r,
      active: typeof r.active === "boolean" ? r.active : true,
      permissions: Array.isArray(r.permissions) ? r.permissions : [],
    }));
    setRoles(normalized);
  }, []);

  const categories = useMemo(() => {
    const map = {};
    PERMISSIONS_CONFIG.forEach((p) => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return map;
  }, []);

  const togglePerm = (id) => {
    setSelectedPerms((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalSelected = Object.values(selectedPerms).filter(Boolean).length;

  const resetForm = () => {
    setRoleName("");
    setRoleColor(COLOR_OPTIONS[0].id);
    setRoleDesc("");
    setSelectedPerms({});
    setEditRole(null);
  };

  const validateForm = (requireAtLeastOnePerm = true) => {
    const errors = [];
    const name = roleName.trim();
    const desc = roleDesc.trim();

    if (!name) errors.push("El nombre del rol es obligatorio.");
    if (!desc) errors.push("La descripción es obligatoria.");
    if (desc && desc.length < 10)
      errors.push("La descripción debe tener al menos 10 caracteres.");

    // name uniqueness (case-insensitive)
    const existsName = roles.some(
      (r) =>
        r.id !== (editRole && editRole.id) &&
        r.name.toLowerCase() === name.toLowerCase(),
    );
    if (existsName) errors.push("Ya existe un rol con ese nombre.");

    // color uniqueness
    const existsColor = roles.some(
      (r) => r.id !== (editRole && editRole.id) && r.colorId === roleColor,
    );
    if (existsColor)
      errors.push("El color seleccionado ya está en uso por otro rol.");

    if (requireAtLeastOnePerm) {
      const totalPerms = Object.keys(selectedPerms).filter(
        (k) => selectedPerms[k],
      ).length;
      if (totalPerms === 0)
        errors.push("Selecciona al menos un permiso para el rol.");
    }

    return errors;
  };

  const handleCreateRole = () => {
    const errors = validateForm(true);
    if (errors.length > 0) {
      setToast({ message: errors[0], type: "error", zIndex: 60 });
      return;
    }

    const colorObj =
      COLOR_OPTIONS.find((c) => c.id === roleColor) || COLOR_OPTIONS[0];
    const payload = {
      id: editRole ? editRole.id : Date.now(),
      name: roleName.trim(),
      color: colorObj.hex,
      colorId: colorObj.id,
      description: roleDesc.trim(),
      permissions: Object.keys(selectedPerms).filter((k) => selectedPerms[k]),
      active: editRole ? !!editRole.active : true,
    };

    // sync permission map using new role name / permissions
    permissionService.updateRole(payload.name, payload.permissions);

    if (editRole) {
      const prevName = editRole.name;
      const next = rolesService.update(payload);
      setRoles(next);
      // update users that referenced the previous role name
      if (prevName && prevName !== payload.name) {
        const users = userService.getAll();
        const updatedUsers = users.map((u) =>
          (u.rol || "").toLowerCase() === (prevName || "").toLowerCase()
            ? { ...u, rol: payload.name }
            : u,
        );
        userService.saveAll(updatedUsers);
      }
      setToast({
        message: `Rol actualizado: ${payload.name}`,
        type: "success",
        zIndex: 60,
      });
    } else {
      const next = rolesService.create(payload);
      setRoles(next);
      setToast({
        message: `Rol creado: ${payload.name}`,
        type: "success",
        zIndex: 60,
      });
    }

    setShowModal(false);
    resetForm();
    // notify other parts of the app that roles changed
    window.dispatchEvent(new CustomEvent("rolesChanged"));
  };

  const handleDeleteRole = (id) => {
    setDeleteConfirm({ show: true, id });
  };

  const confirmDelete = () => {
    const id = deleteConfirm.id;
    const next = rolesService.remove(id);
    setRoles(next);
    setToast({ message: "Rol eliminado", type: "success", zIndex: 50 });
    setDeleteConfirm({ show: false, id: null });
    window.dispatchEvent(new CustomEvent("rolesChanged"));
  };

  const cancelDelete = () => setDeleteConfirm({ show: false, id: null });

  const handleToggleActive = (id) => {
    // prevent disabling if any user is assigned to the role
    const allRoles = rolesService.getAll();
    const target = allRoles.find((r) => r.id === id);
    if (target && target.active) {
      const assigned = (userService.getAll() || []).filter(
        (u) => (u.rol || "").toLowerCase() === (target.name || "").toLowerCase(),
      );
      if (assigned.length > 0) {
        setToast({
          message: `No se puede desactivar el rol "${target.name}" porque está en uso.`,
          type: "error",
          zIndex: 60,
        });
        return;
      }
    }

    // toggle and persist
    const next = allRoles.map((r) =>
      r.id === id ? { ...r, active: !r.active } : r,
    );
    rolesService.saveAll(next);
    setRoles(next);
    setToast({ message: "Estado actualizado", type: "success", zIndex: 50 });
    window.dispatchEvent(new CustomEvent("rolesChanged"));
  };

  const handleEditRole = (role) => {
    setEditRole(role);
    // prefill form
    setRoleName(role.name);
    setRoleColor(role.colorId || (COLOR_OPTIONS[0] && COLOR_OPTIONS[0].id));
    setRoleDesc(role.description || "");
    const map = {};
    (role.permissions || []).forEach((p) => (map[p] = true));

    // if editing administrador, make sure every available permission is checked too
    if ((role.name || "").toLowerCase() === "administrador") {
      PERMISSIONS_CONFIG.forEach((p) => {
        map[p.id] = true;
      });
    }

    setSelectedPerms(map);
    setModalStep("form");
    setShowModal(true);
  };

  // derive categories per permission id map for searching by category
  const permById = useMemo(() => {
    const map = {};
    PERMISSIONS_CONFIG.forEach((p) => (map[p.id] = p));
    return map;
  }, []);

  // compute filtered roles based on search text and status
  const filteredRoles = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    return roles.filter((r) => {
      if (filterStatus === "active" && !r.active) return false;
      if (filterStatus === "inactive" && r.active) return false;
      if (!q) return true;
      // check role name
      if (r.name.toLowerCase().includes(q)) return true;
      // check description
      if ((r.description || "").toLowerCase().includes(q)) return true;
      // check categories of its permissions
      const cats = Array.from(
        new Set(
          (r.permissions || [])
            .map((pid) => permById[pid] && permById[pid].category)
            .filter(Boolean),
        ),
      );
      if (cats.some((c) => c.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [roles, filterText, filterStatus, permById]);

  return (
    <div className="h-full flex flex-col gap-4 font-sans">
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          zIndex={toast.zIndex}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Configuración</h1>
          <p className="text-xs text-gray-500">Gestión del sistema y roles</p>
        </div>

        <div>
          {activeSection === "roles" && (
            <button
              onClick={() => {
                resetForm();
                setModalStep("form");
                setShowModal(true);
              }}
              className="bg-primary-400 hover:bg-primary-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm flex items-center gap-2"
            >
              Crear rol
            </button>
          )}
        </div>
      </div>

      {/* Pestañas de secciones */}
      <div className="flex gap-2 border-b border-gray-200 bg-white rounded-t-lg p-2">
        <button
          onClick={() => setActiveSection("roles")}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
            activeSection === "roles"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Shield size={16} />
          Gestión de Roles
        </button>
        {user?.rol === "Administrador" && (
          <button
            onClick={() => setActiveSection("parameters")}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === "parameters"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <Settings size={16} />
            Gestión de Parámetros
          </button>
        )}
      </div>

      {/* Sección de Roles */}
      {activeSection === "roles" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-sm font-bold mb-3">Roles existentes</h2>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <div className="flex items-center w-full md:w-1/2 gap-2">
              <div className="flex-1">
                <input
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Buscar por nombre, descripción o categoría..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400"
                />
              </div>
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Nombre</th>
                  <th className="py-2 px-3">Descripción</th>
                  <th className="py-2 px-3">Usuarios</th>
                  <th className="py-2 px-3">Estado</th>
                  <th className="py-2 px-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-4 text-gray-400">
                      No se encontraron roles.
                    </td>
                  </tr>
                )}
                {filteredRoles.map((role) => (
                  <RoleRow
                    key={role.id}
                    role={role}
                    onEdit={() => handleEditRole(role)}
                    onDelete={() => handleDeleteRole(role.id)}
                    onToggle={() => handleToggleActive(role.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sección de Gestión de Parámetros - Solo para Administrador */}
      {activeSection === "parameters" && user?.rol === "Administrador" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <ParameterManagement user={user} />
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <div className="text-sm font-bold mb-2">Confirmar eliminación</div>
            <div className="text-xs text-gray-600 mb-4">
              ¿Estás seguro de eliminar este rol? Esta acción no se puede
              deshacer.
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelDelete}
                className="px-3 py-1 border rounded text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Rol */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl p-3 overflow-hidden max-h-[calc(100vh-120px)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setModalStep("form")}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    modalStep === "form"
                      ? "bg-primary-400 text-white"
                      : "bg-transparent text-gray-700"
                  }`}
                >
                  Crear rol
                </button>
                <button
                  onClick={() => setModalStep("perms")}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    modalStep === "perms"
                      ? "bg-primary-400 text-white"
                      : "bg-transparent text-gray-700"
                  }`}
                >
                  Permisos del rol
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                    setModalStep("form");
                  }}
                  className="text-gray-400"
                >
                  Cerrar
                </button>
              </div>
            </div>

            <div>
              {modalStep === "form" && (
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Nombre del rol
                  </label>
                  <input
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md mb-2 text-sm"
                    placeholder="Ej: Administrador"
                  />

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Color del tag
                  </label>
                  <div className="mb-2">
                    <select
                      value={roleColor}
                      onChange={(e) => setRoleColor(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm"
                    >
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          background: COLOR_OPTIONS.find(
                            (c) => c.id === roleColor,
                          ).hex,
                        }}
                      />
                      <span className="text-xs text-gray-500">
                        Previsualización
                      </span>
                    </div>
                  </div>

                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Descripción
                  </label>
                  <input
                    value={roleDesc}
                    onChange={(e) => setRoleDesc(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm"
                    placeholder="Breve descripción del rol"
                  />

                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={() => {
                        const errors = validateForm(false);
                        if (errors.length > 0) {
                          setToast({
                            message: errors[0],
                            type: "error",
                            zIndex: 60,
                          });
                          return;
                        }
                        setModalStep("perms");
                      }}
                      className="px-3 py-1 bg-primary-400 text-white rounded-md text-sm"
                    >
                      Siguiente: Permisos
                    </button>
                  </div>
                </div>
              )}

              {modalStep === "perms" && (
                <div className="bg-white p-3 rounded-2xl">
                  <h4 className="text-sm font-bold mb-2">
                    Configurar permisos del rol
                  </h4>
                  <p className="text-xs text-gray-500 mb-3">
                    Selecciona los permisos que aplican para este rol.
                  </p>

                  <div className="overflow-y-auto no-scrollbar max-h-[calc(100vh-240px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.keys(categories).map((cat) => (
                        <div key={cat} className="p-2 rounded-2xl bg-gray-50">
                        <h5 className="text-sm font-bold mb-1">{cat}</h5>
                        <p className="text-[11px] text-gray-500 mb-2">
                          Permisos relacionados con {cat.toLowerCase()}.
                        </p>
                        <div className="grid grid-cols-1 gap-1">
                          {categories[cat].map((p) => (
                            <label
                              key={p.id}
                              className="flex items-start gap-2 p-1 bg-white rounded-md border border-gray-100 text-sm"
                            >
                              <input
                                type="checkbox"
                                checked={!!selectedPerms[p.id]}
                                onChange={() => togglePerm(p.id)}
                                className="w-4 h-4 border rounded-sm mt-1"
                              />
                              <div>
                                <div className="text-sm font-medium">
                                  {p.label}
                                </div>
                                <div className="text-[11px] text-gray-500">
                                  {p.description}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  </div>

                  <div className="mt-3 flex items-center justify-between sticky bottom-0 bg-white pt-3">
                    <button
                      onClick={() => setModalStep("form")}
                      className="px-3 py-1 bg-white border rounded-md text-sm"
                    >
                      Atrás
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-gray-700">
                        Total: {totalSelected}
                      </div>
                      <button
                        onClick={handleCreateRole}
                        className="px-3 py-1 bg-primary-900 hover:bg-primary-800 text-white rounded-md text-sm flex items-center gap-2"
                      >
                        <Shield size={14} /> Crear Rol
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

const RoleRow = ({ role, onEdit, onDelete, onToggle }) => {
  const users = userService.getAll() || [];
  const usersCount = users.filter(
    (u) => (u.rol || "").toLowerCase() === (role.name || "").toLowerCase(),
  ).length;

  return (
    <tr className="border-b last:border-b-0">
      <td className="py-3 px-3 align-top text-xs">{role.id}</td>
      <td className="py-3 px-3 align-top">
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-4 rounded-sm"
            style={{ background: role.color }}
          />
          <div className="font-medium text-sm">{role.name}</div>
        </div>
      </td>
      <td className="py-3 px-3 align-top text-sm text-gray-600">
        {role.description}
      </td>
      <td className="py-3 px-3 align-top text-sm">{usersCount}</td>
      <td className="py-3 px-3 align-top text-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggle}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex items-center ${
              role.active ? "bg-primary-500" : "bg-gray-300"
            }`}
            aria-pressed={!!role.active}
          >
            <span
              className={`absolute left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ${
                role.active ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-xs text-gray-600">
            {role.active ? "Activo" : "Inactivo"}
          </span>
        </div>
      </td>
      <td className="py-3 px-3 align-top text-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};
