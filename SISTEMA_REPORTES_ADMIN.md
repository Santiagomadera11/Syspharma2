# 📊 Sistema de Reportes Administrativos - SysPharma

## Descripción General

Se ha implementado un **módulo completo de reportes administrativos** que permite a los administradores analizar el desempeño operativo del sistema, incluyendo:

- **Historial de Turnos**: Seguimiento completo de apertura/cierre de cajas con desglose de ventas
- **Análisis de Pedidos**: Filtrado por origen (empleado vs web) y estado
- **Desempeño de Vendedores**: Ranking de empleados por ingresos, cantidad de pedidos y ticket promedio

---

## 🔗 Rutas de Acceso

| Reporte | Ruta | Descripción |
|---------|------|-------------|
| **Historial de Turnos** | `/admin/reportes/turnos` | Turnos cerrados con ingresos, gastos y saldo |
| **Análisis de Pedidos** | `/admin/reportes/pedidos` | Pedidos con filtros por origen y estado |
| **Desempeño de Vendedores** | `/admin/reportes/desempeño` | Ranking de rendimiento individual |

---

## 📋 1. Historial de Turnos (`ShiftHistoryReportsPage.jsx`)

### Características

#### Filtros
- **Rango de Fechas**: Selecciona período de inicio y fin
- **Botón Limpiar**: Reset de filtros para ver todos los turnos

#### Tarjetas de Resumen
- **Turnos Cerrados**: Total de cajas cerradas en período
- **Ingresos Totales**: Sum de todas las ventas
- **Gastos Totales**: Sum de todos los gastos registrados
- **Balance Neto**: Ingresos - Gastos

#### Tabla de Turnos
| Columna | Información |
|---------|-------------|
| ID | ID único del turno |
| Empleado | Nombre del empleado que abrió caja |
| Fecha Apertura | Cuándo se abrió la caja |
| Fecha Cierre | Cuándo se cerró la caja |
| Monto Base | Dinero inicial |
| Ingresos | Total de ventas (productos + servicios) |
| Gastos | Total de gastos registrados |
| Saldo | Monto esperado en caja |

#### Modal de Detalles
- **Desglose por Categoría**:
  - Ventas de Productos: Cantidad + monto
  - Ventas de Servicios: Cantidad + monto
- **Información Financiera**: Resumen completo
- **Datos de Cierre**: Hora exacta y usuario que cerró

### Datos Utilizados
- Fuente: `turnService.getTurnsHistory()` → localStorage `syspharma_turns_history`
- Campos principales: `id`, `userName`, `horaApertura`, `horaCierre`, `montoBase`, `ventasProductos`, `ventasServicios`, `gastos`

---

## 📦 2. Análisis de Pedidos (`OrderReportsPage.jsx`)

### Características

#### Tarjetas de Estadísticas
- **Total Pedidos**: Cantidad total + ingresos totales
- **De Empleados**: Pedidos creados por empleados + ingresos
- **De Web**: Pedidos de clientes web + ingresos
- **Pendientes Validación**: Pedidos sin validar (web orders sin turno)
- **Tasa Empleado**: Porcentaje de pedidos hechos por empleados

#### Filtros en Tiempo Real
1. **Búsqueda**: Por cliente, ID pedido, o nombre de empleado
2. **Origen**: Todos / Solo Empleados / Solo Web
3. **Estado**: Todos / Pendiente / En proceso / Entregado / Cancelado / Pendientes de Validación
4. **Limpiar**: Reset de todos los filtros

#### Tabla de Pedidos
| Columna | Información |
|---------|-------------|
| ID Pedido | Código único del pedido |
| Cliente | Nombre del cliente |
| Origen | Badge: empleado (azul) o web (morado) |
| Creado Por | Empleado que lo creó o cliente web |
| Total | Monto del pedido |
| Estado | Estado actual del pedido |
| Fecha | Cuándo se creó |
| Acciones | Ver detalles |

#### Modal de Detalle del Pedido
- **Información General**: Cliente, documento, origen, estado
- **Información del Empleado** (si es de empleado):
  - Nombre del empleado
  - ID usuario
  - ID turno asociado
- **Productos**: Lista con cantidad y monto
- **Resumen Financiero**: Subtotal y método de pago
- **Notas**: Observaciones adicionales

### Datos Utilizados
- Fuente: `ordersService.getAll()` → localStorage `syspharma_orders`
- Campos principales: `id`, `origen`, `cliente`, `estado`, `total`, `userName`, `userId`, `turnId`, `productos`, `fecha`

---

## 👥 3. Desempeño de Vendedores (`SalesPerformanceReportsPage.jsx`)

### Características

#### Filtros
- **Rango de Tiempo**:
  - Todos los Períodos (sin filtro)
  - Esta Semana (últimos 7 días)
  - Este Mes (mes actual)
- **Ordenamiento**:
  - Por Ingresos (mayor a menor)
  - Por Cantidad de Pedidos
  - Por Ticket Promedio

#### Tarjetas de Resumen General
- **Total Ventas**: Ingresos totales del período
- **Promedio por Pedido**: Ingresos ÷ Cantidad de pedidos
- **Total Empleados**: Cantidad de vendedores activos
- **Total Artículos**: Sum de productos + servicios vendidos
- **Ticket Promedio**: Artículos ÷ Cantidad de pedidos

#### Tabla de Empleados
| Columna | Información |
|---------|-------------|
| Empleado | Nombre y ranking (número) + ID usuario |
| Ingresos | Total generado + barra de progreso visual |
| Pedidos | Cantidad de pedidos realizados |
| Ticket Promedio | Monto promedio por pedido |
| Productos | Cantidad de productos vendidos |
| Servicios | Cantidad de servicios realizados |
| Acciones | Ver detalle |

