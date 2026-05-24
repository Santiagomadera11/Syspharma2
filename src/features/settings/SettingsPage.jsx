import React, { useMemo, useState } from "react";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import {
  Shield, Edit, Trash2, Settings, Users,
  ShoppingCart, ShoppingBag, Activity, BarChart3,
  Lock, CheckCircle2, Search, X, ChevronLeft, ChevronRight,
  LayoutDashboard, Package, Tags, Truck, DollarSign,
  ClipboardList, Stethoscope, Calendar, TrendingUp
} from "lucide-react";
import { ToastNotification } from "../../shared/ui/ToastNotification";
import { rolesService } from "./rolesService";
import { permissionService } from "./permissionService";
import { PERMISSIONS_CONFIG } from "./rolesConfig";
import ParameterManagement from "./components/ParameterManagement";

const COLOR_OPTIONS = [
  { id: "turquoise", name: "Turquesa", hex: "#4fd1c5" },
  { id: "blue",      name: "Azul",     hex: "#3b82f6" },
  { id: "green",     name: "Verde",    hex: "#10b981" },
  { id: "purple",    name: "Morado",   hex: "#8b5cf6" },
  { id: "slate",     name: "Oscuro",   hex: "#1e293b" },
];

const PERMISSION_GROUPS = [
  {
    title: "Inicio",
    icon: <LayoutDashboard size={20} className="text-emerald-600" />,
    subsections: [
      {
        title: "Inicio / Dashboard",
        perms: ["dashboard.view"]
      }
    ]
  },
  {
    title: "Usuarios",
    icon: <Users size={20} className="text-blue-600" />,
    subsections: [
      {
        title: "Gestión de Usuarios",
        perms: ["users.view", "users.create", "users.edit", "users.delete", "users.status"]
      }
    ]
  },
  {
    title: "Compras",
    icon: <ShoppingBag size={20} className="text-orange-600" />,
    subsections: [
      {
        title: "Registro de Compras",
        perms: ["purchase.view", "purchase.create", "purchase.edit", "purchase.delete", "purchase.status"]
      },
      {
        title: "Submódulo: Productos",
        perms: ["products.view", "products.create", "products.edit", "products.delete", "products.status"]
      },
      {
        title: "Submódulo: Categorías",
        perms: ["categories.view", "categories.create", "categories.edit", "categories.delete", "categories.status"]
      },
      {
        title: "Submódulo: Proveedores",
        perms: ["suppliers.view", "suppliers.create", "suppliers.edit", "suppliers.delete", "suppliers.status"]
      }
    ]
  },
  {
    title: "Ventas",
    icon: <DollarSign size={20} className="text-emerald-600" />,
    subsections: [
      {
        title: "Registro de Ventas",
        perms: ["sales.view", "sales.create", "sales.cancel", "sales.return", "sales.invoice", "sales.export"]
      },
      {
        title: "Submódulo: Pedidos",
        perms: ["orders.view", "orders.create", "orders.edit", "orders.delete", "orders.status", "orders.export"]
      }
    ]
  },
  {
    title: "Servicios y Citas",
    icon: <Activity size={20} className="text-purple-600" />,
    subsections: [
      {
        title: "Registro de Servicios",
        perms: ["services.view", "services.create", "services.edit", "services.delete", "services.status"]
      },
      {
        title: "Submódulo: Citas Médicas",
        perms: ["appointments.create", "appointments.calendar", "appointments.list", "appointments.status"]
      },
      {
        title: "Submódulo: Disponibilidad de Médicos",
        perms: ["appointments.availability"]
      },
      {
        title: "Submódulo: Médicos",
        perms: ["appointments.doctors.view", "appointments.doctors.create", "appointments.doctors.edit", "appointments.doctors.delete", "appointments.doctors.status"]
      }
    ]
  },
  {
    title: "Reportes",
    icon: <BarChart3 size={20} className="text-rose-600" />,
    subsections: [
      {
        title: "Submódulo: Historial de Turnos",
        perms: ["reports.shifts"]
      },
      {
        title: "Submódulo: Desempeño de Empleados",
        perms: ["reports.performance"]
      }
    ]
  },
  {
    title: "Configuración y Sistema",
    icon: <Settings size={20} className="text-slate-600" />,
    subsections: [
      {
        title: "Roles del Sistema",
        perms: ["system.roles"]
      },
      {
        title: "Configuración: Categorías de Servicio",
        perms: ["config.service_categories.create", "config.service_categories.edit", "config.service_categories.delete"]
      },
      {
        title: "Configuración: Métodos de Pago",
        perms: ["config.payment_methods.create", "config.payment_methods.edit", "config.payment_methods.delete"]
      },
      {
        title: "Configuración: Tipos de Documento",
        perms: ["config.document_types.create", "config.document_types.edit", "config.document_types.delete"]
      }
    ]
  }
];

const ROLES_PER_PAGE = 4;

