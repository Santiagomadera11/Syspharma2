const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7001/api';

const getToken = () => {
  // El token se guarda directamente en sessionStorage, no dentro del objeto user
  return sessionStorage.getItem("syspharma_token") || "";
};

const headers = () => ({
  "Content-Type": "application/json",
  "Authorization": `Bearer ${getToken()}`
});

export const expensesService = {
  // Obtener gastos de hoy (para ExpensesModal)
  getTodayExpenses: async (usuarioId = null) => {
    const url = usuarioId 
      ? `${API_URL}/gasto/today?usuarioId=${usuarioId}`
      : `${API_URL}/gasto/today`;
    
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error("Error cargando gastos de hoy");
    const data = await res.json();
    return data.data || [];
  },

  // Obtener KPIs
  getKpis: async (fecha = null) => {
    const url = fecha 
      ? `${API_URL}/gasto/kpis?fecha=${fecha.toISOString().split('T')[0]}`
      : `${API_URL}/gasto/kpis`;
    
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error("Error cargando KPIs");
    const data = await res.json();
    return data.data;
  },

  // Crear gasto
  create: async (gastoData) => {
    console.log("📤 Enviando gasto al backend:", JSON.stringify(gastoData, null, 2));
    console.log("🔑 Token:", getToken());
    
    const res = await fetch(`${API_URL}/gasto`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(gastoData)
    });
    
    const responseText = await res.text();
    console.log("📥 Respuesta del servidor:", responseText);
    
    if (!res.ok) {
      console.error("❌ Error 400:", responseText);
      throw new Error(`Error creando gasto: ${responseText}`);
    }
    
    return JSON.parse(responseText);
  },

  // Anular gasto (soft delete)
  delete: async (id) => {
    const res = await fetch(`${API_URL}/gasto/${id}/anular`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify("Gasto anulado desde caja")
    });
    if (!res.ok) throw new Error("Error anulando gasto");
    return res.json();
  },

  // Eliminar definitivo (si necesitas)
  deleteHard: async (id) => {
    const res = await fetch(`${API_URL}/gasto/${id}`, {
      method: "DELETE",
      headers: headers()
    });
    if (!res.ok) throw new Error("Error eliminando gasto");
    return res.json();
  },

  // Listar todos (para página principal)
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_URL}/gasto?${query}` : `${API_URL}/gasto`;
    
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error("Error cargando gastos");
    return res.json();
  },

  // Obtener por fecha
  getByDate: async (date) => {
    const url = `${API_URL}/gasto/fecha/${date.toISOString().split('T')[0]}`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error("Error cargando gastos");
    return res.json();
  },

  // Obtener por turno
  getByTurn: async (turnoId) => {
    const url = `${API_URL}/gasto/turno/${turnoId}`;
    const res = await fetch(url, { headers: headers() });
    if (!res.ok) throw new Error("Error cargando gastos del turno");
    return res.json();
  },

  getExpensesByDate: async (date) => {
    try {
      const data = await expensesService.getByDate(date);
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error("Error filtrando gastos por fecha:", error);
      return [];
    }
  },

  getExpensesByTurn: async (turnoId) => {
    try {
      const data = await expensesService.getByTurn(turnoId);
      return Array.isArray(data.data) ? data.data : [];
    } catch (error) {
      console.error("Error obteniendo gastos del turno:", error);
      return [];
    }
  }
};