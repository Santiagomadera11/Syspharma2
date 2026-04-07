import { apiClient } from "../../../shared/utils/apiClient";

const EXPENSES_ENDPOINT = "Gasto";

export const expensesService = {
  getAll: async () => {
    try {
      const res = await apiClient.get(EXPENSES_ENDPOINT);
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("Error obteniendo gastos:", error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`${EXPENSES_ENDPOINT}/${id}`);
      return res.data;
    } catch (error) {
      console.error("Error obteniendo gasto:", error);
      return null;
    }
  },

  create: async (expenseData) => {
    try {
      const currentUser = JSON.parse(sessionStorage.getItem("syspharma_user") || "{}");

      const payload = {
        turnoId: expenseData.turnoId || null,
        descripcion: expenseData.descripcion || "",
        monto: parseFloat(expenseData.monto) || 0,
        categoria: expenseData.categoria || "Otro",
        fecha: expenseData.fecha || new Date().toISOString().split("T")[0],
        notas: expenseData.notas || null,
        usuarioId: expenseData.usuarioId || currentUser.id,
      };

      const res = await apiClient.post(EXPENSES_ENDPOINT, payload);
      return res.data;
    } catch (error) {
      console.error("Error creando gasto:", error);
      throw error;
    }
  },

  update: async (expenseData) => {
    try {
      const payload = {
        id: expenseData.id,
        descripcion: expenseData.descripcion || "",
        monto: parseFloat(expenseData.monto) || 0,
        categoria: expenseData.categoria || "Otro",
        fecha: expenseData.fecha || new Date().toISOString().split("T")[0],
        notas: expenseData.notas || null,
      };

      const res = await apiClient.put(EXPENSES_ENDPOINT, payload);
      return res.data;
    } catch (error) {
      console.error("Error actualizando gasto:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await apiClient.delete(`${EXPENSES_ENDPOINT}/${id}`);
      return true;
    } catch (error) {
      console.error("Error eliminando gasto:", error);
      throw error;
    }
  },

  getExpensesByDate: async (date) => {
    try {
      const expenses = await expensesService.getAll();
      return expenses.filter((e) => {
        const expenseDate = e.fecha ? new Date(e.fecha).toLocaleDateString("es-CO") : "";
        return expenseDate === date;
      });
    } catch (error) {
      console.error("Error filtrando gastos por fecha:", error);
      return [];
    }
  },

  getExpensesByTurn: async (turnoId) => {
    try {
      const res = await apiClient.get(`${EXPENSES_ENDPOINT}/turno/${turnoId}`);
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("Error obteniendo gastos del turno:", error);
      return [];
    }
  },

  getTodayExpenses: async () => {
    try {
      const today = new Date().toLocaleDateString("es-CO");
      return await expensesService.getExpensesByDate(today);
    } catch (error) {
      console.error("Error obteniendo gastos de hoy:", error);
      return [];
    }
  },

  getTotalExpensesToday: async () => {
    try {
      const expenses = await expensesService.getTodayExpenses();
      return expenses.reduce((sum, e) => sum + (parseFloat(e.monto) || 0), 0);
    } catch (error) {
      console.error("Error calculando total de gastos:", error);
      return 0;
    }
  },
};
