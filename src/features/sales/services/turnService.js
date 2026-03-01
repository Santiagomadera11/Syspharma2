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
      // Distancia si es del mismo usuario o de otro (detalle de seguridad)
      if (existingTurn.userId === userData.userId) {
        throw new Error(
          "Ya tienes un turno abierto. No puedes abrir otro hasta cerrarlo.",
        );
      } else {
        throw new Error(
          `Hay un turno abierto por ${existingTurn.userName}. Debes esperar a que cierre o llamar al Administrador.`,
        );
      }
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

    // Contar servicios (ventas con categoría 'servicio')
    const cantidadServicios = userSales.filter(
      (s) => s.categoria === "servicio",
    ).length;

    // Calcular resumen para dashboard
    const resumen = {
      ventas: closureData.totalVentas || 0,
      servicios: cantidadServicios,
      erroresCaja:
        closureData.diferencia !== 0 ? Math.abs(closureData.diferencia) : 0,
    };

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
      resumen: resumen, // Nuevo: resumen para dashboard
    };

    // Guardar en historial
    const history = turnService.getTurnsHistory();
    const newHistory = [...history, closedTurn];
    localStorage.setItem(TURNS_HISTORY_KEY, JSON.stringify(newHistory));

    // Eliminar turno activo
    localStorage.removeItem(TURN_KEY);

    // Dispara evento global para actualizar en toda la app
    window.dispatchEvent(
      new CustomEvent("turn:closed", { detail: closedTurn }),
    );

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
   * Obtiene TODOS los turnos (activos + cerrados) para Admin
   * @returns {Array} Lista combinada de turnos
   */
  getAllTurnsForAdmin: () => {
    const allTurns = [];

    // Agregar turno activo si existe
    const activeTurn = turnService.getActiveTurn();
    if (activeTurn) {
      allTurns.push({
        ...activeTurn,
        estado: "activo",
        horaCierre: null, // No tiene fecha de cierre aún
      });
    }

    // Agregar todos los turnos cerrados
    const closedTurns = turnService.getTurnsHistory();
    allTurns.push(...closedTurns);

    return allTurns;
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
   * Si el usuario es Cliente, SIEMPRE permite (no necesita turno)
   * Si es Empleado/Admin, requiere turno activo
   * @param {Object} user - Usuario actual { rol, email, id }
   * @returns {Object} { valid: boolean, message: string }
   */
  validateOperationAllowed: (user) => {
    // Si es Cliente, no necesita validación de turno
    if (user?.rol === "Cliente") {
      return { valid: true, message: "" };
    }

    // Para Empleado/Admin, validar turno activo
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
   * @returns {Object} { saldoEsperado, montoBase, totalVentas, totalGastos, ventasProductos, ventasServicios }
   */
  calculateExpectedBalance: () => {
    const turn = turnService.getActiveTurn();
    if (!turn) {
      return {
        saldoEsperado: 0,
        montoBase: 0,
        totalVentas: 0,
        totalGastos: 0,
        ventasProductos: 0,
        ventasServicios: 0,
      };
    }

    const sales = turnService.getUserSales(turn.userId);
    const expenses = turnService.getUserExpenses(turn.userId);

    // Desglose por categoría
    let ventasProductos = 0;
    let ventasServicios = 0;

    sales.forEach((sale) => {
      const monto = sale.monto || sale.total || 0;
      if (sale.categoria === "servicio") {
        ventasServicios += monto;
      } else {
        ventasProductos += monto;
      }
    });

    const totalVentas = ventasProductos + ventasServicios;
    const totalGastos = expenses.reduce(
      (sum, exp) => sum + (exp.monto || 0),
      0,
    );

    return {
      montoBase: turn.montoBase,
      totalVentas: totalVentas,
      ventasProductos: ventasProductos,
      ventasServicios: ventasServicios,
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
   * Registra una venta (debe ser llamado desde SalesPage o EmployeeServicesPage)
   * @param {Object} saleData - { userId, userName, cliente, total, monto, metodoPago, tipo, categoria, descripcion, etc }
   * categoria puede ser 'producto' o 'servicio'
   */
  recordSale: (saleData) => {
    const sales = JSON.parse(localStorage.getItem("syspharma_sales") || "[]");
    const newSale = {
      ...saleData,
      saleId: Date.now(),
      fecha: new Date().toISOString(),
      categoria: saleData.categoria || "producto", // Default a 'producto' si no se especifica
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

  /**
   * Obtiene todas las citas/servicios registrados
   * @returns {Array}
   */
  getAllServices: () => {
    const services = JSON.parse(
      localStorage.getItem("syspharma_services") || "[]",
    );
    return services;
  },

  /**
   * Registra un servicio médico (cita completada)
   * @param {Object} serviceData - { medicoId, nombreMedico, paciente, monto, estado, fecha, etc }
   * @returns {Object}
   */
  recordMedicalService: (serviceData) => {
    const services = turnService.getAllServices();
    const newService = {
      ...serviceData,
      serviceId: Date.now(),
      fecha: new Date().toISOString(),
      tipo: "servicio_medico",
    };
    services.push(newService);
    localStorage.setItem("syspharma_services", JSON.stringify(services));
    return newService;
  },

  /**
   * Obtiene servicios por médico
   * @param {string} medicoId
   * @returns {Array}
   */
  getServicesByMedico: (medicoId) => {
    const services = turnService.getAllServices();
    return services.filter((s) => s.medicoId === medicoId);
  },

  /**
   * Obtiene resumen de empleados para dashboard de rendimiento
   * Summa ventas y servicios de cada empleado
   * @returns {Array} Array de empleados con resumen
   */
  getEmployeesSummary: () => {
    const history = turnService.getTurnsHistory();
    const employeesMap = new Map();

    history.forEach((turn) => {
      if (!employeesMap.has(turn.userId)) {
        employeesMap.set(turn.userId, {
          userId: turn.userId,
          userName: turn.userName,
          totalVentas: 0,
          totalServicios: 0,
          totalTurnos: 0,
          turnos: [],
        });
      }

      const employee = employeesMap.get(turn.userId);
      employee.totalVentas += turn.resumen?.ventas || turn.totalVentas || 0;
      employee.totalServicios += turn.resumen?.servicios || 0;
      employee.totalTurnos += 1;
      employee.turnos.push(turn);
    });

    return Array.from(employeesMap.values());
  },

  /**
   * Obtiene resumen de médicos para dashboard
   * @returns {Array} Array de médicos con cantidad de servicios e ingresos
   */
  getMedicosSummary: () => {
    const services = turnService.getAllServices();
    const medicosMap = new Map();

    services.forEach((service) => {
      if (!service.medicoId) return; // Saltar si no tiene medicoId

      if (!medicosMap.has(service.medicoId)) {
        medicosMap.set(service.medicoId, {
          medicoId: service.medicoId,
          nombreMedico: service.nombreMedico || "Sin nombre",
          totalServicios: 0,
          totalIngresos: 0,
        });
      }

      const medico = medicosMap.get(service.medicoId);
      medico.totalServicios += 1;
      medico.totalIngresos += service.monto || service.costo || 0;
    });

    return Array.from(medicosMap.values()).sort(
      (a, b) => b.totalServicios - a.totalServicios,
    );
  },

  /**
   * Cierra el turno y limpia la sesión (proceso atómico de seguridad)
   * Debe ser llamado desde el logout para asegurar que cierre de turno y cierre de sesión sean un solo proceso
   * @param {Object} closureData - { montoFinal, totalVentas, totalGastos, diferencia, notas }
   */
  closeTurnAndLogout: (closureData = {}) => {
    try {
      const turn = turnService.getActiveTurn();
      if (turn) {
        turnService.closeTurn(closureData);
      }
      localStorage.removeItem("syspharma_user");
      return { success: true, message: "Turno cerrado y sesión terminada" };
    } catch (error) {
      console.error("Error en closeTurnAndLogout:", error);
      localStorage.removeItem("syspharma_user");
      return { success: false, message: error.message };
    }
  },
};
