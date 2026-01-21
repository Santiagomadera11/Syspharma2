const DB_KEY = "syspharma_expenses";

export const expensesService = {
  getAll: () => {
    const data = localStorage.getItem(DB_KEY);
    if (!data) {
      localStorage.setItem(DB_KEY, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      localStorage.setItem(DB_KEY, JSON.stringify([]));
      return [];
    }
  },

  create: (expenseData) => {
    const expenses = expensesService.getAll();
    const id = Date.now();
    const newExpense = {
      id,
      hora: new Date().toLocaleTimeString("es-CO"),
      fecha: new Date().toLocaleDateString("es-CO"),
      descripcion: expenseData.descripcion || "",
      monto: expenseData.monto || 0,
      categoria: expenseData.categoria || "Otro",
      ...expenseData,
    };
    const next = [newExpense, ...expenses];
    localStorage.setItem(DB_KEY, JSON.stringify(next));
    return next;
  },

  update: (expenseData) => {
    const expenses = expensesService.getAll();
    const updated = expenses.map((e) =>
      e.id === expenseData.id ? { ...e, ...expenseData } : e
    );
    localStorage.setItem(DB_KEY, JSON.stringify(updated));
    return updated;
  },

  delete: (id) => {
    const expenses = expensesService.getAll();
    const filtered = expenses.filter((e) => e.id !== id);
    localStorage.setItem(DB_KEY, JSON.stringify(filtered));
    return filtered;
  },

  getExpensesByDate: (date) => {
    const expenses = expensesService.getAll();
    return expenses.filter((e) => e.fecha === date);
  },

  getTodayExpenses: () => {
    const today = new Date().toLocaleDateString("es-CO");
    return expensesService.getExpensesByDate(today);
  },

  getTotalExpensesToday: () => {
    const expenses = expensesService.getTodayExpenses();
    return expenses.reduce((sum, e) => sum + (e.monto || 0), 0);
  },
};
