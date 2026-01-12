// Simple authentication service using localStorage
const USERS_KEY = "syspharma_users";

const defaultAdmin = {
  id: 1,
  nombre: "Admin Syspharma",
  email: "admin@syspharma.com",
  role: "admin",
  password: "admin123",
  estado: true,
  avatar: null,
};

function ensureAdminExists() {
  const data = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const hasAdmin = data.some((u) => u.email === defaultAdmin.email);
  if (!hasAdmin) {
    const newList = [defaultAdmin, ...data];
    localStorage.setItem(USERS_KEY, JSON.stringify(newList));
  }
}

export const authService = {
  init: () => ensureAdminExists(),

  login: (email, password) => {
    ensureAdminExists();
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    const found = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) return null;
    const safe = {
      id: found.id,
      nombre: found.nombre,
      email: found.email,
      role: found.role,
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
