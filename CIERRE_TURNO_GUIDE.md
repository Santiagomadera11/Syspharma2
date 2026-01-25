# 📋 Sistema de Apertura y Cierre de Turno - Guía de Uso

## 🎯 Descripción General

Se implementó un sistema completo de gestión de turnos/cajas con localStorage. El sistema controla:

- **Apertura obligatoria de turno** al acceder a SalesPage (Admin) o EmployeeSalesPage (Empleado)
- **Cierre de turno con liquidación** que calcula ventas, gastos y diferencia
- **Historial de cierres** guardado para auditoría

---

## 🔧 Componentes Principales

### 1. **turnService.js** (`src/features/sales/services/turnService.js`)

Servicio de gestión de turnos con los siguientes métodos:

#### Métodos Principales:

```javascript
// Abrir turno
turnService.openTurn(userData, montoBase);
// userData: { userId, userName }
// montoBase: número (dinero inicial)

// Obtener turno activo
turnService.getActiveTurn();
// Retorna: { turnId, userId, userName, horaApertura, montoBase, estado }

// Verificar si hay turno activo
turnService.hasActiveTurn();
// Retorna: boolean

// Cerrar turno
turnService.closeTurn(closureData);
// closureData: { montoFinal, totalVentas, totalGastos, notas }
// Guarda en historial y elimina currentTurn

// Obtener historial de cierres
turnService.getTurnsHistory();
// Retorna: Array de turnos cerrados

// Calcular saldo esperado
turnService.calculateExpectedBalance();
// Retorna: { montoBase, totalVentas, totalGastos, saldoEsperado }

// Validar operación permitida
turnService.validateOperationAllowed();
// Retorna: { valid: boolean, message: string }

// Registrar venta
turnService.recordSale(saleData);
// saleData: { userId, userName, cliente, total, metodoPago, ... }

// Registrar gasto
turnService.recordExpense(expenseData);
// expenseData: { userId, userName, concepto, monto, ... }

// Obtener ventas del usuario
turnService.getUserSales(userId);
// Retorna: Array de ventas filtradas

// Obtener gastos del usuario
turnService.getUserExpenses(userId);
// Retorna: Array de gastos filtrados
```

#### Almacenamiento en localStorage:

```javascript
// Turno activo
localStorage.getItem("syspharma_current_turn");
// { turnId, userId, userName, horaApertura, montoBase, estado: "activo" }

// Historial de cierres
localStorage.getItem("syspharma_turns_history");
// Array de turnos cerrados con: { ..., estado: "cerrado", horaCierre, montoFinal, diferencia, ... }

// Ventas registradas
localStorage.getItem("syspharma_sales");
// Array de ventas con userId

// Gastos registrados
localStorage.getItem("syspharma_expenses");
// Array de gastos con userId
```

---

### 2. **OpenShiftModal.jsx** (`src/features/sales/components/OpenShiftModal.jsx`)

Modal obligatorio que aparece al cargar:

- **SalesPage (Admin)** - Dashboard administrativo
- **EmployeeSalesPage (Empleado)** - Panel de ventas de empleado

**Características:**

- ✅ Input para "Monto Base" (dinero inicial)
- ✅ Validación de monto > 0
- ✅ No se puede cerrar sin completar
- ✅ Muestra usuario y hora actual
- ✅ Guarda turno activo en localStorage
- ✅ Callback `onShiftOpened` al completar

**Flujo:**

```
1. Componente monta → useEffect chequea turnService.getActiveTurn()
2. Si NO hay turno activo → Muestra OpenShiftModal
3. Usuario ingresa Monto Base
4. Al confirmar → turnService.openTurn() guarda en localStorage
5. Modal se cierra y se actualiza el estado del componente padre
```

---

### 3. **CloseShiftModal.jsx** (`src/features/sales/components/CloseShiftModal.jsx`)

Modal de liquidación de turno que calcula automáticamente:

- **Monto Base** (del turno abierto)
- **Total Ventas** (filtradas por userId actual)
- **Total Gastos** (filtradas por userId actual)
- **Saldo Esperado** = Monto Base + Ventas - Gastos
- **Diferencia** = Efectivo Físico - Saldo Esperado

