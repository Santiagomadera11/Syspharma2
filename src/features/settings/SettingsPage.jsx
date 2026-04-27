import React, { useMemo, useState, useEffect } from "react";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog";
import { 
  Shield, Edit, Trash2, Settings, Users, 
  ShoppingCart, ShoppingBag, Activity, BarChart3, 
  Lock, CheckCircle2, Search, X, ChevronLeft 
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

const CATEGORIA_ICONS = {
  "Usuarios": <Users size={18} className="text-blue-600" />,
  "Ventas": <ShoppingCart size={18} className="text-emerald-600" />,
  "Compras/Inventario": <ShoppingBag size={18} className="text-orange-600" />,
  "Servicios": <Activity size={18} className="text-purple-600" />,
  "Reportes": <BarChart3 size={18} className="text-rose-600" />,
  "Sistema": <Settings size={18} className="text-slate-600" />,
};

export const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState("roles");
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState("form");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState("");
  const [editRole, setEditRole] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null, name: "" });
    // Eliminar rol con confirmación y manejo de errores backend
    const confirmDelete = async () => {
      try {
        // Usamos el ID del rol que guardamos al darle click al basurero
        await rolesService.delete(deleteConfirm.id);
        setToast({ message: "Rol eliminado con éxito", type: "success" });
        await loadRoles(); // Recarga la tabla para que desaparezca el rol
      } catch (error) {
        // Aquí el error 400/500 se convierte en un mensaje legible
        const msg = error?.response?.data?.message || "Error al eliminar el rol";
        setToast({ message: msg, type: "error" });
      } finally {
        setDeleteConfirm({ show: false, id: null, name: "" });
      }
    };
  
  // Formulario
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");
  const [roleColor, setRoleColor] = useState(COLOR_OPTIONS[0].id);
  const [selectedPerms, setSelectedPerms] = useState({});

  const user = JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");

  useEffect(() => { loadRoles(); }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      const response = await rolesService.getAll();
      setRoles(Array.isArray(response) ? response : (response?.data || []));
    } catch (error) {
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  // Agrupación dinámica de permisos por categoría
  const groupedPermissions = useMemo(() => {
    const map = {};
    PERMISSIONS_CONFIG.forEach((p) => {
      if (!map[p.category]) map[p.category] = [];
      map[p.category].push(p);
    });
    return map;
  }, []);

  const togglePerm = (id) => setSelectedPerms((prev) => ({ ...prev, [id]: !prev[id] }));

  const handleEditRole = (role) => {
    setEditRole(role);
    setRoleName(role.nombre || role.name);
    setRoleDesc(role.descripcion || role.description);
    const map = {};
    (role.permisos || role.permissions || []).forEach(p => (map[p] = true));
    setSelectedPerms(map);
    setModalStep("form");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      setToast({ message: "El nombre del rol es requerido", type: "error" });
      return;
    }

    const permissions = Object.keys(selectedPerms).filter(k => selectedPerms[k]);
    const payload = {
      id: editRole?.id || 0,
      nombre: roleName,
      descripcion: roleDesc,
      permisos: permissions
    };

    try {
      console.log("📝 Guardando rol:", payload);
      await rolesService.save(payload);
      
      setToast({ message: editRole ? "Rol actualizado correctamente" : "Rol creado correctamente", type: "success" });
      setShowModal(false);
      await loadRoles();
      // Reset form
      setEditRole(null);
      setRoleName("");
      setRoleDesc("");
      setSelectedPerms({});
    } catch (error) {
      console.error("❌ Error al guardar rol:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Error al guardar el rol";
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
        <button 
          onClick={() => { setEditRole(null); setRoleName(""); setRoleDesc(""); setSelectedPerms({}); setShowModal(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95"
        >
          Crear Nuevo Rol
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-100">
        <button onClick={() => setActiveSection("roles")} className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeSection === "roles" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400"}`}>Gestión de Roles</button>
        <button onClick={() => setActiveSection("params")} className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeSection === "params" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-400"}`}>Parámetros</button>
      </div>

      {activeSection === "roles" && (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Rol</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descripción</th>
                <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {roles.map(role => (
                <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">{(role.nombre || role.name)[0]}</div>
                      <span className="font-bold text-slate-700">{role.nombre || role.name}</span>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-slate-400 font-medium">{role.descripcion || role.description}</td>
                  <td className="p-5">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => handleEditRole(role)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit size={16}/></button>
                      <button onClick={() => setDeleteConfirm({ show: true, id: role.id, name: role.nombre || role.name })} className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={16}/></button>
                          {/* Diálogo de confirmación de borrado */}
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL REMODELADO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{editRole ? "Editar Rol" : "Crear Rol Maestro"}</h2>
                <div className="flex gap-4 mt-2">
                  <button onClick={() => setModalStep("form")} className={`text-[10px] font-black uppercase tracking-widest ${modalStep === "form" ? "text-emerald-600 underline" : "text-slate-400"}`}>1. Información</button>
                  <button onClick={() => setModalStep("perms")} className={`text-[10px] font-black uppercase tracking-widest ${modalStep === "perms" ? "text-emerald-600 underline" : "text-slate-400"}`}>2. Permisos</button>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400"><X /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
              {modalStep === "form" ? (
                <div className="max-w-md mx-auto space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">Nombre del Rol</label>
                    <input value={roleName} onChange={e => setRoleName(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 outline-none font-bold text-slate-700 transition-all" placeholder="Ej: Administrador de Ventas" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block ml-1">Descripción</label>
                    <textarea value={roleDesc} onChange={e => setRoleDesc(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 focus:border-emerald-500 outline-none font-medium text-slate-600 h-32" placeholder="Describe las responsabilidades..." />
                  </div>
                  <button onClick={() => setModalStep("perms")} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100">Configurar Permisos</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(groupedPermissions).map(([cat, items]) => (
                    <div key={cat} className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-5 border-b border-slate-50 pb-3">
                        {CATEGORIA_ICONS[cat] || <Lock size={18}/>}
                        <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider">{cat}</h4>
                      </div>
                      <div className="space-y-2">
                        {items.map(p => (
                          <div key={p.id} onClick={() => togglePerm(p.id)} className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all cursor-pointer ${selectedPerms[p.id] ? 'border-emerald-500 bg-emerald-50/30' : 'border-transparent bg-slate-50 hover:border-slate-200'}`}>
                            <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center ${selectedPerms[p.id] ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300'}`}>
                              {selectedPerms[p.id] && <CheckCircle2 size={12} strokeWidth={4} />}
                            </div>
                            <div>
                              <p className={`text-[10px] font-black uppercase ${selectedPerms[p.id] ? 'text-emerald-900' : 'text-slate-600'}`}>{p.label}</p>
                              <p className="text-[9px] text-slate-400 font-medium leading-none">{p.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 flex justify-between items-center bg-white">
              {modalStep === "perms" && <button onClick={() => setModalStep("form")} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase"><ChevronLeft /> Volver</button>}
              <div className="ml-auto flex items-center gap-6">
                <span className="text-xs font-black text-slate-400 uppercase">Seleccionados: <span className="text-emerald-600">{Object.values(selectedPerms).filter(Boolean).length}</span></span>
                <button onClick={handleSave} className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all">Guardar Cambios</button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;