# 📋 Sistema de Apertura de Turno - Guía de Uso

## 📌 Descripción General

Se ha implementado un sistema obligatorio de **Apertura de Turno/Caja** que debe completarse antes de realizar cualquier operación de ventas o gastos en el sistema.

---

## 🔧 Componentes Creados

### 1. **turnService.js**

**Ubicación:** `src/features/sales/services/turnService.js`

Servicio centralizado para gestionar turnos en localStorage.

**Métodos principales:**

```javascript
// Abre un nuevo turno
turnService.openTurn(userData, montoBase);
// Returns: { turnId, userId, userName, horaApertura, montoBase, estado }

// Obtiene turno activo
turnService.getActiveTurn();
// Returns: objeto turno o null

// Verifica si hay turno activo
turnService.hasActiveTurn();
// Returns: boolean

// Cierra el turno
turnService.closeTurn(closureData);
// Returns: turno cerrado con datos de cierre

// Valida si se puede realizar operación
turnService.validateOperationAllowed();
// Returns: { valid: boolean, message: string }

// Obtiene historial de turnos cerrados
turnService.getTurnsHistory();
// Returns: Array de turnos cerrados
```

---

### 2. **OpenShiftModal.jsx**

**Ubicación:** `src/features/sales/components/OpenShiftModal.jsx`

Modal bonito e intuitivo para abrir caja al inicio del día.

**Características:**

- ✅ Entrada obligatoria del **Monto Base** (dinero inicial para vueltas)
- ✅ Modal no se puede cerrar sin completar
- ✅ Validaciones de entrada (monto válido, positivo)
- ✅ Muestra datos del usuario autenticado
- ✅ Overlay oscuro que bloquea interacción
- ✅ Mensajes de error claros

**Props:**

```jsx
<OpenShiftModal
  isOpen={boolean}                 // Controla visibilidad
  onShiftOpened={function}         // Callback cuando se abre turno
  user={{ id, nombre }}            // Datos usuario actual
/>
```

---

## 🔌 Integraciones Implementadas

### 1. **DashboardPage.jsx**

- ✅ Verifica turno al cargar
- ✅ Muestra modal si no existe turno activo
- ✅ Permite acceso solo con turno activo

### 2. **SalesPage.jsx** (Admin)

- ✅ Verifica turno al cargar
- ✅ Bloquea botón "Nueva Venta" si no hay turno
- ✅ Bloquea "Registrar Gasto" si no hay turno
- ✅ Muestra toast con advertencia

### 3. **EmployeeSalesPage.jsx** (Empleado)

- ✅ Verifica turno al cargar
- ✅ Bloquea "Nueva Venta" sin turno activo
- ✅ Validación en tiempo real

---

## 💾 Estructura de Datos

### Turno Activo (localStorage key: `syspharma_current_turn`)

```json
{
  "turnId": 1704067200000,
  "userId": 1,
  "userName": "Admin Syspharma",
  "horaApertura": "2026-01-24T10:30:00.000Z",
  "montoBase": 500000,
  "estado": "activo"
}
```

### Historial de Turnos (localStorage key: `syspharma_turns_history`)

```json
[
  {
    "turnId": 1704067200000,
    "userId": 1,
    "userName": "Admin Syspharma",
    "horaApertura": "2026-01-24T10:30:00.000Z",
    "horaCierre": "2026-01-24T18:45:00.000Z",
    "montoBase": 500000,
    "montoFinal": 625000,
    "totalVentas": 125000,
    "totalGastos": 0,
    "diferencia": 125000,
    "estado": "cerrado",
    "notas": ""
  }
]
```

---

## 🚀 Flujo de Uso

### 1️⃣ Usuario Inicia Sesión

- Login normal en `/login`
- Se redirige según rol (admin, employee, client)

### 2️⃣ Acceso a Dashboard o Ventas

- Sistema verifica si existe turno activo
- ❌ Si NO existe → Muestra modal de apertura (OBLIGATORIO)
- ✅ Si SÍ existe → Acceso normal

