const DB_KEY = "syspharma_users";

export const userService = {
  getAll: () => {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      // no se inicializan usuarios por defecto: empezar con lista vacía
      localStorage.setItem(DB_KEY, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      localStorage.setItem(DB_KEY, JSON.stringify([]));
      return [];
    }
  },

  toggleStatus: (id) => {
    const users = userService.getAll();
    const updatedUsers = users.map((user) =>
      user.id === id ? { ...user, estado: !user.estado } : user
    );
    localStorage.setItem(DB_KEY, JSON.stringify(updatedUsers));
    return updatedUsers;
  },

  delete: (id) => {
    const users = userService.getAll();
    const filtered = users.filter((user) => user.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
    return filtered;
  },
};

// Additional helpers: create and update
userService.create = (userData) => {
  const users = userService.getAll();
  const id = Date.now();
  const newUser = {
    id,
    nombre: userData.nombre,
    email: userData.email,
    rol: userData.rol,
    password: userData.password || "",
    documento: userData.documento,
    tipoDocumento: userData.tipoDocumento,
    telefono: userData.telefono || "",
    estado: typeof userData.estado === "boolean" ? userData.estado : true,
    avatar:
      userData.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        userData.nombre || id
      )}`,
  };
  const next = [newUser, ...users];
  localStorage.setItem(DB_KEY, JSON.stringify(next));
  return next;
};

userService.update = (userData) => {
  const users = userService.getAll();
  const updated = users.map((u) =>
    u.id === userData.id ? { ...u, ...userData } : u
  );
  localStorage.setItem(DB_KEY, JSON.stringify(updated));
  return updated;
};

userService.saveAll = (list) => {
  const arr = Array.isArray(list) ? list : [];
  localStorage.setItem(DB_KEY, JSON.stringify(arr));
  return arr;
};
