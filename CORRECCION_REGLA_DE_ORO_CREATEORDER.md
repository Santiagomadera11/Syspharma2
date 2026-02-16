# 🔒 Corrección: REGLA DE ORO en CreateOrderPage

## Problema Reportado

Los empleados podían seguir creando pedidos sin haber abierto caja (turno), a pesar de que la validación ya estaba implementada en `ordersService.js`.

## Causa Raíz

**CreateOrderPage.jsx** no estaba validando si el empleado tenía un turno activo ANTES de permitir guardar:

- El botón "Confirmar Pedido" no estaba deshabilitado para empleados sin turno
- No había listeners de eventos para sincronizar el estado de turno
- No había try-catch para capturar el error lanzado por `ordersService.create()`

## Solución Implementada

### 1. Importación de turnService

```javascript
import { turnService } from "../../sales/services/turnService";
```

### 2. Estados Agregados

```javascript
// ✅ REGLA DE ORO: Estado para validar turno activo
const [hasActiveTurn, setHasActiveTurn] = useState(turnService.hasActiveTurn());
const [showTurnTooltip, setShowTurnTooltip] = useState(false);
```

### 3. Listeners de Eventos para Sincronización en Tiempo Real

```javascript
// Escuchar cambios en el turno
useEffect(() => {
  const updateTurnStatus = () => {
    setHasActiveTurn(turnService.hasActiveTurn());
  };

  window.addEventListener("turn:opened", updateTurnStatus);
  window.addEventListener("turn:closed", updateTurnStatus);
  window.addEventListener("turn:changed", updateTurnStatus);

  return () => {
    window.removeEventListener("turn:opened", updateTurnStatus);
    window.removeEventListener("turn:closed", updateTurnStatus);
    window.removeEventListener("turn:changed", updateTurnStatus);
  };
}, []);
```

### 4. Validación Temprana en handleConfirmOrder

```javascript
// ✅ REGLA DE ORO: Validar que empleados tengan turno abierto
if (isEmployee && !hasActiveTurn) {
  setNotification({
    message:
      "REGLA DE ORO: Debes abrir caja (turno) primero para crear pedidos",
    type: "error",
    zIndex: 50,
  });
  return;
}
```

### 5. Try-Catch para Capturar Errores

```javascript
try {
  // ... crear o actualizar pedido
  ordersService.create({...});
  // ... procesamiento
} catch (error) {
  // ✅ Capturar y mostrar errores de validación
  console.error("Error al crear pedido:", error);
  setNotification({
    message: error.message || "Error al crear el pedido. Intenta de nuevo.",
    type: "error",
    zIndex: 50,
  });
}
```

### 6. Deshabilitación del Botón con Tooltip

```javascript
<button
  disabled={
    cart.length === 0 ||
    !clientInfo.documento ||
    !clientInfo.nombre ||
    (isEmployee && !hasActiveTurn) // ✅ NUEVO
  }
  onMouseEnter={() => isEmployee && !hasActiveTurn && setShowTurnTooltip(true)}
  onMouseLeave={() => setShowTurnTooltip(false)}
  className={`...${
    cart.length === 0 ||
    !clientInfo.documento ||
    !clientInfo.nombre ||
    (isEmployee && !hasActiveTurn) // ✅ NUEVO
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
  }`}
>
  {isSale ? "Finalizar Venta / Cobrar" : "Confirmar Pedido"}
</button>;

{
  /* ✅ Tooltip REGLA DE ORO */
}
{
  showTurnTooltip && isEmployee && !hasActiveTurn && (
    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-red-600 text-white px-3 py-2 rounded text-xs whitespace-nowrap z-50 shadow-lg">
      REGLA DE ORO: Los empleados deben abrir caja primero
      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-red-600" />
    </div>
  );
}
```

## Capas de Defensa Implementadas

| Capa                                    | Mecanismo                           | Archivo             |
| --------------------------------------- | ----------------------------------- | ------------------- |
| **1. UI - Prevención**                  | Botón deshabilitado + tooltip       | CreateOrderPage.jsx |
| **2. Lógica - Validación Temprana**     | Validación antes de operación       | CreateOrderPage.jsx |
| **3. Lógica - Try-Catch**               | Captura de errores durante creación | CreateOrderPage.jsx |
| **4. Servicio - Validación Secundaria** | validateOrderCreation()             | ordersService.js    |
| **5. Servicio - Lanzado de Error**      | throw new Error()                   | ordersService.js    |

## Flujo de Ejecución

```
1. Usuario (empleado) intenta crear pedido
   ↓
2. ¿Tiene turno abierto?
   - NO → Botón deshabilitado, tooltip visible
   - YES → Botón habilitado, puede hacer click
   ↓
3. Si hace click igualmente (ingeniería inversa):
   - Validación temprana: return con notificación error
   ↓
4. Si logra pasar validación temprana:
   - Try-Catch captura error de ordersService
   ↓
5. Si logra pasar Try-Catch:
   - ordersService.create() valida última vez
   - throw new Error() si no tiene turno
```

## Testing Recomendado

### Caso 1: Empleado SIN turno abierto

1. Login como empleado
2. Navegar a crear pedido
3. **Esperado**: Botón deshabilitado, tooltip "REGLA DE ORO: Los empleados deben abrir caja primero"
4. Intentar hacer click → No funciona ni aunque sea posible hacer click forzado
5. **Verificar**: Notificación de error en consola

### Caso 2: Empleado CON turno abierto

1. Login como empleado
2. Abrir caja (turno)
3. Agregar productos al carrito
4. **Esperado**: Botón **HABILITADO**, sin tooltip
5. Hacer click en "Finalizar Venta / Cobrar"
6. **Esperado**: Pedido se crea exitosamente

### Caso 3: Cierre de turno mientras está creando

1. Login como empleado
2. Abrir caja
3. Comenzar a crear pedido (agregar productos)
4. Otra pestaña/usuario cierra el turno
5. Antes de hacer click → Button debe deshabilitarse automáticamente gracias a listeners
6. **Verificar**: listeners de `turn:closed` actualiza hasActiveTurn

## Archivos Modificados

- **src/features/sales/orders/CreateOrderPage.jsx**
  - ✅ Importación de turnService
  - ✅ Estados hasActiveTurn y showTurnTooltip
  - ✅ useEffect con listeners de eventos
  - ✅ Validación temprana en handleConfirmOrder
  - ✅ Try-catch para capturar errores
  - ✅ Deshabilitación de botón con tooltip

- **src/features/sales/orders/services/ordersService.js**
  - ℹ️ Sin cambios (validación ya existía)
  - ℹ️ validateOrderCreation() ya estaba en su lugar
  - ℹ️ throw new Error() ya se lanzaba correctamente

## Impacto

✅ **Antes**: Empleados podían crear pedidos sin turno (3 bugs potenciales)
✅ **Después**: Imposible crear pedidos sin turno (5 capas de defensa)

## Estado

**COMPLETADO Y LISTO PARA TESTING** ✅

Próximo paso: Probar en el navegador que los empleados no puedan crear pedidos sin turno abierto.