### 3️⃣ Completar Apertura de Turno

- Usuario ingresa **Monto Base** (ej: $500,000)
- Click en "Abrir Caja"
- Sistema crea registro en localStorage
- Modal cierra automáticamente
- Acceso desbloqueado

### 4️⃣ Durante el Día

- Todas las operaciones validadas
- Si intenta venta/gasto sin turno → Toast de error
- Turno persiste en navegación

### 5️⃣ Cierre de Turno (Próxima implementación)

- Botón "Cerrar Caja" guardará:
  - Monto final en caja
  - Total de ventas
  - Total de gastos
  - Diferencia/discrepancia
- Turno se mueve a historial
- localStorage se limpia para nuevo día

---

## 🛡️ Validaciones

### En OpenShiftModal:

- ✅ Monto Base es obligatorio
- ✅ Monto debe ser número positivo
- ✅ Monto debe ser ≥ 0
- ✅ No puede haber 2 turnos activos

### En SalesPage/EmployeeSalesPage:

- ✅ No se puede crear venta sin turno
- ✅ No se puede registrar gasto sin turno
- ✅ Toast notifica al usuario

---

## 🎨 Estilos & UX

**Modal:**

- Fondo overlay oscuro (70% opacidad)
- Centro de pantalla, responsive
- Colores: Azul para acciones
- Icono DollarSign para contexto visual
- No permite cerrar sin completar

**Toast Notifications:**

- Rojo para errores
- Posición z-index 70 para visibilidad
- Auto-cierre o click para cerrar

---

## 🧪 Testing / Pruebas

### Desde Developer Tools (Console)

```javascript
// Ver turno actual
JSON.parse(localStorage.getItem("syspharma_current_turn"));

// Ver historial
JSON.parse(localStorage.getItem("syspharma_turns_history"));

// Abrir turno manualmente
const { turnService } =
  await import("/src/features/sales/services/turnService.js");
turnService.openTurn({ userId: 1, userName: "Test" }, 100000);

// Cerrar turno
turnService.closeTurn({ montoFinal: 150000, totalVentas: 50000 });

// Limpiar (para resetear en desarrollo)
turnService.clearActiveTurn();
turnService.clearTurnsHistory();
```

---

## 📊 Usuarios Demo

| Email                  | Rol           | Contraseña  |
| ---------------------- | ------------- | ----------- |
| admin@syspharma.com    | Administrador | admin123    |
| empleado@syspharma.com | Empleado      | empleado123 |
| cliente@syspharma.com  | Cliente       | cliente123  |

---

## ✅ Checklist Implementado

- [x] Servicio `turnService.js` con métodos CRUD
- [x] Modal `OpenShiftModal.jsx` con UI/UX
- [x] Integración en `DashboardPage.jsx`
- [x] Integración en `SalesPage.jsx`
- [x] Integración en `EmployeeSalesPage.jsx`
- [x] Validaciones de operaciones
- [x] Toast notifications
- [x] localStorage persistence
- [x] Historial de turnos
- [x] Sin errores de compilación

---

## 🔮 Próximas Mejoras (Futuras)

1. **Cierre de Turno Completo**
   - Modal para cerrar caja con cálculos
   - Registro de diferencias/discrepancias
   - Historial visual

2. **Reportes**
   - Resumen de turnos por día/semana/mes
   - Análisis de ventas vs gastos
   - Discrepancias detectadas

3. **Auditoría**
   - Log de actividades por turno
   - Quién cerró, cuándo, con qué diferencia
   - Alertas si discrepancia > umbral

4. **Integraciones**
   - Sincronización con backend (cuando exista)
   - Multi-caja/punto de venta
   - Diferentes denominaciones de moneda

---

## 📞 Soporte

Para reportar bugs o sugerencias, contacta al equipo de desarrollo.

**Última actualización:** 24 de Enero de 2026
