// Simple authentication service using localStorage
const USERS_KEY = "syspharma_users";

const defaultAdmin = {
  id: 1,
  nombre: "Admin Syspharma",
  email: "admin@syspharma.com",
  rol: "Administrador",
  password: "admin123",
  estado: true,
  avatar: null,
};

const defaultEmployee = {
  id: 2,
  nombre: "Empleado Demo",
  email: "empleado@syspharma.com",
  rol: "Empleado",
  password: "empleado123",
  estado: true,
  avatar: null,
};

const defaultClient = {
  id: 3,
  nombre: "Cliente Demo",
  email: "cliente@syspharma.com",
  rol: "Cliente",
  password: "cliente123",
  estado: true,
  avatar: null,
};

function ensureDefaultUsersExist() {
  const data = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  let updated = [...data];

  // Verificar admin
  if (!updated.some((u) => u.email === defaultAdmin.email)) {
    updated = [defaultAdmin, ...updated];
  }

  // Verificar empleado
  if (!updated.some((u) => u.email === defaultEmployee.email)) {
    updated = [defaultEmployee, ...updated];
  }

  // Verificar cliente
  if (!updated.some((u) => u.email === defaultClient.email)) {
    updated = [defaultClient, ...updated];
  }

  if (updated.length !== data.length) {
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
  }
}

export const authService = {
  init: () => ensureDefaultUsersExist(),

  login: (email, password) => {
    ensureDefaultUsersExist();
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) return null;
    const safe = {
      id: found.id,
      nombre: found.nombre,
      email: found.email,
      rol: found.rol,
      avatar: found.avatar,
    };
    localStorage.setItem("syspharma_user", JSON.stringify(safe));
    return safe;
  },

  logout: () => {
    localStorage.removeItem("syspharma_user");
  },

  getCurrentUser: () => {
    const u = localStorage.getItem("syspharma_user");
    return u ? JSON.parse(u) : null;
  },
};
