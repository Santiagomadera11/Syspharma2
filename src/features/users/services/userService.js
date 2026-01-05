const DB_KEY = 'syspharma_users_list';

const initialData = [
  { id: 1, nombre: "Carlos Administrador", email: "admin@sys.com", rol: "Administrador", documento: "DNI: 12345", estado: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos" },
  { id: 2, nombre: "María Empleada", email: "maria@sys.com", rol: "Empleado", documento: "CC: 98765", estado: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" },
  { id: 3, nombre: "Juan Cliente", email: "juan@sys.com", rol: "Cliente", documento: "TI: 45678", estado: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan" },
  { id: 4, nombre: "Ana Farmacéutica", email: "ana@sys.com", rol: "Empleado", documento: "CC: 11223", estado: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana" },
  { id: 5, nombre: "Pedro Logística", email: "pedro@sys.com", rol: "Empleado", documento: "CC: 33445", estado: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro" },
  { id: 6, nombre: "Luisa Cliente", email: "luisa@sys.com", rol: "Cliente", documento: "CC: 55667", estado: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luisa" },
  { id: 7, nombre: "Jorge Admin", email: "jorge@sys.com", rol: "Administrador", documento: "CC: 77889", estado: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jorge" },
  { id: 8, nombre: "Sofía Ventas", email: "sofia@sys.com", rol: "Empleado", documento: "CC: 99000", estado: false, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia" },
  { id: 9, nombre: "Miguel Cliente", email: "miguel@sys.com", rol: "Cliente", documento: "CC: 12121", estado: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel" },
];

export const userService = {
  getAll: () => {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      localStorage.setItem(DB_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(data);
  },

  toggleStatus: (id) => {
    const users = userService.getAll();
    const updatedUsers = users.map(user => user.id === id ? { ...user, estado: !user.estado } : user);
    localStorage.setItem(DB_KEY, JSON.stringify(updatedUsers));
    return updatedUsers;
  },

  delete: (id) => {
    const users = userService.getAll();
    const filtered = users.filter(user => user.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
    return filtered;
  }
};