**Características:**

- ✅ Input para "Efectivo Físico en Caja"
- ✅ Cálculo en tiempo real de diferencia
- ✅ Indicador visual: Verde (cuadra), Amarillo (sobrante), Rojo (falta)
- ✅ Campo opcional de "Notas"
- ✅ Guarda en historial de cierres
- ✅ Limpia currentTurn del localStorage
- ✅ Redirige a /login después de 2 segundos
- ✅ Muestra diferencia en toast notification

**Flujo:**

```
1. Usuario hace click en "Cerrar caja" o "Finalizar turno"
2. CloseShiftModal abre → useEffect calcula saldos con calculateExpectedBalance()
3. Usuario ingresa Efectivo Físico
4. Se calcula diferencia en tiempo real
5. Usuario confirma → turnService.closeTurn() guarda en historial
6. Se limpia currentTurn del localStorage
7. Redirige a /login (sesión finalizada)
```

---

## 📍 Integración en Vistas

### **SalesPage (Admin)** - `src/features/sales/SalesPage.jsx`

```jsx
// Estados
const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
const [currentTurn, setCurrentTurn] = useState(null);

// useEffect: Chequea turno al cargar
useEffect(() => {
  const activeTurn = turnService.getActiveTurn();
  if (activeTurn) {
    setCurrentTurn(activeTurn);
  } else {
    setShowOpenShiftModal(true); // Muestra modal obligatorio
  }
}, []);

// Handlers
const handleShiftOpened = (newTurn) => {
  setCurrentTurn(newTurn);
  setShowOpenShiftModal(false);
};

const handleShiftClosed = (closedTurn) => {
  setCurrentTurn(null);
  setShowCloseShiftModal(false);
  // Toast de confirmación
  // Redirige a /login
};

// Botón "Cerrar caja" rojo
<button onClick={() => setShowCloseShiftModal(true)}>
  <DollarSign size={16} /> Cerrar caja
</button>

// Modales
<OpenShiftModal
  isOpen={showOpenShiftModal}
  onShiftOpened={handleShiftOpened}
  user={user}
/>
<CloseShiftModal
  isOpen={showCloseShiftModal}
  onShiftClosed={handleShiftClosed}
  user={user}
/>
```

### **EmployeeSalesPage (Empleado)** - `src/features/employee/EmployeeSalesPage.jsx`

**Igual al Admin, pero:**

- ✅ Botón "Finalizar" es de color **púrpura** (no rojo)
- ✅ Mismo flujo de apertura/cierre
- ✅ Mismos cálculos y guardado

**Botón diferenciado:**

```jsx
<button
  onClick={() => setShowCloseShiftModal(true)}
  className="bg-purple-600 hover:bg-purple-700 ..."
>
  <DollarSign size={16} /> Finalizar
</button>
```

---

## ✅ Validaciones Implementadas

### 1. **Bloqueo de Ventas sin Turno Activo**

```javascript
// En handleNewSale() de SalesPage y EmployeeSalesPage
const validation = turnService.validateOperationAllowed();
if (!validation.valid) {
  setToast({ message: validation.message, type: "error" });
  return; // No navega a crear venta
}
```

### 2. **Bloqueo de Gastos sin Turno Activo**

```javascript
// En botón "Registrar gasto"
const validation = turnService.validateOperationAllowed();
if (!validation.valid) {
  setToast({ message: validation.message, type: "error" });
  return;
}
setIsRegisterExpenseModalOpen(true);
```

---

## 🔄 Flujo Completo del Día