#### Modal de Detalle del Empleado
- **Avatar**: Primera letra del nombre
- **Resumen Individual**:
  - Total de ingresos generados
  - Cantidad de pedidos
  - Ticket promedio
  - Promedio de artículos por pedido
- **Desglose**:
  - Productos vendidos (cantidad)
  - Servicios realizados (cantidad)
- **Últimos Pedidos**: Últimos 5 pedidos
  - Cliente
  - Fecha
  - Monto
  - Cantidad de productos

### Datos Utilizados
- Fuente: `ordersService.getAll()` → localStorage `syspharma_orders`
- Filtrado por: `origin === "empleado"` solamente
- Campos principales: `userName`, `userId`, `total`, `productos`, `servicios`, `fecha`

---

## 🏗️ Estructura de Directorios

```
src/
├── features/
│   └── admin/
│       └── reports/
│           ├── ShiftHistoryReportsPage.jsx
│           ├── OrderReportsPage.jsx
│           └── SalesPerformanceReportsPage.jsx
├── layouts/
│   └── Sidebar/
│       └── Sidebar.jsx (actualizado con menú de reportes)
└── routes/
    └── AppRouter.jsx (actualizado con rutas de reportes)
```

---

## 🔧 Menú Navegación

En el Sidebar del admin aparece una nueva sección **"Reportes"** con 3 opciones:

```
📊 Reportes (Expandible)
├── 📅 Historial de Turnos
├── 📋 Análisis de Pedidos
└── 📈 Desempeño de Vendedores
```

---

## 💾 Fuentes de Datos

### localStorage Keys
- `syspharma_turns_history`: Historial de turnos cerrados
- `syspharma_orders`: Todos los pedidos creados
- `syspharma_sales`: Registro de ventas (para referencia)
- `syspharma_expenses`: Registro de gastos

### Servicios Utilizados
- **turnService**:
  - `getTurnsHistory()`: Obtiene todos los turnos cerrados
  - `calculateExpectedBalance()`: Calcula saldo esperado

- **ordersService**:
  - `getAll()`: Obtiene todos los pedidos
  - Formato de datos: `{ id, cliente, origen, estado, total, userName, userId, fecha, productos, ... }`

---

## 🎨 Diseño Visual

### Colores por Origen/Tipo
- **Empleado**: Azul (#3B82F6) - Pedidos creados internamente
- **Web**: Morado (#A855F7) - Pedidos de clientes en línea
- **Servicios**: Naranja (#FB923C) - Presentados distintos en desglose
- **Productos**: Verde/Esmeralda (#10B981) - Presentados distintos en desglose

### Componentes Comunes
- **Tarjetas KPI**: Resumen de métricas clave
- **Tablas**: Datos con hover effect y paginación de scroll
- **Modales**: Detalles expandibles con información completa
- **Badges**: Estados y orígenes con colores distintivos
- **Barras de Progreso**: Visualización de proporciones (ingresos, participación)

---

## 📱 Responsividad

- **Desktop**: Visualización completa con todas las columnas
- **Tablet**: Ajuste de espacios, tabla con scroll horizontal si es necesario
- **Mobile**: Stacked layout para modales, búsqueda simplificada (NOTA: Reportes son principalmente para desktop)

---

## ✨ Características Avanzadas (Future)

### Implementación Planeada
- ✅ Exportar a Excel (botón presente, funcionalidad a implementar)
- ⏳ Gráficos de tendencias (Recharts lista para usar)
- ⏳ Filtros por rango de ingresos
- ⏳ Comparativa período a período
- ⏳ Notificaciones de alertas (ingresos muy bajos, etc.)

---

## 🔐 Seguridad

- **Acceso**: Solo usuarios con rol "Administrador"
- **Datos**: Todos los datos provienen de localStorage (datos locales del navegador)
- **Validación**: Orígenes verificados (empleado vs web) en punto de creación de orden

---

## 📊 Casos de Uso Típicos

### Administrador necesita...
1. **Entender ventas por turno**: → Historial de Turnos
2. **Auditar órdenes web vs empleados**: → Análisis de Pedidos
3. **Medir desempeño de equipo** → Desempeño de Vendedores
4. **Identificar anomalías**: → Visualizar tarjetas de resumen
5. **Exportar para análisis externo** → Download Excel (future)

---

## 🚀 Próximos Pasos

1. **Testing en Navegador**: Abrir `/admin/reportes/turnos`, `/admin/reportes/pedidos`, `/admin/reportes/desempeño`
2. **Validar Datos**: Verificar que las cifras coincidan con transacciones reales
3. **Excel Export**: Implementar descarga de reportes en formato Excel
4. **Charts**: Agregar visualizaciones gráficas con Recharts
5. **Alerts**: Notificaciones para anomalías o metas no alcanzadas

---

## 📝 Resumen de Cambios

### Archivos Creados:
- ✅ `src/features/admin/reports/ShiftHistoryReportsPage.jsx`
- ✅ `src/features/admin/reports/OrderReportsPage.jsx`
- ✅ `src/features/admin/reports/SalesPerformanceReportsPage.jsx`

### Archivos Modificados:
- ✅ `src/routes/AppRouter.jsx` - Agregadas 3 nuevas rutas bajo `/admin/reportes/`
- ✅ `src/layouts/Sidebar/Sidebar.jsx` - Agregado menú "Reportes" expandible con 3 opciones

### Dependencias:
- Todas las dependencias necesarias ya están en el proyecto (Lucide, React, React Router)

---

**Última Actualización**: Implementación Fase 6 - Sistema de Reportes Administrativos  
**Estado**: ✅ Listo para Testing
