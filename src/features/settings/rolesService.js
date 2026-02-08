const ROLES_KEY = "syspharma_roles";

export const rolesService = {
  init: () => {
    const raw = localStorage.getItem(ROLES_KEY);
    if (!raw) {
      localStorage.setItem(ROLES_KEY, JSON.stringify([]));
    }
  },

  getAll: () => {
    try {
      const raw = localStorage.getItem(ROLES_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveAll: (roles) => {
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles || []));
  },

  create: (role) => {
    const list = rolesService.getAll();
    const payload = { id: Date.now(), ...role };
    const next = [payload, ...list];
    rolesService.saveAll(next);
    return next;
  },

  update: (role) => {
    const list = rolesService.getAll();
    const next = list.map((r) => (r.id === role.id ? { ...r, ...role } : r));
    rolesService.saveAll(next);
    return next;
  },

  remove: (id) => {
    const list = rolesService.getAll();
    const next = list.filter((r) => r.id !== id);
    rolesService.saveAll(next);
    return next;
  },
};
