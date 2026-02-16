# 🧪 PRUEBAS VISUALES - Sistema de Seguridad de Turnos

## ✅ Verificación Rápida (2 minutos)

### Parte 1: Botón Deshabilitado (SIN Turno)

1. Abre el navegador en `http://localhost:5174`
2. **Login como Empleado**:
   - Email: `empleado@syspharma.com`
   - Contraseña: `empleado123`
3. Navega a **"Servicios"** (izquierda del sidebar)
4. Observa el botón **"Nuevo"**:
   - ❌ **DEBE estar GRIS** (deshabilitado)
   - ❌ **DEBE estar opaco** (~60% opacity)
   - ✅ Pasa el mouse sobre el botón
   - ✅ **DEBE aparecer un tooltip**: "Debes abrir caja para realizar esta operación"

**Resultado Esperado**: Botón gris + tooltip al hover

---

### Parte 2: Botón Habilitado (CON Turno)

1. Navega a **"Ventas"** (o "Mis Ventas" si eres empleado)
2. Haz click en **"Abrir Caja"** (botón verde/cyan)
3. Ingresa monto base: `50000`
4. Click en **"Abrir Turno"**
5. Se cierra el modal
6. **Regresa a Servicios** (sin recargar la página)
7. Observa el botón **"Nuevo"**:
   - ✅ **DEBE estar AZUL** (habilitado)
   - ✅ **Debe estar con efecto hover** (bg-blue-700)
   - ✅ **CON cursor pointer**
   - ✅ NO debe haber tooltip al hover

**Resultado Esperado**: Botón azul + clickeable

---

### Parte 3: Prueba en Pedidos

1. Navega a **"Pedidos"** (o "Mis Pedidos" si eres empleado)
2. Busca el botón **"Crear pedido"**
3. **Sin turno abierto** (ciérralo primero):
   - ❌ Debe estar GRIS
   - ✅ Tooltip: "Debes abrir caja..."
4. **Con turno abierto**:
   - ✅ Debe estar VERDE/EMERALD
   - ✅ Debe ser clickeable

**Resultado Esperado**: Mismo comportamiento que en Servicios

---

### Parte 4: Cierre de Sesión Seguro

1. Con un turno **ACTIVO**, haz click en tu usuario (topbar)
2. Click en **"Cerrar Sesión"**
3. Confirma "¿Cerrar sesión?"
4. Deberías ser redirigido a la página **de login** (`/`)
5. **Abre DevTools** (`F12 → Application → LocalStorage`):
   - ❌ `syspharma_user` **NO debe existir**
   - ❌ `syspharma_current_turn` **NO debe existir**

**Resultado Esperado**: Usuario y turno eliminados del localStorage

---

## 🐛 Diagnóstico si algo NO funciona

### "El botón NO se habilita después de abrir turno"

- [ ] Abre DevTools → Console
- [ ] Verifica que NO hay errores en rojo
- [ ] Ejecuta:
  ```javascript
  localStorage.getItem("syspharma_current_turn");
  ```
  Debe retornar un objeto JSON con la caja abierta

### "El tooltip NO aparece"

- [ ] Abre DevTools → Inspector de elementos
- [ ] Pasa mouse sobre el botón gris
- [ ] Busca el elemento `<div>` con clase `absolute top-full`
- [ ] Si no existe, hay un bug en la renderización

### "El logout falla o no limpia localStorage"

- [ ] Abre DevTools → Console
- [ ] Busca errores en rojo en el logout
- [ ] Verifica que `turnService.closeTurnAndLogout()` se ejecutó correctamente

---

## 📊 Checklist de Validación Exitosa

- [ ] Botón "Nuevo" GRIS sin turno
- [ ] Botón "Nuevo" AZUL con turno
- [ ] Tooltip aparece al hover en botón deshabilitado
- [ ] Botón es clickeable cuando hay turno
- [ ] Logout elimina `syspharma_user`
- [ ] Logout elimina `syspharma_current_turn`
- [ ] Redirige a inicio después de logout
- [ ] NO hay errores en DevTools Console

---

## 💡 Notas

- El sistema usa **event listeners globales** (`turn:changed`) para sincronizar botones
- Después de abrir/cerrar turno, las páginas se actualizan automáticamente sin recargar
- Si recargas la página manualmente (`F5`), el estado se preserva correctamente desde localStorage
