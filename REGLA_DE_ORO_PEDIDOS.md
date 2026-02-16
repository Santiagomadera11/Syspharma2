# 🏆 REGLA DE ORO: Ninguna Operación de Inventario/Dinero sin Turno Abierto

## Implementación Completada

Esta es la regla fundamental de seguridad financiera del sistema. **La implementación protege contra:**

- Salidas de inventario no rastreadas
- Ingresos de dinero fantasma sin registrar
- Empleados que cierren sesión sin registrar ventas

---

## ¿Cómo Funciona?

### 1. **Para Empleados** 🏢

| Situación         | Comportamiento                                      | Razón                                        |
| ----------------- | --------------------------------------------------- | -------------------------------------------- |
| SIN turno abierto | ❌ Botón "Crear Pedido" **DESHABILITADO (gris)**    | REGLA DE ORO: Los empleados DEBEN abrir caja |
| CON turno abierto | ✅ Botón **HABILITADO (verde)**                     | Pedido es venta válida                       |
| Crea pedido       | ✅ Se registra automáticamente en `syspharma_sales` | Dinero contabilizado en el turno             |

**Ejemplo de flujo**:

```
1. Empleado intenta crear pedido (SIN turno)
   ↓
2. Botón GRIS con tooltip: "REGLA DE ORO: Los empleados deben abrir caja primero"
   ↓
3. Empleado abre caja (desde Ventas)
   ↓
4. Botón pasa a AZUL/VERDE (clickeable)
   ↓
5. Crea pedido
   ↓
6. Dinero SUMADO a totalVentas del turno automáticamente
   ↓
7. Al cerrar caja, el desglose muestra esta venta
```

---

### 2. **Para Admin/Web** 🌐

| Situación             | Comportamiento          | Marcado como               |
| --------------------- | ----------------------- | -------------------------- |
| Crea pedido SIN turno | ✅ Permitido (es admin) | "Pendientes de Validación" |
| Crea pedido CON turno | ✅ Permitido (es admin) | "Pendiente" (normal)       |

**Razón**: Los admins pueden crear órdenes desde web/terceros que no requieren turno inmediato. Se marcan como "Pendientes de Validación" para revisión posterior.

---

## Cambios Técnicos por Archivo

### **ordersService.js**

```javascript
// Nueva función de validación
validateOrderCreation: (orderData) => {
  const origin = orderData.origin || "web"; // 'empleado' o 'web'
  const turn = getActiveTurn();

  // REGLA DE ORO: Si es empleado, REQUIERE turno
  if (origin === "empleado" && !turn) {
    return {
      valid: false,
      message: "Los empleados no pueden crear pedidos sin turno abierto",
    };
  }

  // Si es web sin turno, permitir pero marcar como Pendientes
  if (origin === "web" && !turn) {
    return {
      valid: true,
      state: "Pendientes de Validación",
    };
  }

  return { valid: true };
};

// En create(), nuevo registro automático de venta si es empleado
if (orderData.origin === "empleado" && turn) {
  // Registra automáticamente en syspharma_sales
  turnService.recordSale({
    monto: total,
    tipo: "pedido",
    categoria: "producto",
  });
}
```

---

### **OrdersPage.jsx**

```javascript
// Botón bloqueado SOLO para empleados sin turno
const isEmployee = currentUser?.rol === "Empleado";

<button
  disabled={isEmployee && !hasActiveTurn}
  className={`${
    isEmployee && !hasActiveTurn
      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
      : "bg-emerald-600 hover:bg-emerald-700"
  }`}
>
  Crear pedido
</button>;
```

---

### **CreateOrderPage.jsx**

```javascript
// Al crear pedido, incluir origen y usuario
ordersService.create({
  cliente: clientInfo.nombre,
  total: cartTotal,
  // NUEVO: REGLA DE ORO
  origin: isEmployee ? "empleado" : "web",
  userId: isEmployee ? currentUser?.id : null,
  userName: isEmployee ? currentUser?.nombre : null,
  ...
});
```

---

## Estructura de Datos Actualizada

### Pedido (order) ahora incluye:

```javascript
{
  id: "PED-001",
  cliente: "Juan Pérez",
  total: 50000,

  // NUEVO: Rastreo de origen
  origin: "empleado",        // "empleado" | "web"
  userId: 2,                 // ID del empleado (si aplica)
  userName: "Carlos López",  // Nombre del empleado (si aplica)
  turnId: 1234567890,        // ID del turno activo (si aplica)

  // Estado dinámico
  estado: "Pendientes de Validación", // Si es web sin turno

  fecha: "2026-02-14",
  productos: [...],
  ...
}
```

