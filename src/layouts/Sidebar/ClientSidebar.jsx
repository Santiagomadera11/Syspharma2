import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../features/auth/authService";
import {
  LayoutGrid,
  Package,
  ShoppingBag,
  Calendar,
  User,
  Stethoscope,
  LogOut,
  X,
} from "lucide-react";

const ClientSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleConfirmLogout = () => {
    authService.logout();
    setShowConfirmLogout(false);
    navigate("/");
  };

  return (
    <>
      {/* Backdrop en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static w-60 h-screen bg-[#1B5E20] flex flex-col text-white shadow-xl z-50 flex-shrink-0 border-l border-gray-700 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Encabezado Sidebar */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-gray-700 bg-[#0D3A1C]">
          <div className="flex items-center gap-3">
            <div className="bg-green-400 p-1 rounded-md shadow-lg shadow-green-400/20">
              <Stethoscope size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-wide">SysPharma</h1>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider">
                Cliente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-0.5 px-2 custom-scrollbar">
          <MenuItem
            to="/client/catalogo"
            icon={LayoutGrid}
            label="Catálogo"
            active={isActive("/client/catalogo")}
          />

          <MenuItem
            to="/client/productos"
            icon={Package}
            label="Productos"
            active={isActive("/client/productos")}
          />

          <MenuItem
            to="/client/mis-pedidos"
            icon={ShoppingBag}
            label="Mis Pedidos"
            active={isActive("/client/mis-pedidos")}
          />

          <MenuItem
            to="/client/mis-citas"
            icon={Calendar}
            label="Mis Citas"
            active={isActive("/client/mis-citas")}
          />

          <MenuItem
            to="/client/mi-perfil"
            icon={User}
            label="Mi Perfil"
            active={isActive("/client/mi-perfil")}
          />
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700 bg-[#0D3A1C]">
          <button
            onClick={() => setShowConfirmLogout(true)}
            className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Confirm Logout Modal */}
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
    </>
  );
};

const MenuItem = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
      active
        ? "bg-green-600/80 text-white font-semibold shadow-md"
        : "text-gray-300 hover:text-white hover:bg-white/10"
    }`}
  >
    <Icon size={18} />
    <span className="text-sm">{label}</span>
  </Link>
);

export default ClientSidebar;
