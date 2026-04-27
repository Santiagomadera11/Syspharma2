export const PERMISSIONS_CONFIG = [
  // =====================================================
  // USUARIOS
  // =====================================================
  {
    id: "users.view",
    label: "Ver usuarios",
    description: "Permite ver la lista de usuarios",
    category: "Usuarios",
  },
  {
    id: "users.create",
    label: "Crear usuarios",
    description: "Permite crear nuevos usuarios",
    category: "Usuarios",
  },
  {
    id: "users.edit",
    label: "Editar usuarios",
    description: "Permite modificar datos de usuarios",
    category: "Usuarios",
  },
  {
    id: "users.delete",
    label: "Eliminar usuarios",
    description: "Permite eliminar usuarios",
    category: "Usuarios",
  },

  // =====================================================
  // VENTAS
  // =====================================================
  {
    id: "sales.view",
    label: "Ver ventas",
    description: "Acceso a historial de ventas y reportes",
    category: "Ventas",
  },
  {
    id: "sales.create",
    label: "Nueva venta",
    description: "Permite generar nuevas ventas/facturas",
    category: "Ventas",
  },
  {
    id: "sales.orders",
    label: "Gestionar pedidos",
    description: "Ver, crear y editar pedidos de clientes",
    category: "Ventas",
  },

  // =====================================================
  // COMPRAS / INVENTARIO
  // =====================================================
  {
    id: "purchase.view",
    label: "Ver compras",
    description: "Acceso al historial de compras",
    category: "Compras/Inventario",
  },
  {
    id: "purchase.create",
    label: "Nueva compra",
    description: "Permite registrar nuevas compras",
    category: "Compras/Inventario",
  },
  {
    id: "inven.view",
    label: "Inventario",
    description: "Ver stock y gestionar productos",
    category: "Compras/Inventario",
  },

  // =====================================================
  // SERVICIOS
  // =====================================================
  {
    id: "services.view",
    label: "Ver citas",
    description: "Acceso a la lista de citas y servicios",
    category: "Servicios",
  },
  {
    id: "services.manage",
    label: "Gestionar agenda",
    description: "Programar, editar y cancelar citas",
    category: "Servicios",
  },

  // =====================================================
  // REPORTES
  // =====================================================
  {
    id: "reports.view",
    label: "Ver reportes",
    description: "Acceso a reportes y análisis del sistema",
    category: "Reportes",
  },

  // =====================================================
  // SISTEMA
  // =====================================================
  {
    id: "system.roles",
    label: "Gestionar Roles",
    description: "Crear, editar y eliminar roles de usuario",
    category: "Sistema",
  },
  {
    id: "system.config",
    label: "Parámetros",
    description: "Modificar configuración general del sistema",
    category: "Sistema",
  },
];