---

## Casos de Uso

### ✅ Caso 1: Empleado Abre Caja y Vende

```
Carlos (Empleado) llega al turno:
1. Navega a Ventas → clicks "Abrir Caja" → ingresa $50k
2. Botón "Crear Pedido" pasa a AZUL
3. Crea pedido de cliente por $8,500
4. Sistema registra automáticamente:
   - Pedido en syspharma_orders
   - Venta en syspharma_sales ($8,500 sumado a totalVentas)
   - Asociado al turnId de Carlos
5. Al cerrar caja: desglose muestra $8,500 de ventas de productos
```

---

### ✅ Caso 2: Admin Crea Pedido Web Sin Turno

```
Admin desde dashboard crea orden de cliente web:
1. Navega a Pedidos → clicks "Crear Pedido" → forma se abre
2. Crea pedido de cliente web por $15,000
3. Pedido se marca como "Pendientes de Validación"
4. Un empleado después:
   - Abre su caja
   - Ve pedidos pendientes
   - Valida y registra la venta manualmente si es necesario
```

---

### ❌ Caso 3: Empleado Intenta Vender Sin Caja (BLOQUEADO)

```
Javier (Empleado) intenta crear pedido SIN abrir caja:
1. Navega a Pedidos
2. Botón "Crear Pedido" está GRIS
3. Pasa mouse → tooltip: "REGLA DE ORO: Los empleados deben abrir caja primero"
4. Javier está forzado a abrir caja antes de proceder
```

---

## Validación en Múltiples Capas

```
┌─────────────────────────────────────────┐
│ CAPA 1: UI / Componente (OrdersPage)   │
├─────────────────────────────────────────┤
│ Botón deshabilitado si:                │
│ - Rol = Empleado AND No hay turno      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ CAPA 2: Servicio (ordersService)       │
├─────────────────────────────────────────┤
│ validateOrderCreation():                │
│ - Si origin=empleado y NO turno        │
│   → Rechaza con error                  │
│ - Si origin=web y NO turno             │
│   → Permitir pero marcar Pendiente     │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│ CAPA 3: LocalStorage (syspharma_*)     │
├─────────────────────────────────────────┤
│ - Pedido guardado con origin            │
│ - Si empleado: venta registrada auto    │
│ - Referencia a turno activo             │
└─────────────────────────────────────────┘
```

---

## Reportes y Auditoría

### Vista de Admin: Historial de Pedidos con Origen

```
Filtros:
- Por origen: Empleado | Web | Todos
- Por estado: Pendiente | Pendientes de Validación | Completado

Columnas útiles:
- origen    → "empleado" o "web"
- userName  → "Carlos López" (si fue empleado)
- turnId    → Vinculado al turno específico
- estado    → Si es "Pendientes de Validación", requiere revisión
```

---

## Preguntas Frecuentes

**P: ¿Qué pasa si un empleado cierra sesión sin cerrar turno?**

- R: Los pedidos que creó están asociados al `turnId`. Al cerrar sesión, se ejecuta `turnService.closeTurnAndLogout()` que cierra el turno. Todos sus pedidos quedan registrados.

**P: ¿Puedo permitir que un empleado cree pedidos sin turno?**

- R: No recomendado. Eso viola la REGLA DE ORO. Si necesitas otro comportamiento, crea un parámetro de configuración.

**P: ¿Cómo diferencio pedidos nuevos de redirigidos (web)?**

- R: Campo `origin: "web"` vs `origin: "empleado"`. Úsalo en reportes y filtros.

**P: ¿Si un admin crea un pedido y luego un empleado lo valida?**

- R: Buena pregunta. Necesitarías agregar un endpoint que cambie el estado de "Pendientes de Validación" → "Validado" cuando el empleado lo confirma. Eso podría ser el próximo paso.

---

## Próximas Mejoras (Opcional)

- [ ] Interfaz para empleados que validen pedidos pendientes
- [ ] Reporte de "Tasa de conversión" (Pendientes → Validados)
- [ ] Webhook para sincronizar con sistema externo de web
- [ ] Notificación a empleado cuando hay pedidos pendientes al abrir caja
