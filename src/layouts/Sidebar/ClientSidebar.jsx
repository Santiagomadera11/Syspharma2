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
        <div className="border-t border-gray-700 p-3 space-y-2">
          <button
            onClick={() => setShowConfirmLogout(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-600/20 text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>

        {/* Modal de confirmación */}
        {showConfirmLogout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 shadow-2xl max-w-sm w-full mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Cerrar sesión
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                ¿Está seguro de que desea cerrar sesión?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmLogout(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
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
