# 🎨 Guía Práctica: Implementar Componentes Responsivos

## Patrones Reutilizables para Nuevos Componentes

---

## 1️⃣ PATRÓN: Header Responsivo

```jsx
<header className="h-14 bg-primary-600 px-3 sm:px-5 flex items-center justify-between">
  {/* Contenedor izquierda: Menú + Logo */}
  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
    {/* Menú hamburguesa: Solo móvil */}
    <button className="lg:hidden p-1 hover:bg-white/10 rounded-md flex-shrink-0">
      <Menu size={24} />
    </button>
    
    {/* Logo: Adaptativo */}
    <div className="flex items-center gap-2">
      <div className="bg-white/20 p-1 sm:p-1.5 rounded-lg flex-shrink-0">
        <Icon size={18} />
      </div>
      <div className="hidden xs:block min-w-0">
        <h1 className="text-base sm:text-lg font-bold truncate">Título</h1>
        <p className="text-[8px] sm:text-[9px] opacity-80">Subtítulo</p>
      </div>
    </div>
  </div>

  {/* Contenedor derecha: Acciones */}
  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
    <button className="p-1 rounded-md hover:bg-white/10">
      <Bell size={20} />
    </button>
    <div className="h-6 w-[1px] bg-white/30 hidden sm:block"></div>
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="text-right hidden sm:block">
        <p className="text-xs font-bold truncate">Usuario</p>
        <p className="text-[10px] opacity-80">Rol</p>
      </div>
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
        U
      </div>
    </div>
  </div>
</header>
```

**Puntos clave:**
- `lg:hidden` para el botón hamburguesa
- `min-w-0` para evitar overflow en flex
- `hidden xs:block` para ocultar en móviles muy pequeños
- `gap-2 sm:gap-3 sm:gap-4` para espaciado adaptativo

---

## 2️⃣ PATRÓN: Tabla/Tarjetas (Dual View)

```jsx
// DESKTOP: Tabla
<div className="hidden sm:flex flex-1 bg-white rounded-lg flex-col overflow-hidden">
  <div className="overflow-auto">
    <table className="w-full">
      <thead className="bg-emerald-700 sticky top-0">
        <tr>
          <th className="py-3 px-3 sm:px-4 text-[11px]">Columna 1</th>
          <th className="py-3 px-3 sm:px-4 text-[11px] hidden md:table-cell">
            Columna 2 (Oculta en tablet)
          </th>
          <th className="py-3 px-3 sm:px-4 text-[11px] hidden lg:table-cell">
            Columna 3 (Oculta en laptop)
          </th>
          <th className="py-3 px-3 sm:px-4 text-[11px]">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="py-3 px-3 sm:px-4 text-xs">{item.name}</td>
            <td className="py-3 px-3 sm:px-4 text-xs hidden md:table-cell">{item.category}</td>
            <td className="py-3 px-3 sm:px-4 text-xs hidden lg:table-cell">{item.price}</td>
            <td className="py-3 px-3 sm:px-4">
              <div className="flex gap-1">
                <button className="p-1.5 sm:p-2 rounded-lg border flex-shrink-0">
                  <Edit size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

// MÓVIL: Tarjetas
<div className="sm:hidden flex-1 flex flex-col gap-3 overflow-y-auto">
  {items.map(item => (
    <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 space-y-3 border border-gray-200">
      {/* Header tarjeta */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
          <p className="text-xs text-gray-600">ID: {item.id}</p>
        </div>
      </div>

      {/* Contenido tarjeta */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-gray-500 font-medium">Categoría</p>
          <p className="text-gray-900 font-semibold">{item.category}</p>
        </div>
        <div>
          <p className="text-gray-500 font-medium">Precio</p>
          <p className="text-emerald-600 font-bold">$ {item.price}</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-2">
        <button className="flex-1 py-2 px-3 rounded-lg border text-xs font-medium">
          Editar
        </button>
        <button className="flex-1 py-2 px-3 rounded-lg border text-xs font-medium">
          Eliminar
        </button>
      </div>
    </div>
  ))}
</div>
```

**Puntos clave:**
- `hidden sm:flex` para tabla (desktop)
- `sm:hidden` para tarjetas (móvil)
- `hidden md:table-cell` columnas opcionales
- Botones 100% ancho en tarjetas: `flex-1`
- Grid 2 columnas en tarjetas: `grid grid-cols-2`

---

## 3️⃣ PATRÓN: Sidebar Responsivo

```jsx
// Overlay en móvil
{isOpen && (
  <div
    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
    onClick={onClose}
  />
)}

// Sidebar responsivo
<aside className={`
  fixed lg:static inset-y-0 left-0 w-60 h-full
  bg-white shadow-xl z-50 border-l border-gray-200
  transform transition-transform duration-300
  ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
`}>
  {/* Header */}
  <div className="h-14 flex items-center justify-between px-5 border-b">
    <div className="flex items-center gap-2">
      <Icon className="flex-shrink-0" size={18} />
      <div className="hidden sm:block">
        <h2 className="text-base font-bold">Menú</h2>
      </div>
    </div>
    <button
      onClick={onClose}
      className="lg:hidden p-1 hover:bg-gray-100 rounded-md"
    >
      <X size={20} />
    </button>
  </div>

  {/* Navegación */}
  <nav className="flex-1 overflow-y-auto py-3 sm:py-4 px-1 sm:px-2">
    {/* Items */}
  </nav>
</aside>
```

