import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, DollarSign, Package,
  ClipboardList, Calendar, Stethoscope, User, LogOut, X,
} from "lucide-react";

const MENU_ITEMS = [
  { to: "/employee/inicio",    icon: LayoutDashboard, label: "Inicio",    perm: null },
  { to: "/employee/compras",   icon: ShoppingCart,    label: "Compras",   perm: "inven.view" },
  { to: "/employee/ventas",    icon: DollarSign,      label: "Ventas",    perm: "sales.view" },
  { to: "/employee/productos", icon: Package,         label: "Productos", perm: "inven.view" },
  { to: "/employee/pedidos",   icon: ClipboardList,   label: "Pedidos",   perm: "sales.orders" },
  { to: "/employee/servicios", icon: Stethoscope,     label: "Servicios", perm: "services.view" },
  { to: "/employee/citas",     icon: Calendar,        label: "Citas",     perm: "services.view" },
  { to: "/employee/mi-perfil", icon: User,            label: "Mi Perfil", perm: null },
];

const ROLES_FIJOS = ["administrador", "empleado", "cliente"];

const EmployeeSidebar = ({ isOpen, onClose, onShowLogoutModal }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const currentUser = JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");
  const userRole = (currentUser.rol || "").toLowerCase().trim();
  const userPerms = currentUser.permisos || [];
  const esRolDinamico = !ROLES_FIJOS.includes(userRole);
  const esEmpleadoFijo = userRole === "empleado";

  const puedeVer = (perm) => {
    if (!perm) return true; // Sin restricción (Inicio, Mi Perfil)
    if (userRole === "administrador") return true;
    if (esEmpleadoFijo) return true; // Empleado fijo ve todo
    if (esRolDinamico) return userPerms.includes(perm); // Rol dinámico — solo sus permisos
    return false;
  };

  const visibleItems = MENU_ITEMS.filter(item => puedeVer(item.perm));

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed lg:static w-60 bg-[#1E3A5F] flex flex-col text-white shadow-xl z-50 flex-shrink-0 border-l border-gray-700 transition-transform duration-300 h-full ${
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      }`}>
        <div className="h-14 flex items-center justify-between px-5 border-b border-gray-700 bg-[#152A47]">
          <div className="flex items-center gap-3">
            <div className="bg-blue-400 p-1 rounded-md shadow-lg shadow-blue-400/20">
              <Stethoscope size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-wide">SysPharma</h1>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider">Empleado</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2 custom-scrollbar">
          {visibleItems.map((item, i) => {
            // Separador antes de "Compras" (primera opción de Operaciones)
            const esPrimeroOperaciones = item.to === "/employee/compras";
            return (
              <React.Fragment key={item.to}>
                {esPrimeroOperaciones && (
                  <div className="pt-3 pb-1">
                    <p className="px-3 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Operaciones</p>
                  </div>
                )}
                <MenuItem
                  to={item.to}
                  icon={item.icon}
                  label={item.label}
                  active={isActive(item.to)}
                />
              </React.Fragment>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-700 bg-[#0F2A3F]">
          <button onClick={onShowLogoutModal}
            className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
};

const MenuItem = ({ to, icon: Icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
    active ? "bg-blue-600/80 text-white font-semibold shadow-md" : "text-gray-300 hover:text-white hover:bg-white/10"
  }`}>
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </Link>
);

export default EmployeeSidebar;