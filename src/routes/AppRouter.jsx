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
/*                               LAYOUTS Y SEGURIDAD                          */
/* -------------------------------------------------------------------------- */
import DashboardLayout from "../layouts/DashboardLayout";
import EmployeeLayout from "../layouts/EmployeeLayout";
import ClientLayout from "../layouts/ClientLayout";
import ProtectedRoute from "./ProtectedRoute";

/* -------------------------------------------------------------------------- */
/*                          SISTEMA ADMINISTRATIVO                            */
/* -------------------------------------------------------------------------- */
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { UsersPage } from "../features/users/UsersPage";

/* --- INVENTARIO / COMPRAS --- */
import { PurchasesPage } from "../features/inventory/purchases/PurchasesPage";
import { ProductsPage } from "../features/inventory/products/ProductsPage";
import { CategoriesPage } from "../features/inventory/categories/CategoriesPage";
import { ProvidersPage } from "../features/inventory/providers/ProvidersPage";

/* --- SERVICIOS --- */
import { AppointmentsPage } from "../features/services/appointments/AppointmentsPage";

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
const ModuloVentas = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold">Panel de Ventas</h1>
  </div>
);

const ModuloServicios = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold">Gestión de Servicios</h1>
  </div>
);

const Pedidos = () => <h1 className="p-4 font-bold">Gestión de Pedidos</h1>;
const Configuracion = () => <h1 className="p-4 font-bold">Configuración</h1>;

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ============================ ZONA PÚBLICA ============================ */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/productos" element={<CatalogPage />} />
        <Route path="/servicios" element={<ServicesPage />} />
        <Route path="/contacto" element={<ContactPage />} />

        {/* ============================ AUTENTICACIÓN ============================ */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />

        {/* ============================ ADMIN ============================ */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="Administrador">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="usuarios" element={<UsersPage />} />

          <Route path="compras" element={<PurchasesPage />} />
          <Route path="productos" element={<ProductsPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="proveedores" element={<ProvidersPage />} />

          <Route path="ventas" element={<ModuloVentas />} />
          <Route path="pedidos" element={<Pedidos />} />

          <Route path="servicios" element={<ModuloServicios />} />
          <Route path="citas" element={<AppointmentsPage />} />

          <Route path="configuracion" element={<Configuracion />} />
        </Route>

        {/* ============================ EMPLEADO ============================ */}
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
          <Route path="productos" element={<EmployeeProductos />} />
          <Route path="pedidos" element={<EmployeePedidos />} />
          <Route path="citas" element={<EmployeeCitas />} />
        </Route>

        {/* ============================ CLIENTE ============================ */}
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

        {/* ============================ 404 ============================ */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
};
