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
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { UsersPage } from "../features/users/UsersPage";
import { ProductsPage } from "../features/inventory/products/ProductsPage";
import SettingsPage from "../features/settings/SettingsPage";
import SalesPage from "../features/sales/SalesPage";

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

// --- Módulos Principales (Resumen) ---
const ModuloCompras = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold text-gray-800">Panel de Compras</h1>
    <p className="text-sm text-gray-500">Resumen general de adquisiciones.</p>
  </div>
);

const ModuloVentas = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold text-gray-800">Panel de Ventas</h1>
    <p className="text-sm text-gray-500">Métricas y flujo de caja.</p>
  </div>
);

const ModuloServicios = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold text-gray-800">Gestión de Servicios</h1>
    <p className="text-sm text-gray-500">Control de citas y procedimientos.</p>
  </div>
);

// --- Sub-Módulos pendientes ---
const Categorias = () => <h1 className="text-lg font-bold p-4">Categorías</h1>;
const Proveedores = () => (
  <h1 className="text-lg font-bold p-4">Proveedores</h1>
);
const Pedidos = () => (
  <h1 className="text-lg font-bold p-4">Gestión de Pedidos</h1>
);
const Citas = () => (
  <h1 className="text-lg font-bold p-4">Agenda de Citas Médicas</h1>
);
// La vista de configuración real está en src/features/settings/SettingsPage.jsx

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
          {/* Gestión de Usuarios (Ya programado) */}
          <Route path="usuarios" element={<UsersPage />} />
          {/* --- RUTAS PRINCIPALES DE LOS MÓDULOS --- */}
          <Route path="compras" element={<ModuloCompras />} />
          <Route path="ventas" element={<SalesPage />} />
          <Route path="servicios" element={<ModuloServicios />} />
          {/* --- INVENTARIO / COMPRAS --- */}
          <Route path="productos" element={<ProductsPage />} />{" "}
          {/* <--- RUTA REAL CONECTADA */}
          <Route path="categorias" element={<Categorias />} />
          <Route path="proveedores" element={<Proveedores />} />
          {/* --- VENTAS --- */}
          <Route path="pedidos" element={<Pedidos />} />
          {/* --- SERVICIOS --- */}
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
          <Route path="productos" element={<EmployeeProductos />} />
          <Route path="pedidos" element={<EmployeePedidos />} />
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
            Ruta 404
           ================================================================= */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};
