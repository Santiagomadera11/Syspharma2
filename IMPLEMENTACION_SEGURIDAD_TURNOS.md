# Implementación de Seguridad del Sistema de Turnos (Shift/Cajas)

## Resumen de Cambios Realizados

### ✅ 1. Bloqueo de Botones con Validación de Turno Activo

#### **EmployeeServicesPage.jsx**

- **Estado**: Botón **"Nuevo"** (crear servicio) se deshabilita en gris cuando NO hay turno activo
- **Comportamiento**:
  - Si turno activo: Botón azul, clickeable
  - Si NO turno activo: Botón gris, deshabilitado + tooltip flotante
  - Tooltip: "Debes abrir caja para realizar esta operación"
- **Código**: Líneas 61-81 (button con `disabled={!hasActiveTurn}`)

#### **OrdersPage.jsx** (Gestión de Pedidos)

- **Estado**: Botón **"Crear pedido"** se deshabilita en gris cuando NO hay turno activo
- **Comportamiento**: Idéntico a EmployeeServicesPage
- **Código**: Líneas 137-157 (button con `disabled={!hasActiveTurn}`)

---

### ✅ 2. Validación de Turno en Servicios de Backend

#### **ordersService.js**

- Función `create()` ahora valida `turnService.validateOperationAllowed()` ANTES de crear pedido
- Si no hay turno, lanza error: `"No hay turno activo. Debes abrir caja primero..."`
- **Código**: Líneas 6-12 (helper `validateTurnActive()`), Líneas 28-34 (validación en create)

---

### ✅ 3. Flujo Atómico de Cierre de Sesión + Cierre de Turno

#### **EmployeeLayout.jsx**

- **Cambio en logout**: Ahora llama a `turnService.closeTurnAndLogout()` en lugar de solo `authService.logout()`
- **Proceso**:
  1. Cierra turno activo (si existe)
  2. Elimina sesión del usuario (`localStorage.removeItem("syspharma_user")`)
  3. Ambas acciones ocurren atomicamente
- **Código**: Línea 29 en `handleConfirmLogout()`

#### **turnService.js - Nuevo Método**

```javascript
closeTurnAndLogout: (closureData = {}) => {
  try {
    const turn = turnService.getActiveTurn();
    if (turn) {
      turnService.closeTurn(closureData); // Cierra turno
    }
    localStorage.removeItem("syspharma_user"); // Limpia sesión
    return { success: true, message: "Turno cerrado y sesión terminada" };
  } catch (error) {
    // Incluso si falla cierre de turno, limpia sesión SIEMPRE
    localStorage.removeItem("syspharma_user");
    return { success: false, message: error.message };
  }
};
```

---

### ✅ 4. Sistema de Eventos Globales para Propagación de Cambios

#### **Cómo Funciona**: Event-Driven Architecture

1. **Disparadores** (en OpenShiftModal y CloseShiftModal):
   - Al abrir turno: `window.dispatchEvent(new CustomEvent("turn:opened"))`
   - Al cerrar turno: `window.dispatchEvent(new CustomEvent("turn:closed"))`

2. **Propagador** (en EmployeeLayout):
   - Escucha `turn:opened` y `turn:closed`
   - Re-dispara como `turn:changed` a todos los oyentes

3. **Oyentes** (en EmployeeServicesPage y OrdersPage):
   - Escuchan `turn:changed`
   - Actualizan estado local: `setHasActiveTurn(turnService.hasActiveTurn())`
   - UI se actualiza automáticamente

#### **Código de Ejemplo**:

```jsx
// En EmployeeServicesPage
useEffect(() => {
  const handleTurnChange = () => {
    setHasActiveTurn(turnService.hasActiveTurn());
  };

  window.addEventListener("turn:changed", handleTurnChange);
  return () => window.removeEventListener("turn:changed", handleTurnChange);
}, []);
```

---

## Pruebas Manuales (Step-by-Step)

### **Test 1: Bloqueo de Botones**

**Pasos**:

