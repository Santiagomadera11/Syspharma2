import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

/* -------------------------------------------------------------------------- */
/*                           IMPORTACIONES PÚBLICAS                           */
/* -------------------------------------------------------------------------- */
import { LandingPage } from "../features/landing/LandingPage";
import { CatalogPage } from "../features/landing/CatalogPage";
// Renombramos la pública para no confundirla con la de gestión interna
import { ServicesPage as PublicServicesPage } from "../features/landing/ServicesPage";
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

// --- PÁGINAS DE INVENTARIO (ADMIN) ---
import { ProductsPage } from "../features/inventory/products/ProductsPage";
import NewProductPage from "../features/inventory/products/NewProductPage";
import { PurchasesPage } from "../features/inventory/purchases/PurchasesPage";
import { CategoriesPage } from "../features/inventory/categories/CategoriesPage";
import { ProvidersPage } from "../features/inventory/providers/ProvidersPage";

// --- PÁGINAS DE SERVICIOS Y CITAS (ADMIN) ---
import { ServicesPage } from "../features/services/ServicesPage";
import { AppointmentsPage } from "../features/services/appointments/AppointmentsPage";
import { AvailabilityConfigPage } from "../features/services/appointments/AvailabilityConfigPage";
import DoctorsPage from "../features/services/doctors/DoctorsPage";
import { CreateOrderPage } from "../features/sales/orders/CreateOrderPage";
import { CartProductsPage } from "../features/sales/orders/CartProductsPage";
import { AdminPedidos } from "../features/sales/orders/AdminPedidos";

/* -------------------------------------------------------------------------- */
/*                       SISTEMA DE EMPLEADO                                  */
/* -------------------------------------------------------------------------- */
import EmployeeInicio from "../features/employee/EmployeeInicio";
import EmployeeCompras from "../features/employee/EmployeeCompras";
import EmployeeSalesPage from "../features/employee/EmployeeSalesPage";
import EmployeeProductos from "../features/employee/EmployeeProductos";
import EmployeePedidos from "../features/employee/EmployeePedidos";
import EmployeeCitas from "../features/employee/EmployeeCitas";
// ✅ Importamos la nueva página de servicios para empleados
import { EmployeeServicesPage } from "../features/employee/EmployeeServicesPage";
// ✅ Importamos la página de citas para empleados
import { EmployeeAppointmentsPage } from "../features/employee/EmployeeAppointmentsPage";

/* -------------------------------------------------------------------------- */
/*                      SISTEMA DE REPORTES (ADMIN)                           */
/* -------------------------------------------------------------------------- */
import { ShiftHistoryReportsPage } from "../features/admin/reports/ShiftHistoryReportsPage";
import { SalesPerformanceReportsPage } from "../features/admin/reports/SalesPerformanceReportsPage";

/* -------------------------------------------------------------------------- */
/*                         SISTEMA DE CLIENTE                                 */
/* -------------------------------------------------------------------------- */
import ClientCatalogo from "../features/client/ClientCatalogo";
import ClientInicio from "../features/client/ClientInicio";
import ClientProductos from "../features/client/ClientProductos";
import ClientMisPedidos from "../features/client/ClientMisPedidos";
import ClientMisCitas from "../features/client/ClientMisCitas";
import ClientMiPerfil from "../features/client/ClientMiPerfil";
import FavoritosPage from "../features/client/FavoritosPage";
import CarritoPage from "../features/client/CarritoPage";

