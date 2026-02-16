# 🔄 Arquitectura de Eventos - Sistema de Seguridad de Turnos

## Diagrama de Flujo de Eventos

```
┌───────────────────────────────────────────────────────────────────────┐
│                        USUARIO ABRE CAJA                              │
│                    (OpenShiftModal.jsx)                               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                   ┌───────────▼──────────┐
                   │ turnService.openTurn │
                   │ (guarda en localStorage)
                   └───────────┬──────────┘
                               │
                   ┌───────────▼──────────────────────┐
                   │ Dispara Custom Event:            │
                   │ turn:opened                      │
                   └───────────┬──────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
   ┌─────────────┐      ┌──────────────┐      ┌──────────────┐
   │Window        │      │ EmployeeLayout│    │ Otros oyentes│
   │ (escucha)    │      │ (escucha)    │    │              │
   │              │      │              │    │              │
   │ turn:opened  │      │ turn:opened  │    │              │
   │ (recibe)     │      │ (recibe)     │    │              │
   └─────┬────────┘      └───┬──────────┘    └──────────────┘
         │                   │
         │              ┌────▼──────────────────┐
         │              │ Re-dispara:           │
         │              │ turn:changed          │
         │              └────┬──────────────────┘
         │                   │
         ├───────────────────┼──────────────────┐
         │                   │                  │
         ▼                   ▼                  ▼
    ┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
    │ EmployeeService│ │ OrdersPage       │ │ Otros Pages  │
    │ Page           │ │                  │ │              │
    │                │ │ Escucha:         │ │              │
    │ Escucha:       │ │ turn:changed     │ │              │
    │ turn:changed   │ │                  │ │              │
    │                │ │ handleTurnChange │ │              │
    │ handleTurn     │ │ ↓                │ │              │
    │ Change         │ │ setHasActiveTurn │ │              │
    │ ↓              │ │ (turnService.    │ │              │
    │ setHasActive   │ │  hasActiveTurn())│ │              │
    │ Turn           │ │                  │ │              │
    │ (true)         │ │ Re-renderiza      │ │              │
    │                │ │                  │ │              │
    │ Re-renderiza   │ │ Botón AZUL       │ │              │
    │                │ │ Habilitado       │ │              │
    │ Botón AZUL    │ │                  │ │              │
    │ Habilitado     │ └──────────────────┘ │              │
    └──────────────┘                        └──────────────┘
```

---

## Flujo de **Cierre de Caja** (similar)

```
┌───────────────────────────────────────────────────────────────────────┐
│                        USUARIO CIERRA CAJA                             │
│                   (CloseShiftModal.jsx)                                │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                   ┌───────────▼──────────┐
                   │ turnService.closeTurn│
                   │ (guarda en historial)│
                   │ (elimina caja activa)│
                   └───────────┬──────────┘
                               │
                   ┌───────────▼──────────────────────┐
                   │ Dispara Custom Event:            │
                   │ turn:closed                      │
                   └───────────┬──────────────────────┘
                               │
                ┌──────────────┼──────────────────┐
                │              │                  │
                ▼              ▼                  ▼
           ┌─────────────┐  ┌──────────────┐  ┌──────────┐
           │ Window      │  │ EmployeeLayout│ │ Otros    │
           │ (escucha)   │  │              │  │          │
           │             │  │ turn:closed  │  │          │
           │ turn:closed │  │ (recibe)     │  │          │
           │ (recibe)    │  │              │  │          │
           └─────┬───────┘  └────┬──────────┘  └──────────┘
                 │               │
                 │           ┌───▼──────────────────┐
                 │           │ Re-dispara:          │
                 │           │ turn:changed         │
                 │           └───┬──────────────────┘
                 │               │
                 └───────┬───────┤
                         │       │
                    ┌────▼────┬──▼─────────────┐
                    ▼         ▼                ▼
              ┌──────────┐ ┌──────────────┐ ┌──────────┐
              │ Service  │ │ Orders Page  │ │ Otros    │
              │ Page     │ │              │ │ Pages    │
              │          │ │ setHasActive │ │          │
              │ setHas   │ │ Turn(false)  │ │          │
              │ Active   │ │              │ │          │
              │ Turn     │ │ Re-renderiza │ │          │
              │ (false)  │ │              │ │          │
              │          │ │ Botón GRIS   │ │          │
              │ Re-rend. │ │ Deshabilitado│ │          │
              │          │ │              │ │          │
              │ Botón    │ │ + Tooltip    │ │          │
              │ GRIS     │ │              │ │          │
              │ Inhabilitado             │ │          │
              └──────────┘ └──────────────┘ └──────────┘
```