1. Accede como **Empleado** (empleado@syspharma.com / empleado123)
2. Navega a **Servicios** o **Pedidos**
3. Observa el botón "Nuevo" / "Crear pedido"
   - **Esperado**: ✅ Botón GRIS y deshabilitado
   - **Tooltip**: "Debes abrir caja para realizar esta operación" (al pasar mouse)

**Test 2: Abrir Turno y Habilitar Botones**

1. Desde **SalesPage** o **EmployeeSalesPage**, abre el modal de **Apertura de Caja**
2. Ingresa monto base, confirma
3. Regresa a **Servicios** o **Pedidos**
4. **Esperado**: ✅ Botón AZUL y clickeable
5. Crea un servicio/pedido exitosamente

---

### **Test 2: Cierre de Sesión Seguro**

**Pasos**:

1. Con turno activo, ve a **Logout** (botón de cerrar sesión)
2. Confirma logout
3. Verifica en **DevTools > Application > LocalStorage**:
   - ✅ `syspharma_user` DEBE estar eliminado
   - ✅ `syspharma_current_turn` DEBE estar eliminado (si hay turno abierto)
4. Serás redirigido a `/` (landing page)

---

### **Test 3: Validación en Servicio de Órdenes**

**Pasos**:

1. Abre **DevTools > Console**
2. SIN turno activo, intenta crear una orden manualmente:
   ```javascript
   const {
     ordersService,
   } = require("~features/sales/orders/services/ordersService");
   ordersService.create({ cliente: "Test", total: 100 });
   ```
3. **Esperado**: ❌ Error en consola: `"No hay turno activo. Debes abrir caja primero..."`
4. Abre turno desde UI
5. Intenta nuevamente
6. **Esperado**: ✅ Orden creada exitosamente

---

## Archivos Modificados

| Archivo                    | Cambios                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `turnService.js`           | ✅ Método `closeTurnAndLogout()` agregado                                                   |
| `EmployeeLayout.jsx`       | ✅ Import turnService, listener de eventos, logout atómico                                  |
| `EmployeeServicesPage.jsx` | ✅ Estados `hasActiveTurn`, `showTurnTooltip`, listener `turn:changed`, botón deshabilitado |
| `OrdersPage.jsx`           | ✅ Estados `hasActiveTurn`, `showTurnTooltip`, listener `turn:changed`, botón deshabilitado |
| `ordersService.js`         | ✅ Helper `validateTurnActive()`, validación en `create()`                                  |
| `OpenShiftModal.jsx`       | ✅ Dispara `turn:opened` event tras apertura                                                |
| `CloseShiftModal.jsx`      | ✅ Dispara `turn:closed` event tras cierre                                                  |

---

## Flujo de Seguridad Resumido

```
┌─────────────────────────────────────────────────────────────┐
│ EMPLEADO INTENTA CREAR SERVICIO/PEDIDO                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
         ┌─────────────────────────────────┐
         │ ¿Turno Activo?                  │
         └────────┬────────────────────────┘
                  │
         ┌────────┴────────┐
         ↓                 ↓
        SÍ                 NO
        │                 │
  ┌─────▼─────┐    ┌──────▼──────┐
  │ ✅ ACTIVA │    │ ❌ GRIS    │
  │ Botón     │    │ DESHABILITADO│
  │ CLICKEABLE│    │ + Tooltip   │
  └─────┬─────┘    └─────────────┘
        │
        │ Click
        ↓
  ┌─────────────────────────────┐
  │ Valida Turno en Servicio    │
  │ (ordersService.create)      │
  └────┬─────────────────────────┘
       │
    ┌──┴──┐
    ↓     ↓
  ✅ OK  ❌ Error
    │     │
    │   Muestra error:
    │   "No hay turno activo..."
    │
    ↓
│ CREA SERVICIO/PEDIDO │
│ REGISTRA EN TURNO    │
```

---

## Próximos Pasos (Opcional)

- [ ] Admin: Validación de rol (solo abrir caja si intenta vender; no requerido para Dashboard)
- [ ] Admin: Reporte de Historial de Turnos con desglose producto/servicio
- [ ] Admin: Gráficos de ingresos por categoría
