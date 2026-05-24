import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, ShoppingCart, DollarSign, Package,
  ClipboardList, Calendar, Stethoscope, User, LogOut, X, Tags, Truck,
  BarChart3, TrendingUp, Settings,
} from "lucide-react";

const normalizePerm = (perm) => String(perm || "").toLowerCase().trim();

const EmployeeSidebar = ({ isOpen, onClose, onShowLogoutModal }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const currentUser = JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");
  const userRole = (currentUser.rol || "").toLowerCase().trim();
  const userPerms = (currentUser.permisos || []).map(normalizePerm);

  const has = (...perms) => {
    if (userRole === "administrador") return true;
    return perms.some((p) => userPerms.includes(normalizePerm(p)));
  };

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
              <p className="text-[9px] text-gray-400 uppercase tracking-wider">Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2 custom-scrollbar">

          {/* Inicio — siempre visible */}
          <MenuItem to="/employee/inicio" icon={LayoutDashboard} label="Inicio" active={isActive("/employee/inicio")} />

          {/* ── Operaciones ── solo si tiene al menos un permiso de operaciones */}
          {has(
            "users.view","users.create","users.edit","users.delete","users.status",
            "purchase.view","purchase.create","purchase.edit","purchase.delete","purchase.status",
            "products.view","products.create","products.edit","products.delete","products.status",
            "categories.view","categories.create","categories.edit","categories.delete","categories.status",
            "suppliers.view","suppliers.create","suppliers.edit","suppliers.delete","suppliers.status",
            "sales.view","sales.create","sales.cancel","sales.return","sales.invoice","sales.export",
            "orders.view","orders.create","orders.edit","orders.delete","orders.status","orders.export",
            "services.view","services.create","services.edit","services.delete","services.status",
            "appointments.create","appointments.calendar","appointments.list","appointments.status",
            "appointments.availability","appointments.doctors.view",
            "reports.shifts","reports.performance",
            "system.roles",
            "config.service_categories.create","config.service_categories.edit","config.service_categories.delete",
            "config.payment_methods.create","config.payment_methods.edit","config.payment_methods.delete",
            "config.document_types.create","config.document_types.edit","config.document_types.delete"
          ) && (
            <div className="pt-3 pb-1">
              <p className="px-3 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Operaciones</p>
            </div>
          )}

          {has("users.view","users.create","users.edit","users.delete","users.status") && (
            <MenuItem to="/employee/usuarios" icon={Users} label="Usuarios" active={isActive("/employee/usuarios")} />
          )}

          {has("purchase.view","purchase.create","purchase.edit","purchase.delete","purchase.status") && (
            <MenuItem to="/employee/compras" icon={ShoppingCart} label="Compras" active={isActive("/employee/compras")} />
          )}

          {has("sales.view","sales.create","sales.cancel","sales.return","sales.invoice","sales.export") && (
            <MenuItem to="/employee/ventas" icon={DollarSign} label="Ventas" active={isActive("/employee/ventas")} />
          )}

          {has("products.view","products.create","products.edit","products.delete","products.status") && (
            <MenuItem to="/employee/productos" icon={Package} label="Productos" active={isActive("/employee/productos")} />
          )}

          {has("categories.view","categories.create","categories.edit","categories.delete","categories.status") && (
            <MenuItem to="/employee/categorias" icon={Tags} label="Categorías" active={isActive("/employee/categorias")} />
          )}

          {has("suppliers.view","suppliers.create","suppliers.edit","suppliers.delete","suppliers.status") && (
            <MenuItem to="/employee/proveedores" icon={Truck} label="Proveedores" active={isActive("/employee/proveedores")} />
          )}

          {has("orders.view","orders.create","orders.edit","orders.delete","orders.status","orders.export") && (
            <MenuItem to="/employee/pedidos" icon={ClipboardList} label="Pedidos" active={isActive("/employee/pedidos")} />
          )}

          {has("services.view","services.create","services.edit","services.delete","services.status") && (
            <MenuItem to="/employee/servicios" icon={Stethoscope} label="Servicios" active={isActive("/employee/servicios")} />
          )}

          {has(
            "appointments.create","appointments.calendar","appointments.list","appointments.status"
          ) && (
            <MenuItem to="/employee/citas" icon={Calendar} label="Citas" active={isActive("/employee/citas")} />
          )}

          {has("appointments.availability") && (
            <MenuItem to="/employee/citas/disponibilidad" icon={Calendar} label="Disponibilidad" active={isActive("/employee/citas/disponibilidad")} />
          )}

          {has("appointments.doctors.view","appointments.doctors.create","appointments.doctors.edit","appointments.doctors.delete","appointments.doctors.status") && (
            <MenuItem to="/employee/medicos" icon={Stethoscope} label="Médicos" active={isActive("/employee/medicos")} />
          )}

          {has("reports.shifts") && (
            <MenuItem to="/employee/reportes/turnos" icon={BarChart3} label="Historial de Turnos" active={isActive("/employee/reportes/turnos")} />
          )}

          {has("reports.performance") && (
            <MenuItem to="/employee/reportes/desempeño" icon={TrendingUp} label="Desempeño de Empleados" active={isActive("/employee/reportes/desempeño")} />
          )}

          {/* Mi Perfil — siempre visible */}
          <MenuItem to="/employee/mi-perfil" icon={User} label="Mi Perfil" active={isActive("/employee/mi-perfil")} />

          {has(
            "system.roles",
            "config.service_categories.create","config.service_categories.edit","config.service_categories.delete",
            "config.payment_methods.create","config.payment_methods.edit","config.payment_methods.delete",
            "config.document_types.create","config.document_types.edit","config.document_types.delete"
          ) && (
            <>
              <div className="pt-3 pb-1 border-t border-gray-700 mt-2">
                <p className="px-3 text-[9px] font-bold text-gray-400 uppercase tracking-wider">Sistema</p>
              </div>
              <MenuItem to="/employee/configuracion" icon={Settings} label="Configuración" active={isActive("/employee/configuracion")} />
            </>
          )}

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

const MenuItem = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
    active ? "bg-blue-600/80 text-white font-semibold shadow-md" : "text-gray-300 hover:text-white hover:bg-white/10"
  }`}>
    {React.createElement(icon, { size: 18 })}
    <span className="text-sm">{label}</span>
  </Link>
);

export default EmployeeSidebar;
