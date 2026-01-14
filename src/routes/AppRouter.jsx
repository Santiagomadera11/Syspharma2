import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*                           IMPORTACIONES PÚBLICAS                           */
/* -------------------------------------------------------------------------- */
import { LandingPage } from '../features/landing/LandingPage';
import { CatalogPage } from '../features/landing/CatalogPage';
import { ServicesPage } from '../features/landing/ServicesPage';
import { ContactPage } from '../features/landing/ContactPage';

/* -------------------------------------------------------------------------- */
/*                                AUTENTICACIÓN                               */
/* -------------------------------------------------------------------------- */
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';

/* -------------------------------------------------------------------------- */
/*                          SISTEMA ADMINISTRATIVO                            */
/* -------------------------------------------------------------------------- */
import DashboardLayout from '../layouts/DashboardLayout';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { UsersPage } from '../features/users/UsersPage';

/* --- MÓDULO DE INVENTARIO / COMPRAS --- */
import { PurchasesPage } from '../features/inventory/purchases/PurchasesPage'; // Listado de Compras
import { ProductsPage } from '../features/inventory/products/ProductsPage';   // Productos
import { CategoriesPage } from '../features/inventory/categories/CategoriesPage'; // Categorías
import { ProvidersPage } from '../features/inventory/providers/ProvidersPage';   // Proveedores

/* --- MÓDULO DE SERVICIOS --- */
import { AppointmentsPage } from '../features/services/appointments/AppointmentsPage'; // Citas Médicas

/* -------------------------------------------------------------------------- */
/*                 COMPONENTES TEMPORALES (PLACEHOLDERS)                      */
/*       (Se reemplazarán cuando programemos Ventas y Configuración)          */
/* -------------------------------------------------------------------------- */

const ModuloVentas = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold text-gray-800">Panel de Ventas</h1>
    <p className="text-sm text-gray-500">Métricas y flujo de caja.</p>
  </div>
);

const ModuloServicios = () => (
  <div className="p-4">
    <h1 className="text-xl font-bold text-gray-800">Gestión de Servicios</h1>
    <p className="text-sm text-gray-500">Selecciona una opción del menú desplegable.</p>
  </div>
);

const Pedidos = () => <h1 className="text-lg font-bold p-4">Gestión de Pedidos</h1>;
const Configuracion = () => <h1 className="text-lg font-bold p-4">Configuración del Sistema</h1>;

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
        <Route path="/admin" element={<DashboardLayout />}>
          
          {/* Redirección inicial */}
          <Route index element={<Navigate to="dashboard" replace />} />
          
          {/* Dashboard General */}
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Gestión de Usuarios */}
          <Route path="usuarios" element={<UsersPage />} />
          
          {/* --- MÓDULO DE COMPRAS / INVENTARIO --- */}
          <Route path="compras" element={<PurchasesPage />} /> 
          <Route path="productos" element={<ProductsPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="proveedores" element={<ProvidersPage />} />
          
          {/* --- MÓDULO DE VENTAS --- */}
          <Route path="ventas" element={<ModuloVentas />} />
          <Route path="pedidos" element={<Pedidos />} />
          
          {/* --- MÓDULO DE SERVICIOS --- */}
          <Route path="servicios" element={<ModuloServicios />} />
          <Route path="citas" element={<AppointmentsPage />} /> {/* <--- RUTA DE CITAS CONECTADA */}
          
          {/* --- SISTEMA --- */}
          <Route path="configuracion" element={<Configuracion />} />

        </Route>

        {/* =================================================================
            Ruta 404
           ================================================================= */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
};