/* -------------------------------------------------------------------------- */
/*                 COMPONENTES TEMPORALES (PLACEHOLDERS)                      */
/* -------------------------------------------------------------------------- */

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* =================================================================
            ZONA PÚBLICA
           ================================================================= */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/productos" element={<CatalogPage />} />
        <Route path="/servicios" element={<PublicServicesPage />} />
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
          <Route
            path="usuarios"
            element={
              <ProtectedRoute requiredPerm="users.view">
                <UsersPage />
              </ProtectedRoute>
            }
          />

          {/* --- MÓDULO DE COMPRAS & INVENTARIO --- */}
          <Route
            path="compras"
            element={
              <ProtectedRoute requiredPerm="inven.view">
                <PurchasesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="productos"
            element={
              <ProtectedRoute requiredPerm="inven.view">
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="productos/nuevo"
            element={
              <ProtectedRoute requiredPerm="inven.create">
                <NewProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="categorias"
            element={
              <ProtectedRoute requiredPerm="inven.view">
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="proveedores"
            element={
              <ProtectedRoute requiredPerm="inven.view">
                <ProvidersPage />
              </ProtectedRoute>
            }
          />

          {/* --- MÓDULO DE VENTAS --- */}
          <Route
            path="ventas"
            element={
              <ProtectedRoute requiredPerm="billing.view">
                <SalesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="ventas/nueva"
            element={
              <ProtectedRoute requiredPerm="billing.create">
                <CreateOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="ventas/nueva/productos"
            element={
              <ProtectedRoute requiredPerm="billing.create">
                <CartProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="pedidos"
            element={
              <ProtectedRoute requiredPerm="billing.view">
                <AdminPedidos />
              </ProtectedRoute>
            }
          />
          <Route
            path="pedidos/crear"
            element={
              <ProtectedRoute requiredPerm="billing.create">
                <CreateOrderPage />
              </ProtectedRoute>
            }
          />

          {/* --- MÓDULO DE SERVICIOS & CITAS --- */}
          <Route
            path="servicios"
            element={
              <ProtectedRoute requiredPerm="services.view">
                <ServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="citas"
            element={
              <ProtectedRoute requiredPerm="services.view">
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="citas/disponibilidad"
            element={
              <ProtectedRoute requiredPerm="services.manage">
                <AvailabilityConfigPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="medicos"
            element={
              <ProtectedRoute requiredPerm="services.manage">
                <DoctorsPage />
              </ProtectedRoute>
            }
          />

          {/* --- MÓDULO DE REPORTES --- */}
          <Route path="reportes/turnos" element={<ShiftHistoryReportsPage />} />
          <Route
            path="reportes/desempeño"
            element={<SalesPerformanceReportsPage />}
          />
          <Route path="mi-perfil" element={<ClientMiPerfil />} />

          {/* --- SISTEMA --- */}
          <Route
            path="configuracion"
            element={
              <ProtectedRoute requiredPerm="system.view">
                <SettingsPage />
              </ProtectedRoute>
            }
          />
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

          {/* Operaciones */}
          <Route
            path="compras"
            element={<EmployeeCompras />}
            requiredPerm="inven.view"
          />
          <Route
            path="ventas"
            element={<EmployeeSalesPage />}
            requiredPerm="billing.view"
          />
          <Route
            path="ventas/nueva"
            element={
              <ProtectedRoute requiredPerm="billing.create">
                <CreateOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="ventas/nueva/productos"
            element={
              <ProtectedRoute requiredPerm="billing.create">
                <CartProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="productos"
            element={<EmployeeProductos />}
            requiredPerm="inven.view"
          />
          <Route
            path="pedidos"
            element={<EmployeePedidos />}
            requiredPerm="billing.view"
          />
          <Route
            path="pedidos/crear"
            element={
              <ProtectedRoute requiredPerm="billing.create">
                <CreateOrderPage />
              </ProtectedRoute>
            }
          />

          {/* ✅ NUEVA RUTA: Servicios del Empleado */}
          <Route path="servicios" element={<EmployeeServicesPage />} />

          {/* ✅ NUEVA RUTA: Citas del Empleado */}
          <Route path="citas" element={<EmployeeAppointmentsPage />} />
          <Route path="mi-perfil" element={<ClientMiPerfil />} />
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
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<ClientInicio />} />
          <Route path="catalogo" element={<ClientCatalogo />} />
          <Route path="productos" element={<ClientProductos />} />
          <Route path="favoritos" element={<FavoritosPage />} />
          <Route path="carrito" element={<CarritoPage />} />
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
//hola :D