**Puntos clave:**
- `lg:hidden` overlay solo en móvil
- `fixed lg:static` posicionamiento dual
- `inset-y-0 left-0` posición fija
- `-translate-x-full lg:translate-x-0` animación
- `lg:hidden` botón de cierre

---

## 4️⃣ PATRÓN: Formulario Responsivo

```jsx
<form className="space-y-3 sm:space-y-4">
  {/* Campo simple */}
  <div>
    <label className="block text-xs sm:text-sm font-medium mb-1">
      Nombre
    </label>
    <input
      type="text"
      className="w-full px-3 py-2 sm:py-2 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-primary-600"
      placeholder="Tu nombre"
    />
  </div>

  {/* Dos columnas en desktop, una en móvil */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
    <div>
      <label className="block text-xs sm:text-sm font-medium mb-1">
        Email
      </label>
      <input type="email" className="w-full px-3 py-2 rounded-md border" />
    </div>
    <div>
      <label className="block text-xs sm:text-sm font-medium mb-1">
        Teléfono
      </label>
      <input type="tel" className="w-full px-3 py-2 rounded-md border" />
    </div>
  </div>

  {/* Botones: Apilados en móvil, lado a lado en desktop */}
  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
    <button type="button" className="flex-1 px-3 py-2 rounded-md border">
      Cancelar
    </button>
    <button type="submit" className="flex-1 px-3 py-2 rounded-md bg-primary-600 text-white">
      Guardar
    </button>
  </div>
</form>
```

**Puntos clave:**
- `grid grid-cols-1 sm:grid-cols-2` grid responsivo
- `flex flex-col sm:flex-row` botones apilados/lado a lado
- `gap-3 sm:gap-4` espaciado adaptativo
- `w-full` para inputs

---

## 5️⃣ PATRÓN: Contenedor Responsivo

```jsx
<div className="flex flex-col p-3 sm:p-6 gap-3 sm:gap-6 max-w-4xl mx-auto">
  {/* Header responsivo */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
    <div>
      <h1 className="text-lg sm:text-2xl font-bold">Título</h1>
      <p className="text-xs sm:text-sm text-gray-600">Descripción</p>
    </div>
    <button className="w-full sm:w-auto px-3 py-2 rounded-md bg-primary-600 text-white text-sm font-medium">
      Acción
    </button>
  </div>

  {/* Contenido */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
    {/* Cards */}
  </div>
</div>
```

---

## 6️⃣ PATRÓN: Modal Responsivo

```jsx
{isOpen && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 sm:p-0 backdrop-blur-sm">
    <div className="bg-white rounded-lg shadow-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b">
        <h2 className="text-lg sm:text-xl font-bold">Título Modal</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-md flex-shrink-0"
        >
          <X size={20} />
        </button>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
        {/* Contenido */}
      </div>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
        <button
          onClick={onClose}
          className="w-full sm:w-auto px-3 py-2 rounded-md border hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button className="w-full sm:w-auto px-3 py-2 rounded-md bg-primary-600 text-white">
          Confirmar
        </button>
      </div>
    </div>
  </div>
)}
```

**Puntos clave:**
- `w-full sm:max-w-md` ancho adaptativo
- `p-4 sm:p-6` padding responsive
- `max-h-[90vh] overflow-y-auto` scroll en móvil
- `flex flex-col sm:flex-row` botones apilados/lado a lado

---

## 🎯 Checklist Para Nuevos Componentes

- ✅ Usar breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- ✅ Padding responsivo: `p-3 sm:p-6`
- ✅ Texto responsivo: `text-sm sm:text-base`
- ✅ Ocultar/mostrar: `hidden sm:flex`, `sm:hidden`
- ✅ Flexbox dual: `flex-col sm:flex-row`
- ✅ Grid responsivo: `grid-cols-1 sm:grid-cols-2`
- ✅ Min-width: `min-w-0` en flex containers
- ✅ Truncate: `truncate` para textos largos
- ✅ Gap responsivo: `gap-2 sm:gap-4`
- ✅ Iconos: Escalados `size-16 sm:size-20`

---

## 📚 Referencia Rápida

```css
/* Mostrar/Ocultar por breakpoint */
.hidden              → Oculto
.hidden sm:flex      → Oculto móvil, visible sm+
.sm:hidden           → Visible móvil, oculto sm+
.hidden lg:block     → Oculto hasta lg
.lg:hidden           → Oculto en lg+

/* Tamaños */
.text-xs             → 12px
.text-sm             → 14px
.text-base           → 16px
.text-lg             → 18px
.text-xl             → 20px

/* Espaciado */
.p-3 sm:p-6          → 12px móvil, 24px desktop
.gap-2 sm:gap-4      → 8px móvil, 16px desktop
.mb-3 sm:mb-6        → 12px móvil, 24px desktop

/* Flexbox */
.flex-col            → Columna
.flex-col sm:flex-row→ Columna móvil, fila desktop
.flex-1              → Ancho igual
.flex-shrink-0       → No encoge

/* Otros */
.truncate            → Trunca texto
.min-w-0             → Previene overflow
.w-full sm:w-auto    → Ancho 100% móvil, auto desktop
```

---

**¡Usa estos patrones como referencia para mantener consistencia en toda la aplicación!**

Última actualización: 11 de Febrero 2026
