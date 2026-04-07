import axios from "axios";

const API_URL = "http://localhost:5055/api/Gasto";

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("syspharma_token")}` },
});

export const expensesService = {
  getAll: async () => {
    try {
      const res = await axios.get(API_URL, getAuthHeaders());
      return Array.isArray(res.data) ? res.data : [];
    } catch (error) {
      console.error("Error obteniendo gastos:", error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
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

      const res = await axios.post(API_URL, payload, getAuthHeaders());
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

      const res = await axios.put(API_URL, payload, getAuthHeaders());
      return res.data;
    } catch (error) {
      console.error("Error actualizando gasto:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
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
      const res = await axios.get(`${API_URL}/turno/${turnoId}`, getAuthHeaders());
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
