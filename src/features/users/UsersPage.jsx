import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Info,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { permissionService } from "../settings/permissionService";
import { userService } from "./services/userService";
// IMPORTAMOS EL MODAL
import { UserFormModal } from "./components/UserFormModal";
import UserDetailModal from "./components/UserDetailModal";
import { rolesService } from "../settings/rolesService";
import { useMemo } from "react";
import { StatusNotification } from "/src/shared/ui/StatusNotification";
import { ConfirmDialog } from "../../shared/ui/ConfirmDialog.jsx";

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const user = JSON.parse(localStorage.getItem("syspharma_user") || "{}");
  const canCreateUser = permissionService.hasPerm(user.rol, "users.create");
  const canEditUser = permissionService.hasPerm(user.rol, "users.edit");
  const canDeleteUser = permissionService.hasPerm(user.rol, "users.delete");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // --- ESTADOS PARA EL MODAL Y EDICIÓN ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // Guardará el usuario que vamos a editar
  // detalle
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);

  // --- ESTADO PARA NOTIFICACIONES ---
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });
  const [confirmStatus, setConfirmStatus] = useState({ show: false, user: null });

  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  const [rolesList, setRolesList] = useState(rolesService.getAll());

  useEffect(() => {
    loadUsers();
    const onRolesChanged = () => {
      setRolesList(rolesService.getAll());
      loadUsers();
    };
    window.addEventListener("rolesChanged", onRolesChanged);
    return () => window.removeEventListener("rolesChanged", onRolesChanged);
  }, []);

  const loadUsers = () => {
    setUsers(userService.getAll());
  };

  // ABRIR MODAL PARA CREAR
  const handleOpenCreate = () => {
    setEditingUser(null); // Limpiamos edición
    setIsModalOpen(true);
  };

  // ABRIR MODAL PARA EDITAR
  const handleOpenEdit = (user) => {
    setEditingUser(user); // Pasamos el usuario al modal
    setIsModalOpen(true);
  };

  const handleOpenDetail = (user) => {
    setDetailUser(user);
    setIsDetailOpen(true);
  };

  // GUARDAR (Función que recibe el modal)
  const handleSaveUser = (userData) => {
    // Validar documento único
    const allUsers = userService.getAll();
    const docExists = allUsers.some(
      (u) => u.documento === userData.documento && u.id !== editingUser?.id
    );
    
    if (docExists) {
      setNotification({
        message: "Ya existe un usuario con este número de documento",
        type: "error",
        duration: 3000,
      });
      return false; // Retorna false para indicar error
    }
    
    if (editingUser) {
      // Si estamos editando, llamamos a update
      const newList = userService.update({ ...editingUser, ...userData });
      setUsers(newList);
      setNotification({
        message: "Usuario editado correctamente",
        type: "success",
        duration: 3000,
      });
    } else {
      // Si es nuevo, llamamos a create
      const newList = userService.create(userData);
      setUsers(newList);
      setNotification({
        message: "Usuario creado correctamente",
        type: "success",
        duration: 3000,
      });
    }
    return true; // Retorna true si fue exitoso
  };

  const handleToggleStatus = (id) => {
    const user = users.find((u) => u.id === id);
    setConfirmStatus({ show: true, user });
  };

  const confirmToggleStatus = () => {
    if (confirmStatus.user) {
      const updatedList = userService.toggleStatus(confirmStatus.user.id);
      setUsers(updatedList);
      const newStatus = !confirmStatus.user.estado;
      setNotification({
        message: `${confirmStatus.user.nombre} ahora está ${newStatus ? "Activo" : "Inactivo"}`,
        type: newStatus ? "success" : "warning",
        duration: 3000,
      });
    }
    setConfirmStatus({ show: false, user: null });
  };

  const handleDelete = (id) => {
    setConfirmDelete({ show: true, id });
  };

  const confirmDeleteUser = () => {
    const id = confirmDelete.id;
    const updatedList = userService.delete(id);
    setUsers(updatedList);
    setNotification({
      message: "Usuario eliminado correctamente",
      type: "success",
      duration: 3000,
    });
    setConfirmDelete({ show: false, id: null });
  };

  const handleUpdateUser = (userData) => {
    const updated = userService.update(userData);
    setUsers(updated);
    setDetailUser(userData);
    setIsDetailOpen(false);
  };

  // ... (El resto de la lógica de filtros y paginación sigue igual) ...
  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase().trim();
    const estadoTexto = user.estado ? "activo" : "inactivo";
    // status filter
    if (filterStatus === "active" && !user.estado) return false;
    if (filterStatus === "inactive" && user.estado) return false;

    if (!term) return true;

    // split into words so "juan admin" matches a user named Juan with rol Administrador
    const terms = term.split(/\s+/);

    return terms.every((t) => {
      return (
        (user.nombre && user.nombre.toLowerCase().includes(t)) ||
        (user.email && user.email.toLowerCase().includes(t)) ||
        (user.rol && user.rol.toLowerCase().includes(t)) ||
        (user.documento && user.documento.toLowerCase().includes(t)) ||
        estadoTexto.includes(t)
      );
    });
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  // map role name -> color hex
  const roleColorMap = useMemo(() => {
    const map = {};
    (rolesList || []).forEach((r) => {
      if (r && r.name) map[(r.name || "").toLowerCase()] = r.color || r.color;
    });
    return map;
  }, [rolesList]);

  const getContrastColor = (hex) => {
    if (!hex) return "#000";
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000" : "#fff";
  };

  const hexToRgba = (hex, alpha = 1) => {
    if (!hex) return `rgba(0,0,0,${alpha})`;
    const c = hex.replace("#", "");
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="h-full flex flex-col gap-3 font-sans">
      {/* 1. Encabezado */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Usuarios</h1>
          <p className="text-gray-500 text-xs">
            Gestión de personal y clientes
          </p>
        </div>

        {/* BOTÓN NUEVO CONECTADO */}
        {canCreateUser && (
          <button
            onClick={handleOpenCreate}
            className="bg-[#34D399] hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-bold shadow-sm text-xs flex items-center gap-1.5 transition-all"
          >
            <Plus size={16} />
            Nuevo
          </button>
        )}
      </div>

      {/* 2. Buscador + filtro */}
      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-300 text-xs bg-gray-50 focus:bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-xs"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Tabla */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
        <div className="overflow-auto custom-scrollbar no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#5D9C96] text-white text-xs uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-3 py-3 font-semibold">ID</th>
                <th className="px-3 py-3 font-semibold">Usuario</th>
                <th className="px-3 py-3 font-semibold">Email</th>
                <th className="px-3 py-3 font-semibold">Rol</th>
                <th className="px-3 py-3 font-semibold">Documento</th>
                <th className="px-3 py-3 font-semibold text-center">Estado</th>
                <th className="px-3 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {displayedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-3 py-2.5 text-xs font-mono">{user.id}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                        <img
                          src={user.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="font-bold text-gray-700 truncate max-w-[140px]">
                        {user.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500">{user.email}</td>
                  <td className="px-3 py-2.5">
                    {(() => {
                      const col = roleColorMap[(user.rol || "").toLowerCase()];
                      if (col) {
                        const text = col; // use the chosen color for text
                        const bg = hexToRgba(col, 0.12);
                        const border = hexToRgba(col, 0.18);
                        return (
                          <span
                            style={{
                              backgroundColor: bg,
                              color: text,
                              border: `1px solid ${border}`,
                            }}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                          >
                            {user.rol}
                          </span>
                        );
                      }
                      return (
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border 
                      ${
                        user.rol === "Administrador"
                          ? "bg-purple-50 text-purple-600 border-purple-100"
                          : ""
                      }
                      ${
                        user.rol === "Empleado"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : ""
                      }
                      ${
                        user.rol === "Cliente"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : ""
                      }
                    `}
                        >
                          {user.rol}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 font-mono">
                    {user.documento || "---"}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`relative w-8 h-4 rounded-full transition-colors duration-200 focus:outline-none ${
                        user.estado ? "bg-primary-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full shadow transition-transform duration-200 ${
                          user.estado ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenDetail(user)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded-md border border-blue-200"
                      >
                        <Info size={14} />
                      </button>

                      {/* BOTÓN EDITAR CONECTADO */}
                      {canEditUser && (
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-1.5 rounded-md border border-emerald-200"
                        >
                          <Edit size={14} />
                        </button>
                      )}

                      {canDeleteUser && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-md border border-red-200"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Paginación (Igual que antes) */}
        {filteredUsers.length > 0 && (
          <div className="border-t border-gray-100 p-2.5 bg-gray-50 flex items-center justify-between flex-shrink-0">
            {/* ... controles de paginación ... */}
            <span className="text-[10px] text-gray-500 font-medium">
              Mostrando página {currentPage + 1} de {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => currentPage > 0 && setCurrentPage((p) => p - 1)}
                disabled={currentPage === 0}
                className="p-1 rounded bg-white border border-gray-200"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() =>
                  currentPage < totalPages - 1 && setCurrentPage((p) => p + 1)
                }
                disabled={currentPage === totalPages - 1}
                className="p-1 rounded bg-white border border-gray-200"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* --- AQUÍ RENDERIZAMOS EL MODAL --- */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        userToEdit={editingUser}
      />
      <UserDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        user={detailUser}
        onUpdate={handleUpdateUser}
      />

      {/* --- NOTIFICACIÓN DE ESTADO --- */}
      {notification && (
        <StatusNotification
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={() => setNotification(null)}
        />
      )}

      {/* --- MODAL CONFIRMAR ELIMINACIÓN --- */}
      <ConfirmDialog
        open={confirmDelete.show}
        title="Confirmar eliminación"
        message="¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer."
        onCancel={() => setConfirmDelete({ show: false, id: null })}
        onConfirm={confirmDeleteUser}
        confirmText="Eliminar"
        cancelText="Cancelar"
        danger
      />

      {/* --- MODAL CONFIRMAR CAMBIO DE ESTADO --- */}
      <ConfirmDialog
        open={confirmStatus.show}
        title="Cambiar estado de usuario"
        message={
          confirmStatus.user
            ? `¿Deseas poner al usuario ${confirmStatus.user.estado ? "inactivo" : "activo"}?`
            : "¿Deseas cambiar el estado del usuario?"
        }
        onCancel={() => setConfirmStatus({ show: false, user: null })}
        onConfirm={confirmToggleStatus}
        confirmText={!confirmStatus.user?.estado ? "Activar" : "Inactivar"}
        cancelText="Cancelar"
        danger
      />
    </div>
  );
};
