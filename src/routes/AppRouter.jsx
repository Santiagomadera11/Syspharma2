import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* -------------------------------------------------------------------------- */
/*                           IMPORTACIONES PÚBLICAS                           */
/* -------------------------------------------------------------------------- */
import { LandingPage } from "../features/landing/LandingPage";
import { CatalogPage } from "../features/landing/CatalogPage";
import { ServicesPage } from "../features/landing/ServicesPage";
import { ContactPage } from "../features/landing/ContactPage";

/* -------------------------------------------------------------------------- */
/*                                AUTENTICACIÓN                               */
/* -------------------------------------------------------------------------- */
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";

/* -------------------------------------------------------------------------- */
/*                          SISTEMA ADMINISTRATIVO                            */
/* -------------------------------------------------------------------------- */
import DashboardLayout from "../layouts/DashboardLayout";
import EmployeeLayout from "../layouts/EmployeeLayout";
import ClientLayout from "../layouts/ClientLayout";
import ProtectedRoute from "./ProtectedRoute";

// --- PÁGINAS GENERALES ADMIN ---
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { UsersPage } from "../features/users/UsersPage";
import SettingsPage from "../features/settings/SettingsPage";
import SalesPage from "../features/sales/SalesPage";
import { OrdersPage } from "../features/sales/orders/OrdersPage";
import { CreateOrderPage } from "../features/sales/orders/CreateOrderPage";

// --- PÁGINAS DE INVENTARIO (YA CONECTADAS) ---
import { ProductsPage } from "../features/inventory/products/ProductsPage";
import { PurchasesPage } from "../features/inventory/purchases/PurchasesPage";
import { CategoriesPage } from "../features/inventory/categories/CategoriesPage";
import { ProvidersPage } from "../features/inventory/providers/ProvidersPage";

/* -------------------------------------------------------------------------- */
/*                       SISTEMA DE EMPLEADO                                  */
/* -------------------------------------------------------------------------- */
import EmployeeInicio from "../features/employee/EmployeeInicio";
import EmployeeCompras from "../features/employee/EmployeeCompras";
import EmployeeSalesPage from "../features/employee/EmployeeSalesPage";
import EmployeeProductos from "../features/employee/EmployeeProductos";
import EmployeePedidos from "../features/employee/EmployeePedidos";
import EmployeeCitas from "../features/employee/EmployeeCitas";

/* -------------------------------------------------------------------------- */
/*                         SISTEMA DE CLIENTE                                 */
/* -------------------------------------------------------------------------- */
import ClientCatalogo from "../features/client/ClientCatalogo";
import ClientProductos from "../features/client/ClientProductos";
import ClientMisPedidos from "../features/client/ClientMisPedidos";
import ClientMisCitas from "../features/client/ClientMisCitas";
import ClientMiPerfil from "../features/client/ClientMiPerfil";

/* -------------------------------------------------------------------------- */
/*                 COMPONENTES TEMPORALES (PLACEHOLDERS)                      */
/* -------------------------------------------------------------------------- */
// Estos módulos aún no los hemos creado completos, así que se mantienen como placeholders
const ModuloServicios = () => (
  <div className="p-6">
    <h1 className="text-xl font-bold text-gray-800">Gestión de Servicios</h1>
    <p className="text-sm text-gray-500">
      Control de procedimientos médicos y enfermería.
    </p>
  </div>
);

const Pedidos = () => (
  <div className="p-6">
    <h1 className="text-xl font-bold text-gray-800">Gestión de Pedidos</h1>
    <p className="text-sm text-gray-500">Bandeja de entrada de pedidos web.</p>
  </div>
);

const Citas = () => (
  <div className="p-6">
    <h1 className="text-xl font-bold text-gray-800">Agenda de Citas</h1>
    <p className="text-sm text-gray-500">Calendario de citas médicas.</p>
  </div>
);

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* =================================================================
            ZONA PÚBLICA
           ================================================================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/productos" element={<CatalogPage />} />
        <Route path="/servicios" element={<ServicesPage />} />
        <Route path="/contacto" element={<ContactPage />} />

        {/* =================================================================
            ZONA DE ACCESO
           ================================================================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        {/* =================================================================
            ZONA PRIVADA (Dashboard Admin)
           ================================================================= */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="Administrador">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Redirección inicial */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Dashboard General */}
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Gestión de Usuarios */}
          <Route path="usuarios" element={<UsersPage />} />

          {/* --- MÓDULO DE COMPRAS (Nuevo) --- */}
          <Route path="compras" element={<PurchasesPage />} />

          {/* --- MÓDULO DE VENTAS --- */}
          <Route path="ventas" element={<SalesPage />} />
          <Route path="ventas/nueva" element={<CreateOrderPage />} />
          <Route path="pedidos" element={<OrdersPage />} />
          <Route path="pedidos/crear" element={<CreateOrderPage />} />

          {/* --- MÓDULO DE INVENTARIO (Completo) --- */}
          <Route path="productos" element={<ProductsPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="proveedores" element={<ProvidersPage />} />

          {/* --- MÓDULO DE SERVICIOS --- */}
          <Route path="servicios" element={<ModuloServicios />} />
          <Route path="citas" element={<Citas />} />

          {/* --- SISTEMA --- */}
          <Route path="configuracion" element={<SettingsPage />} />
        </Route>

        {/* =================================================================
            ZONA PRIVADA (Panel Empleado)
           ================================================================= */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute requiredRole="Empleado">
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<EmployeeInicio />} />
          <Route path="compras" element={<EmployeeCompras />} />
          <Route path="ventas" element={<EmployeeSalesPage />} />
          <Route path="ventas/nueva" element={<CreateOrderPage />} />
          <Route path="productos" element={<EmployeeProductos />} />
          <Route path="pedidos" element={<EmployeePedidos />} />
          <Route path="pedidos/crear" element={<CreateOrderPage />} />
          <Route path="citas" element={<EmployeeCitas />} />
        </Route>

        {/* =================================================================
            ZONA PRIVADA (Panel Cliente)
           ================================================================= */}
        <Route
          path="/client"
          element={
            <ProtectedRoute requiredRole="Cliente">
              <ClientLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="catalogo" replace />} />
          <Route path="catalogo" element={<ClientCatalogo />} />
          <Route path="productos" element={<ClientProductos />} />
          <Route path="mis-pedidos" element={<ClientMisPedidos />} />
          <Route path="mis-citas" element={<ClientMisCitas />} />
          <Route path="mi-perfil" element={<ClientMiPerfil />} />
        </Route>

        {/* =================================================================
            Ruta 404 (Catch all)
           ================================================================= */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};