```
┌─────────────────────────────────────────────────────┐
│ 1. EMPLEADO/ADMIN INGRESA A SISTEMA                 │
│    → Llega a SalesPage o EmployeeSalesPage          │
├─────────────────────────────────────────────────────┤
│ 2. useEffect CHEQUEA TURNO                          │
│    → turnService.getActiveTurn() retorna null       │
│    → setShowOpenShiftModal(true)                     │
├─────────────────────────────────────────────────────┤
│ 3. MODAL APERTURA APARECE (OBLIGATORIO)             │
│    → Usuario ingresa "Monto Base" (ej: $100,000)    │
│    → Confirma botón "Abrir Caja"                    │
│    → turnService.openTurn() guarda en localStorage  │
├─────────────────────────────────────────────────────┤
│ 4. TURNO ACTIVO CONFIRMADO                          │
│    → Modal se cierra                                │
│    → currentTurn actualizado en estado              │
│    → Usuario puede hacer ventas y gastos            │
├─────────────────────────────────────────────────────┤
│ 5. DURANTE EL DÍA: VENTAS & GASTOS                  │
│    → Cada venta se registra con userId              │
│    → Cada gasto se registra con userId              │
│    → turnService.calculateExpectedBalance()         │
│      suma todos los registros del usuario           │
├─────────────────────────────────────────────────────┤
│ 6. FIN DE DÍA: USUARIO HACE CLICK "CERRAR/FINALIZAR"│
│    → Modal de cierre se abre                        │
│    → Muestra cálculos automáticos                   │
│    → Usuario ingresa "Efectivo Físico en Caja"      │
├─────────────────────────────────────────────────────┤
│ 7. CIERRE CON LIQUIDACIÓN                           │
│    → Calcula diferencia (Física - Esperada)         │
│    → Guarda closedTurn en historial                 │
│    → Limpia currentTurn del localStorage            │
│    → REDIRECCIÓN A /login (sesión cerrada)          │
├─────────────────────────────────────────────────────┤
│ 8. HISTORIAL GUARDADO                               │
│    → Accesible en turnService.getTurnsHistory()     │
│    → Admin puede revisar diferencias de cajas       │
└─────────────────────────────────────────────────────┘
```

---

## 💾 Datos Guardados en localStorage

### Turno Activo

```json
{
  "turnId": 1642345678901,
  "userId": 2,
  "userName": "Empleado Demo",
  "horaApertura": "2026-01-24T08:00:00.000Z",
  "montoBase": 100000,
  "estado": "activo"
}
```

### Historial de Cierres (Ejemplo)

```json
[
  {
    "turnId": 1642345678901,
    "userId": 2,
    "userName": "Empleado Demo",
    "horaApertura": "2026-01-24T08:00:00.000Z",
    "horaCierre": "2026-01-24T17:30:00.000Z",
    "montoBase": 100000,
    "totalVentas": 850000,
    "totalGastos": 15000,
    "montoFinal": 935000,
    "diferencia": 0,
    "estado": "cerrado",
    "notas": "Día normal, todo cuadró"
  }
]
```

---

## 🚀 Próximos Pasos (Recomendaciones)

1. **Integración con Backend Real**
   - Reemplazar localStorage con API calls
   - Validar turnos en servidor
   - Auditar cierres en base de datos

2. **Reportes de Cierres**
   - Crear vista Admin para revisar cierres del día
   - Mostrar diferencias por usuario
   - Exportar a PDF

3. **Recuperación de Turno**
   - Si el usuario se desconecta, permitir "retomar turno"
   - Registrar último cierre limpio antes de crash

4. **Permisos Admin**
   - Permitir que Admin abra/cierre turnos de empleados
   - Forzar cierre si hay inactividad

---

## ❓ Preguntas Frecuentes

**P: ¿Qué pasa si el usuario cierra el navegador sin cerrar turno?**
R: El turno sigue activo en localStorage. Al reingresar, se detecta y puede continuar o cerrar.

**P: ¿Cómo se resetean los turnos para un nuevo día?**
R: Se puede agregar un cron job o método manual que limpie currentTurn si la fecha cambió.

**P: ¿Se puede editar un cierre guardado?**
R: No, se guardan solo como lectura en historial. Para editar, hay que implementar nueva lógica.

**P: ¿Los gastos se filtran automáticamente por usuario?**
R: Sí, en calculateExpectedBalance() se usan getUserExpenses(userId) y getUserSales(userId).

---

**Última actualización:** 24 Enero 2026  
**Versión:** 1.0