export const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("roles");
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState("form");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [editRole, setEditRole] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });

  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [roleColor, setRoleColor] = useState(COLOR_OPTIONS[0].id);
  const [selectedPerms, setSelectedPerms] = useState({});

  const user = JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");

  React.useEffect(() => { loadRoles(); }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await rolesService.getAll();
      setRoles(Array.isArray(response) ? response : (response?.data || []));
      setCurrentPage(1);
    } catch (error) {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(roles.length / ROLES_PER_PAGE);
  const usePagination = roles.length > ROLES_PER_PAGE;
  const pagedRoles = usePagination
    ? roles.slice((currentPage - 1) * ROLES_PER_PAGE, currentPage * ROLES_PER_PAGE)
    : roles;

  const confirmDelete = async () => {
    try {
      await rolesService.delete(deleteConfirm.id);
      setToast({ message: "Rol eliminado con éxito", type: "success" });
      await loadRoles();
    } catch (error) {
      const msg = error?.response?.data?.message || "Error al eliminar el rol";
      setToast({ message: msg, type: "error" });
    } finally {
      setDeleteConfirm({ show: false, id: null, name: "" });
    }
  };

  const togglePerm = (id) =>
    setSelectedPerms((prev) => ({ ...prev, [id]: !prev[id] }));

  // Selecciona/deselecciona todos los permisos pasados por argumento
  const toggleAllPerms = (items) => {
    const allSelected = items.every((p) => selectedPerms[p.id]);
    const newPerms = { ...selectedPerms };
    items.forEach((p) => { newPerms[p.id] = !allSelected; });
    setSelectedPerms(newPerms);
  };

  const handleEditRole = (role) => {
    setEditRole(role);
    setRoleName(role.nombre || role.name);
    setRoleDesc(role.descripcion || role.description);
    const map = {};
    (role.permisos || role.permissions || []).forEach((p) => (map[p] = true));
    setSelectedPerms(map);
    setModalStep("form");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      setToast({ message: "El nombre del rol es requerido", type: "error" });
      return;
    }

    const permissions = Object.keys(selectedPerms).filter((k) => selectedPerms[k]);
    const payload = {
      id: editRole?.id || 0,
      nombre: roleName,
      descripcion: roleDesc,
      permisos: permissions,
    };

    try {
      await rolesService.save(payload);
      setToast({
        message: editRole ? "Rol actualizado correctamente" : "Rol creado correctamente",
        type: "success",
      });
      setShowModal(false);
      await loadRoles();
      setEditRole(null);
      setRoleName("");
      setRoleDesc("");
      setSelectedPerms({});
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || error?.message || "Error al guardar el rol";
      setToast({ message: errorMsg, type: "error" });
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 font-sans p-2">
      {toast && <ToastNotification {...toast} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">CONFIGURACIÓN</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Seguridad y Parámetros</p>
        </div>
        {activeSection === "roles" && (
          <button
            onClick={() => {
              setEditRole(null);
              setRoleName("");
              setRoleDesc("");
              setSelectedPerms({});
              setModalStep("form");
              setShowModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95"
          >
            Crear Nuevo Rol
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-100">
        <button
          onClick={() => setActiveSection("roles")}
          className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
            activeSection === "roles"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-400"
          }`}
        >
          Gestión de Roles
        </button>
        <button
          onClick={() => setActiveSection("params")}
          className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${
            activeSection === "params"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-400"
          }`}
        >
          Parámetros
        </button>
      </div>

      {/* ── SECCIÓN ROLES ── */}
      {activeSection === "roles" && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-400 text-sm">Cargando roles...</td>
                </tr>
              ) : pagedRoles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-slate-400 text-sm">No hay roles registrados</td>
                </tr>
              ) : (
                pagedRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">
                          {(role.nombre || role.name || "?")[0].toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-700 text-sm">{role.nombre || role.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400 font-medium">
                      {role.descripcion || role.description}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditRole(role)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteConfirm({ show: true, id: role.id, name: role.nombre || role.name })
                          }
                          className="p-1.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {usePagination && (
            <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-400 font-medium">
                Mostrando {(currentPage - 1) * ROLES_PER_PAGE + 1}–
                {Math.min(currentPage * ROLES_PER_PAGE, roles.length)} de {roles.length} roles
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                      currentPage === page
                        ? "bg-emerald-600 text-white shadow-md"
                        : "text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SECCIÓN PARÁMETROS ── */}
      {activeSection === "params" && <ParameterManagement user={user} />}

      {/* ── Confirm Delete ── */}
      {deleteConfirm.show && (
        <ConfirmDialog
          open={deleteConfirm.show}
          title="Eliminar rol"
          description={`¿Seguro que deseas eliminar el rol "${deleteConfirm.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ show: false, id: null, name: "" })}
        />
      )}

      {/* ── MODAL CREAR / EDITAR ROL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">

            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                  {editRole ? "Editar Rol" : "Crear Rol Maestro"}
                </h2>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => setModalStep("form")}
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      modalStep === "form" ? "text-emerald-600 underline" : "text-slate-400"
                    }`}
                  >
                    1. Información
                  </button>
                  <button
                    onClick={() => setModalStep("perms")}
                    className={`text-[10px] font-black uppercase tracking-widest ${
                      modalStep === "perms" ? "text-emerald-600 underline" : "text-slate-400"
                    }`}
                  >
                    2. Permisos
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"
              >
                <X />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
              {modalStep === "form" ? (
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">
                      Nombre del Rol
                    </label>
                    <input
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all"
                      placeholder="Ej: Administrador de Ventas"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">
                      Descripción
                    </label>
                    <textarea
                      value={roleDesc}
                      onChange={(e) => setRoleDesc(e.target.value)}
                      className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 outline-none font-medium text-slate-600 h-32"
                      placeholder="Describe las responsabilidades..."
                    />
                  </div>
                  <button
                    onClick={() => setModalStep("perms")}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100"
                  >
                    Configurar Permisos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {PERMISSION_GROUPS.map((group) => {
                    // Obtener todos los permisos configurados para este grupo en base a los IDs de permisos declarados
                    const allGroupPermIds = group.subsections.flatMap(sub => sub.perms);
                    const groupPerms = PERMISSIONS_CONFIG.filter(p => allGroupPermIds.includes(p.id));
                    
                    const allSelected = groupPerms.length > 0 && groupPerms.every((p) => selectedPerms[p.id]);
                    const someSelected = groupPerms.some((p) => selectedPerms[p.id]);

                    return (
                      <div key={group.title} className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm flex flex-col h-fit">
                        
                        {/* Header del módulo con checkbox general */}
                        <div
                          className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3 cursor-pointer group"
                          onClick={() => toggleAllPerms(groupPerms)}
                        >
                          {/* Checkbox general */}
                          <div
                            className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all
                              ${allSelected
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : someSelected
                                  ? "bg-emerald-100 border-emerald-400"
                                  : "bg-white border-slate-300 group-hover:border-emerald-300"
                              }`}
                          >
                            {allSelected && <CheckCircle2 size={12} strokeWidth={4} />}
                            {someSelected && !allSelected && (
                              <div className="w-2 h-0.5 bg-emerald-500 rounded-sm" />
                            )}
                          </div>

                          {group.icon}

                          <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex-1">
                            {group.title}
                          </h4>
                        </div>

                        {/* Subsecciones */}
                        <div className="space-y-4">
                          {group.subsections.map((sub) => {
                            const subPerms = PERMISSIONS_CONFIG.filter(p => sub.perms.includes(p.id));
                            if (subPerms.length === 0) return null;

                            return (
                              <div key={sub.title} className="space-y-2">
                                {/* Título del apartado / sección */}
                                <div className="flex items-center justify-between px-1">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    {sub.title}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toggleAllPerms(subPerms);
                                    }}
                                    className="text-[9px] text-emerald-600 hover:text-emerald-800 font-bold uppercase hover:underline"
                                  >
                                    Todos
                                  </button>
                                </div>

                                {/* Permisos individuales dentro de este apartado */}
                                <div className="space-y-1.5">
                                  {subPerms.map((p) => (
                                    <div
                                      key={p.id}
                                      onClick={() => togglePerm(p.id)}
                                      className={`flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all cursor-pointer ${
                                        selectedPerms[p.id]
                                          ? "border-emerald-500 bg-emerald-50/20"
                                          : "border-transparent bg-slate-50 hover:border-slate-200"
                                      }`}
                                    >
                                      <div
                                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                                          selectedPerms[p.id]
                                            ? "bg-emerald-500 border-emerald-500 text-white"
                                            : "bg-white border-slate-300"
                                        }`}
                                      >
                                        {selectedPerms[p.id] && <CheckCircle2 size={10} strokeWidth={4} />}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p
                                          className={`text-[9px] font-black uppercase truncate ${
                                            selectedPerms[p.id] ? "text-emerald-900" : "text-slate-600"
                                          }`}
                                        >
                                          {p.label}
                                        </p>
                                        <p className="text-[8px] text-slate-400 font-medium leading-tight truncate">
                                          {p.description}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-slate-100 flex justify-between items-center bg-white">
              {modalStep === "perms" && (
                <button
                  onClick={() => setModalStep("form")}
                  className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase"
                >
                  <ChevronLeft /> Volver
                </button>
              )}
              <div className="ml-auto flex items-center gap-6">
                <span className="text-xs font-black text-slate-400 uppercase">
                  Seleccionados:{" "}
                  <span className="text-emerald-600">
                    {Object.values(selectedPerms).filter(Boolean).length}
                  </span>
                </span>
                <button
                  onClick={handleSave}
                  className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;