---

## Flujo de **Logout Atómico**

```
┌────────────────────────────────────┐
│ Usuario Click "Cerrar Sesión"      │
└─────────────┬──────────────────────┘
              │
    ┌─────────▼─────────┐
    │ Confirma Log Out  │
    └─────────┬─────────┘
              │
    ┌─────────▼──────────────────────────────┐
    │ handleConfirmLogout() en EmployeeLayout│
    └─────────┬──────────────────────────────┘
              │
    ┌─────────▼─────────────────────────────────┐
    │ turnService.closeTurnAndLogout()          │
    └─────────┬─────────────────────────────────┘
              │
    ┌─────────▼───────────────────────────────────────┐
    │ ¿Hay turno activo?                             │
    └────┬────────────────────────────────────────────┘
         │
    Yes  │     No
         │     │
    ┌────▼──┐ ┌┴─────────┐
    │ Cierra│ │ Salta    │
    │ turno │ │ cierre   │
    └────┬──┘ └┬─────────┘
         │     │
         └─┬───┘
           │
    ┌──────▼────────────────────────┐
    │ localStorage.removeItem(       │
    │   "syspharma_user"            │
    │ )                             │
    │ (Limpia sesión del usuario)   │
    └──────┬──────────────────────────┘
           │
    ┌──────▼────────────────────┐
    │ return {                  │
    │   success: true,          │
    │   message: "Sesión cierre"│
    │ }                         │
    └──────┬────────────────────┘
           │
    ┌──────▼──────────────────────┐
    │ Navega a "/" (landing page) │
    └─────────────────────────────┘
```

---

## Validación en Servicios (Backend)

```
┌──────────────────────────────────┐
│ ordersService.create(orderData)  │
└─────────┬────────────────────────┘
          │
┌─────────▼────────────────────────────────┐
│ validateTurnActive()                     │
│ ┌──────────────────────────────────────┐ │
│ │ const turn = localStorage.getItem(   │ │
│ │   "syspharma_current_turn"           │ │
│ │ )                                    │ │
│ └──────────────────────────────────────┘ │
└─────────┬────────────────────────────────┘
          │
┌─────────▼──────────────────────────┐
│ ¿Turno existe?                     │
└────┬─────────────────────────┬─────┘
     │                         │
    SÍ                        NO
     │                         │
 ┌───▼──────────┐      ┌───────▼────────────────────┐
 │ Retorna:     │      │ Retorna:                   │
 │ {            │      │ {                          │
 │   valid: true│      │   valid: false,            │
 │ }            │      │   message: "No hay turno..."
 │              │      │ }                          │
 └───┬──────────┘      └───────┬────────────────────┘
     │                         │
 ┌───▼────────────────┐    ┌───▼──────────────────┐
 │ Continúa creando   │    │ if (!valid) {        │
 │ orden              │    │   throw new Error()  │
 │                    │    │ }                    │
 │ ÉXITO ✅           │    │ RECHAZA ❌          │
 └────────────────────┘    └────────────────────┘
```

---

## Resumen de Componentes y Sus Roles

| Componente               | Rol                      | Evento                           |
| ------------------------ | ------------------------ | -------------------------------- |
| **OpenShiftModal**       | Dispara `turn:opened`    | Al confirmar apertura            |
| **CloseShiftModal**      | Dispara `turn:closed`    | Al confirmar cierre              |
| **EmployeeLayout**       | Propaga → `turn:changed` | Escucha `turn:opened/closed`     |
| **EmployeeServicesPage** | Actualiza botón          | Escucha `turn:changed`           |
| **OrdersPage**           | Actualiza botón          | Escucha `turn:changed`           |
| **ordersService**        | Valida turno             | Backend validation en `create()` |
| **turnService**          | Maneja lógica de turno   | `closeTurnAndLogout()` nueva     |

---

## ¿Qué pasa si fallan los eventos?

1. **El evento `turn:opened` no se dispara**
   - Los botones permanecerán GRISES
   - Revisa OpenShiftModal línea ~45

2. **El evento `turn:closed` no se dispara**
   - Los botones permanecerán AZULES
   - Revisa CloseShiftModal línea ~70

3. **EmployeeLayout no propaga el evento**
   - Los componentes hijos no se actualizan
   - Revisa EmployeeLayout useEffect

4. **No hay listener en EmployeeServicesPage/OrdersPage**
   - Los botones nunca se habilitan
   - Revisa useEffect en ambas páginas
