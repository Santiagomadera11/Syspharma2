import React, { useState, useEffect } from 'react';
import { Search, Plus, Info, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { userService } from './services/userService';
// IMPORTAMOS EL MODAL
import { UserFormModal } from './components/UserFormModal';

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // --- ESTADOS PARA EL MODAL Y EDICIÓN ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // Guardará el usuario que vamos a editar

  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 7;

  useEffect(() => {
    loadUsers();
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

  // GUARDAR (Función que recibe el modal)
  const handleSaveUser = (userData) => {
    if (editingUser) {
      // Si estamos editando, llamamos a update
      const newList = userService.update({ ...editingUser, ...userData });
      setUsers(newList);
    } else {
      // Si es nuevo, llamamos a create
      const newList = userService.create(userData);
      setUsers(newList);
    }
  };

  const handleToggleStatus = (id) => {
    const updatedList = userService.toggleStatus(id);
    setUsers(updatedList);
  };

  const handleDelete = (id) => {
    if(window.confirm("¿Eliminar usuario?")) {
      const updatedList = userService.delete(id);
      setUsers(updatedList);
    }
  };

  // ... (El resto de la lógica de filtros y paginación sigue igual) ...
  const filteredUsers = users.filter(user => {
    const term = searchTerm.toLowerCase();
    const estadoTexto = user.estado ? "activo" : "inactivo";
    return (
      user.nombre.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.rol.toLowerCase().includes(term) ||
      (user.documento && user.documento.toLowerCase().includes(term)) ||
      estadoTexto.includes(term)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);

  return (
    <div className="h-full flex flex-col gap-3 font-sans">
      
      {/* 1. Encabezado */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Usuarios</h1>
          <p className="text-gray-500 text-xs">Gestión de personal y clientes</p>
        </div>
        
        {/* BOTÓN NUEVO CONECTADO */}
        <button 
          onClick={handleOpenCreate}
          className="bg-[#34D399] hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg font-bold shadow-sm text-xs flex items-center gap-1.5 transition-all"
        >
          <Plus size={16} />
          Nuevo
        </button>
      </div>

      {/* 2. Buscador */}
      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-300 text-xs bg-gray-50 focus:bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* 3. Tabla */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between">
        <div className="overflow-auto custom-scrollbar no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#5D9C96] text-white text-xs uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-semibold">Usuario</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Rol</th>
                <th className="px-4 py-3 font-semibold">Documento</th>
                <th className="px-4 py-3 font-semibold text-center">Estado</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {displayedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                         <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="font-bold text-gray-700 truncate max-w-[150px]">{user.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500">{user.email}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border 
                      ${user.rol === 'Administrador' ? 'bg-purple-50 text-purple-600 border-purple-100' : ''}
                      ${user.rol === 'Empleado' ? 'bg-blue-50 text-blue-600 border-blue-100' : ''}
                      ${user.rol === 'Cliente' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : ''}
                    `}>
                      {user.rol}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-500 font-mono">{user.documento || '---'}</td>
                  <td className="px-4 py-2.5 text-center">
                    <button 
                      onClick={() => handleToggleStatus(user.id)}
                      className={`relative w-8 h-4 rounded-full transition-colors duration-200 focus:outline-none ${user.estado ? 'bg-gray-700' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 bg-white w-3 h-3 rounded-full shadow transition-transform duration-200 ${user.estado ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="bg-blue-50 hover:bg-blue-100 text-blue-600 p-1.5 rounded-md border border-blue-200"><Info size={14} /></button>
                      
                      {/* BOTÓN EDITAR CONECTADO */}
                      <button 
                        onClick={() => handleOpenEdit(user)}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 p-1.5 rounded-md border border-emerald-200"
                      >
                        <Edit size={14} />
                      </button>
                      
                      <button onClick={() => handleDelete(user.id)} className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-md border border-red-200"><Trash2 size={14} /></button>
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
             <span className="text-[10px] text-gray-500 font-medium">Mostrando página {currentPage + 1} de {totalPages}</span>
             <div className="flex gap-2">
                <button onClick={() => currentPage > 0 && setCurrentPage(p => p - 1)} disabled={currentPage === 0} className="p-1 rounded bg-white border border-gray-200"><ChevronLeft size={14}/></button>
                <button onClick={() => currentPage < totalPages - 1 && setCurrentPage(p => p + 1)} disabled={currentPage === totalPages - 1} className="p-1 rounded bg-white border border-gray-200"><ChevronRight size={14}/></button>
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

    </div>
  );
};