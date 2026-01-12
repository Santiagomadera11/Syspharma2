import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../features/auth/authService";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  Tags,
  Truck,
  DollarSign,
  ClipboardList,
  Stethoscope,
  Calendar,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  // Estado para controlar qué menús están desplegados
  const [openMenus, setOpenMenus] = useState({
    compras: true,
    ventas: false,
    servicios: false,
  });

  const toggleMenu = (menu) =>
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));

  // Función auxiliar: verifica si la ruta actual coincide exactamente o empieza con el path
  const isActive = (path) => location.pathname === path;
  const isGroupActive = (path) => location.pathname.startsWith(path);

  const navigate = useNavigate();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const handleConfirmLogout = () => {
    authService.logout();
    setShowConfirmLogout(false);
    navigate("/");
  };

  return (
    <aside className="w-60 h-screen bg-[#2C3E50] flex flex-col text-white shadow-xl flex-shrink-0 border-l border-gray-700">
      {/* Encabezado Sidebar */}
      <div className="h-14 flex items-center gap-3 px-5 border-b border-gray-700 bg-[#243342]">
        <div className="bg-primary-400 p-1 rounded-md shadow-lg shadow-primary-400/20">
          <Stethoscope size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-wide">SysPharma</h1>
          <p className="text-[9px] text-gray-400 uppercase tracking-wider">
            Menú
          </p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2 custom-scrollbar">
        <MenuItem
          to="/admin/dashboard"
          icon={LayoutDashboard}
          label="Inicio"
          active={isActive("/admin/dashboard")}
        />

        <div className="pt-3 pb-1">
          <p className="px-3 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
            Gestión
          </p>
        </div>

        <MenuItem
          to="/admin/usuarios"
          icon={Users}
          label="Usuarios"
          active={isActive("/admin/usuarios")}
        />

        {/* --- GRUPO COMPRAS (Ahora con Link propio) --- */}
        <MenuGroup
          to="/admin/compras"
          title="Compras"
          icon={ShoppingCart}
          isOpen={openMenus.compras}
          onToggle={() => toggleMenu("compras")}
          active={isActive("/admin/compras")} // Activo si estamos en el resumen de compras
        >
          <SubMenuItem
            to="/admin/productos"
            label="Productos"
            icon={Package}
            active={isActive("/admin/productos")}
          />
          <SubMenuItem
            to="/admin/categorias"
            label="Categorías"
            icon={Tags}
            active={isActive("/admin/categorias")}
          />
          <SubMenuItem
            to="/admin/proveedores"
            label="Proveedores"
            icon={Truck}
            active={isActive("/admin/proveedores")}
          />
        </MenuGroup>

        {/* --- GRUPO VENTAS --- */}
        <MenuGroup
          to="/admin/ventas"
          title="Ventas"
          icon={DollarSign}
          isOpen={openMenus.ventas}
          onToggle={() => toggleMenu("ventas")}
          active={isActive("/admin/ventas")}
        >
          <SubMenuItem
            to="/admin/pedidos"
            label="Pedidos"
            icon={ClipboardList}
            active={isActive("/admin/pedidos")}
          />
        </MenuGroup>

        {/* --- GRUPO SERVICIOS --- */}
        <MenuGroup
          to="/admin/servicios"
          title="Servicios"
          icon={Stethoscope}
          isOpen={openMenus.servicios}
          onToggle={() => toggleMenu("servicios")}
          active={isActive("/admin/servicios")}
        >
          <SubMenuItem
            to="/admin/citas"
            label="Citas Médicas"
            icon={Calendar}
            active={isActive("/admin/citas")}
          />
        </MenuGroup>

        <div className="pt-3 pb-1 border-t border-gray-700 mt-2">
          <p className="px-3 text-[9px] font-bold text-gray-500 uppercase tracking-wider">
            Sistema
          </p>
        </div>

        <MenuItem
          to="/admin/configuracion"
          icon={Settings}
          label="Configuración"
          active={isActive("/admin/configuracion")}
        />
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-700 bg-[#243342]">
        <button
          onClick={() => setShowConfirmLogout(true)}
          className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Cerrar Sesión
        </button>
      </div>

      {/* Confirm Logout Modal (match ProductFormModal styles: blurred backdrop) */}
      {showConfirmLogout && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-4"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              ¿Cerrar sesión?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              ¿Estás seguro de que quieres cerrar sesión? Serás redirigido a la
              página principal.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="px-3 py-1.5 bg-gray-100 rounded-md text-sm text-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

// --- COMPONENTES AUXILIARES ---

const MenuItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center px-3 py-2 rounded-md transition-all duration-200 group ${
      active
        ? "bg-primary-500 text-white shadow-sm"
        : "text-gray-300 hover:bg-white/5 hover:text-white"
    }`}
  >
    <Icon
      size={18}
      className={`mr-3 transition-colors ${
        active ? "text-white" : "text-gray-400 group-hover:text-white"
      }`}
    />
    <span className="text-xs font-medium">{label}</span>
  </Link>
);

const SubMenuItem = ({ to, label, icon: Icon, active }) => (
  <Link
    to={to}
    className={`flex items-center pl-10 pr-3 py-1.5 text-xs transition-colors rounded-md mb-0.5 ${
      active
        ? "text-primary-400 font-bold bg-white/5"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    }`}
  >
    {Icon && <Icon size={14} className="mr-2 opacity-70" />}
    {label}
  </Link>
);

// --- MENU GROUP MEJORADO (Link + Toggle) ---
const MenuGroup = ({
  to,
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
  active,
}) => (
  <div className="mb-0.5">
    {/* Contenedor Flex que separa el Link del Botón Toggle */}
    <div
      className={`flex items-center rounded-md transition-colors ${
        active
          ? "bg-primary-500 text-white"
          : "text-gray-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      {/* 1. ZONA DE NAVEGACIÓN (Izquierda) */}
      <Link
        to={to}
        className="flex-1 flex items-center px-3 py-2 cursor-pointer outline-none"
        onClick={() => {
          // Opcional: Si quieres que al dar click en el nombre TAMBIÉN se abra el menú, descomenta esto:
          // if (!isOpen) onToggle();
        }}
      >
        <Icon
          size={18}
          className={`mr-3 ${active ? "text-white" : "text-gray-400"}`}
        />
        <span className="text-xs font-medium">{title}</span>
      </Link>

      {/* 2. ZONA DE EXPANDIR/CONTRAER (Derecha - Botón Flecha) */}
      <button
        onClick={(e) => {
          e.preventDefault(); // Evita navegar
          e.stopPropagation();
          onToggle();
        }}
        className="p-2 hover:bg-white/10 rounded-r-md transition-colors cursor-pointer"
      >
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>
    </div>

    {/* Contenido Desplegable */}
    <div
      className={`overflow-hidden transition-all duration-300 ${
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="mt-0.5 space-y-0.5">{children}</div>
    </div>
  </div>
);

export default Sidebar;
