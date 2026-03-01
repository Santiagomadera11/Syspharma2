# Dashboard de Rendimiento - Guía de Implementación

## ✅ Cambios Realizados

### 1. **Model de Datos Extendido (`turnService.js`)**

- **Nueva propiedad en turnos cerrados**: `resumen: { ventas, servicios, erroresCaja }`
- Se calcula automáticamente cuando se cierra un turno
- Los `servicios` se cuentan automáticamente de `syspharma_sales` filtrando `categoria === 'servicio'`

### 2. **Funciones Nuevas en `turnService.js`**

- `getEmployeesSummary()` - Retorna array de empleados con totalVentas, totalServicios, totalTurnos
- `getMedicosSummary()` - Retorna array de médicos con totalServicios, totalIngresos
- `getAllServices()` - Obtiene array de servicios médicos desde localStorage
- `recordMedicalService(serviceData)` - Registra un servicio médico completado

### 3. **Integración de Citas** (`AppointmentsPage.jsx`)

- Cuando una cita se marca como "Completada", se registra automáticamente en el sistema
- Se guarda con: `medicoId`, `nombreMedico`, `paciente`, `monto`, `estado`
- Esto permite que los médicos aparezcan en el dashboard sin tener login en el sistema

### 4. **Dashboard de Rendimiento** (`ShiftHistoryReportsPage.jsx`)

- **Completamente rediseñado** con dos pestañas:

#### **Pestaña 1: Desempeño de Empleados**

- **3 KPI Cards**:
  - ⭐ Empleado Estrella (mayor cantidad de ventas)
  - 👑 Rey del Servicio (mayor cantidad de servicios/citas)
  - 📊 Meta Grupal (% de meta alcanzada vs 5M)

- **Gráfico de Barras**: Ventas vs Servicios por empleado (usando Recharts)

- **Tabla de Detalles** con:
  - Columna de Productividad: 🥇 🥈 🥉 (medallas oro, plata, bronce)
  - Empleado (nombre)
  - Turnos Cerrados
  - Total Ventas
  - Servicios
  - Promedio Venta

#### **Pestaña 2: Productividad Médica**

- **Gráfica de Torta**: Distribución de servicios por médico
- **Tarjeta Resumen**: Top 3 médicos con barra de progreso
- **Tabla Detallada**:
  - Posición (ranking)
  - Nombre del Médico
  - Citas Realizadas
  - Ingresos Generados
  - Ingreso Promedio

---

## 📋 Flujo de Datos

### Cuando un Empleado Cierra Turno:

```
1. CloseShiftModal solicita cierre
2. turnService.closeTurn() es llamado
3. Se cuentan USER_SALES filtrando por userId y categoría === 'servicio'
4. Se genera RESUMEN: { ventas, servicios, erroresCaja }
5. Se guarda en TURNS_HISTORY con el resumen
```

### Cuando se Completa una Cita:

```
1. AppointmentsPage -> handleStatusChange("Completada")
2. appointment se actualiza en appointmentService
3. turnService.recordMedicalService() registra el servicio
4. Servicio se guarda en syspharma_services con medicoId, nombreMedico
5. El dashboard cuenta automáticamente en getMedicosSummary()
```

### Cuando Admin ve el Dashboard:

```
1. ShiftHistoryReportsPage calcula:
   - employeesSummary = turnService.getEmployeesSummary()
   - medicosSummary = turnService.getMedicosSummary()
2. Top 3 empleados + médicos se muestran automáticamente
3. Gráficos se renderizan con Recharts
4. Las medallas se asignan por posición en ventas
```

---

## 🔧 Configuración

### Meta Grupal (línea ~115 en ShiftHistoryReportsPage.jsx)

```javascript
const META_VENTAS = 5000000; // Cambiar esta variable según sea necesario
```

### Colores de Gráficos (línea ~34)

```javascript
const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"]; // Verde, Azul, Ámbar, Rojo
```

---

## 💾 Estructura de Datos en localStorage

### syspharma_turns_history (Turnos Cerrados)

```javascript
{
  turnId: NUMBER,
  userId: NUMBER,
  userName: STRING,
  horaApertura: ISO_STRING,
  horaApertura: ISO_STRING,
  horaCierre: ISO_STRING,
  montoBase: NUMBER,
  totalVentas: NUMBER,
  totalGastos: NUMBER,
  estado: "cerrado",
  resumen: {
    ventas: NUMBER,
    servicios: COUNT,
    erroresCaja: NUMBER
  }
}
```

### syspharma_services (Servicios Médicos)

```javascript
{
  serviceId: NUMBER,
  medicoId: NUMBER,
  nombreMedico: STRING,
  paciente: STRING,
  monto: NUMBER,
  servicio: STRING,
  estado: "completada",
  fecha: ISO_STRING,
  appointmentId: NUMBER,
  tipo: "servicio_medico"
}
```

---

## ✨ Características Destacadas

- ✅ **Dashboard auto-actualizable**: Los datos se calculan en tiempo real de localStorage
- ✅ **Sin backend requerido**: Todo funciona con localStorage
- ✅ **Medallas de Productividad**: 🥇 Oro, 🥈 Plata, 🥉 Bronce
- ✅ **Gráficos Visuales**: Recharts integrado para barras y tortas
- ✅ **Soporte para Médicos**: Aunque no tengan login, aparecen en reportes
- ✅ **Flexibilidad**: Fácil cambiar meta, colores, periodos de análisis

---

## 🚀 Próximos Pasos Opcionales

1. **Exportar a Excel**: Implementar en botón "Descargar Excel"
2. **Filtros Avanzados**: Por período, por médico específico, etc.
3. **Alertas**: Si algún empleado está bajo la media
4. **Historial Mensual**: Comparar desempeño mes a mes
5. **Métricas de Caja**: Errores de caja, diferencias reportadas

---

## 📝 Notas Importantes

- Los datos del dashboard se cargan en **tiempo real** desde localStorage
- No hay caché, por lo que siempre mostrarán información actual
- Las medallas 🥇🥈🥉 solo aparecen si hay **3+ empleados**
- El porcentaje de Meta Grupal puede superar 100% si se excede la meta
- Los médicos se ordenan automáticamente por cantidad descendente de servicios
