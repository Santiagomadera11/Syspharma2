// Gestión de Turnos/Cajas
const TURN_KEY = "syspharma_current_turn";
const TURNS_HISTORY_KEY = "syspharma_turns_history";

export const turnService = {
  /**
   * Abre un nuevo turno/caja
   * @param {Object} userData - { userId, userName }
   * @param {number} montoBase - Monto inicial en la caja
   * @returns {Object} Turno creado
   */
  openTurn: (userData, montoBase) => {
    if (!userData?.userId || !userData?.userName) {
      throw new Error("Datos de usuario inválidos");
    }
    if (montoBase === undefined || montoBase === null || montoBase < 0) {
      throw new Error("Monto base debe ser válido");
    }

    // Verificar que no exista un turno activo
    const existingTurn = turnService.getActiveTurn();
    if (existingTurn) {
      throw new Error("Ya existe un turno activo. Ciérralo primero.");
    }

    const newTurn = {
      turnId: Date.now(),
      userId: userData.userId,
      userName: userData.userName,
      horaApertura: new Date().toISOString(),
      montoBase: parseFloat(montoBase),
      estado: "activo",
    };

    localStorage.setItem(TURN_KEY, JSON.stringify(newTurn));
    return newTurn;
  },

  /**
   * Obtiene el turno activo actual
   * @returns {Object|null} Turno activo o null
   */
  getActiveTurn: () => {
    const turnData = localStorage.getItem(TURN_KEY);
    if (!turnData) return null;

    try {
      const turn = JSON.parse(turnData);
      return turn.estado === "activo" ? turn : null;
    } catch (error) {
      console.error("Error al parsear turno:", error);
      return null;
    }
  },

  /**
   * Verifica si existe un turno activo
   * @returns {boolean}
   */
  hasActiveTurn: () => {
    return turnService.getActiveTurn() !== null;
  },

  /**
   * Cierra el turno actual y lo guarda en historial
   * @param {Object} closureData - { montoFinal, totalVentas, totalGastos, etc }
   * @returns {Object} Turno cerrado
   */
  closeTurn: (closureData = {}) => {
    const turn = turnService.getActiveTurn();
    if (!turn) {
      throw new Error("No hay turno activo para cerrar");
    }

    // Contar ventas y gastos del usuario
    const userSales = turnService.getUserSales(turn.userId);
    const userExpenses = turnService.getUserExpenses(turn.userId);

    const closedTurn = {
      ...turn,
      estado: "cerrado",
      horaCierre: new Date().toISOString(),
      montoFinal: closureData.montoFinal || 0,
      totalVentas: closureData.totalVentas || 0,
      totalGastos: closureData.totalGastos || 0,
      userSalesCount: userSales.length,
      userExpensesCount: userExpenses.length,
      diferencia: closureData.diferencia || 0,
      notas: closureData.notas || "",
    };

    // Guardar en historial
    const history = turnService.getTurnsHistory();
    const newHistory = [...history, closedTurn];
    localStorage.setItem(TURNS_HISTORY_KEY, JSON.stringify(newHistory));

    // Eliminar turno activo
    localStorage.removeItem(TURN_KEY);

    return closedTurn;
  },

  /**
   * Obtiene el historial de turnos cerrados
   * @returns {Array} Lista de turnos cerrados
   */
  getTurnsHistory: () => {
    const historyData = localStorage.getItem(TURNS_HISTORY_KEY);
    if (!historyData) return [];

    try {
      return JSON.parse(historyData);
    } catch (error) {
      console.error("Error al parsear historial de turnos:", error);
      return [];
    }
  },

  /**
   * Limpia el turno actual (para resetear en desarrollo)
   */
  clearActiveTurn: () => {
    localStorage.removeItem(TURN_KEY);
  },

  /**
   * Limpia todo el historial de turnos
   */
  clearTurnsHistory: () => {
    localStorage.removeItem(TURNS_HISTORY_KEY);
  },

  /**
   * Valida si se puede realizar una operación (venta, gasto)
   * @returns {Object} { valid: boolean, message: string }
   */
  validateOperationAllowed: () => {
    const turn = turnService.getActiveTurn();
    if (!turn) {
      return {
        valid: false,
        message:
          "No hay turno activo. Debes abrir caja primero para realizar operaciones.",
      };
    }
    return { valid: true, message: "" };
  },

  /**
   * Calcula el saldo esperado al cierre de turno
   * Monto Base + Ventas - Gastos
   * @returns {Object} { saldoEsperado, montoBase, totalVentas, totalGastos }
   */
  calculateExpectedBalance: () => {
    const turn = turnService.getActiveTurn();
    if (!turn) {
      return {
        saldoEsperado: 0,
        montoBase: 0,
        totalVentas: 0,
        totalGastos: 0,
      };
    }

    const sales = turnService.getUserSales(turn.userId);
    const expenses = turnService.getUserExpenses(turn.userId);

    const totalVentas = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalGastos = expenses.reduce(
      (sum, exp) => sum + (exp.monto || 0),
      0,
    );

    return {
      montoBase: turn.montoBase,
      totalVentas: totalVentas,
      totalGastos: totalGastos,
      saldoEsperado: turn.montoBase + totalVentas - totalGastos,
    };
  },

  /**
   * Obtiene las ventas del usuario actual en localStorage
   * @param {number} userId
   * @returns {Array}
   */
  getUserSales: (userId) => {
    const sales = JSON.parse(localStorage.getItem("syspharma_sales") || "[]");
    return sales.filter((s) => s.userId === userId);
  },

  /**
   * Obtiene los gastos del usuario actual en localStorage
   * @param {number} userId
   * @returns {Array}
   */
  getUserExpenses: (userId) => {
    const expenses = JSON.parse(
      localStorage.getItem("syspharma_expenses") || "[]",
    );
    return expenses.filter((e) => e.userId === userId);
  },

  /**
   * Registra una venta (debe ser llamado desde SalesPage)
   * @param {Object} saleData - { userId, userName, cliente, total, metodoPago, etc }
   */
  recordSale: (saleData) => {
    const sales = JSON.parse(localStorage.getItem("syspharma_sales") || "[]");
    const newSale = {
      ...saleData,
      saleId: Date.now(),
      fecha: new Date().toISOString(),
    };
    sales.push(newSale);
    localStorage.setItem("syspharma_sales", JSON.stringify(sales));
    return newSale;
  },

  /**
   * Registra un gasto (debe ser llamado desde RegisterExpenseModal)
   * @param {Object} expenseData - { userId, userName, concepto, monto, etc }
   */
  recordExpense: (expenseData) => {
    const expenses = JSON.parse(
      localStorage.getItem("syspharma_expenses") || "[]",
    );
    const newExpense = {
      ...expenseData,
      expenseId: Date.now(),
      fecha: new Date().toISOString(),
    };
    expenses.push(newExpense);
    localStorage.setItem("syspharma_expenses", JSON.stringify(expenses));
    return newExpense;
  },
};
