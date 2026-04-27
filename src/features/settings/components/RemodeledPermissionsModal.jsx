import React, { useMemo } from "react";
import { 
  Users, ShoppingCart, ShoppingBag, Activity, 
  Settings, ShieldCheck, ChevronLeft, X, BarChart3,
  Lock, CheckCircle2
} from "lucide-react";

// Configuración de estilo por categoría (Coincide con tu Sidebar)
const CATEGORIA_UI = {
  "Usuarios": { icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
  "Ventas": { icon: ShoppingCart, color: "text-emerald-600", bg: "bg-emerald-50" },
  "Compras": { icon: ShoppingBag, color: "text-orange-600", bg: "bg-orange-50" },
  "Servicios": { icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
  "Sistema": { icon: Settings, color: "text-slate-600", bg: "bg-slate-50" },
  "Reportes": { icon: BarChart3, color: "text-rose-600", bg: "bg-rose-50" },
};

export const RemodeledPermissionsModal = ({ 
  apiPermissions = [], // Los datos que vienen de la API
  formData, 
  onPermissionChange, 
  onClose, 
  onSave,
  onBack 
}) => {

  // MAGIA: Agrupamos los permisos de la API por su columna "categoria"
  const groupedPermissions = useMemo(() => {
    return apiPermissions.reduce((acc, permiso) => {
      const cat = permiso.categoria || "Otros";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(permiso);
      return acc;
    }, {});
  }, [apiPermissions]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden border border-white/20">
        {/* HEADER: Identidad de Marca */}
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-200">
                <Lock size={20} />
              </div>
              <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Configurar Accesos</h2>
            </div>
            <p className="text-sm text-slate-400 font-medium ml-1">
              Estás definiendo qué puede hacer el rol: <span className="text-slate-900 font-bold underline decoration-emerald-400">{formData.nombre || "Nuevo Rol"}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-rose-50 hover:text-rose-500 rounded-2xl text-slate-400 transition-all duration-300">
            <X size={28} />
          </button>
        </div>

        {/* CONTENIDO: Grid de Módulos (Bento Box) */}
        <div className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Object.entries(groupedPermissions).map(([catNombre, items]) => {
              const ui = CATEGORIA_UI[catNombre] || { icon: Lock, color: "text-slate-600", bg: "bg-slate-100" };
              const Icono = ui.icon;
              return (
                <div key={catNombre} className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Categoría Header */}
                  <div className="flex items-center gap-3 mb-5 ml-2">
                    <div className={`${ui.bg} ${ui.color} p-2.5 rounded-xl shadow-sm`}>
                      <Icono size={18} />
                    </div>
                    <h4 className="font-black text-slate-700 text-xs uppercase tracking-[0.2em]">{catNombre}</h4>
                  </div>

                  {/* Tarjetas de Permisos */}
                  <div className="space-y-3">
                    {items.map((permiso) => {
                      const isSelected = formData.permisos.includes(permiso.codigo);
                      return (
                        <div 
                          key={permiso.codigo}
                          onClick={() => onPermissionChange(permiso.codigo)}
                          className={`group flex items-center gap-4 p-4 rounded-[1.5rem] border-2 transition-all duration-300 cursor-pointer
                            ${isSelected 
                              ? 'border-emerald-500 bg-white shadow-xl shadow-emerald-100/50 scale-[1.02]' 
                              : 'border-white bg-white hover:border-slate-200 shadow-sm hover:shadow-md'
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300
                            ${isSelected ? 'bg-emerald-500 text-white rotate-6' : 'bg-slate-50 text-slate-300 group-hover:text-slate-400'}`}>
                            {isSelected ? <CheckCircle2 size={22} /> : <ShieldCheck size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-black uppercase tracking-tight transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
                              {permiso.nombre}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium leading-none mt-1 line-clamp-1">
                              {permiso.descripcion}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                            ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200'}`}>
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FOOTER: Resumen y Acción Principal */}
        <div className="px-10 py-8 border-t border-slate-100 bg-white flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-900 transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
            Volver a información básica
          </button>
          <div className="flex items-center gap-10">
            <div className="hidden sm:block text-right border-r border-slate-100 pr-10">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Permisos habilitados</p>
              <div className="flex items-center justify-end gap-2">
                <span className="text-3xl font-black text-emerald-600">{formData.permisos.length}</span>
                <span className="text-slate-300 font-bold">/</span>
                <span className="text-slate-400 text-sm font-bold">{apiPermissions.length}</span>
              </div>
            </div>
            <button 
              onClick={onSave}
              className="bg-[#1e293b] hover:bg-black text-white px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-slate-200 transition-all active:scale-95 flex items-center gap-3 group"
            >
              <CheckCircle2 size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              Guardar Rol Maestro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
