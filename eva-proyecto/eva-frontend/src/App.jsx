import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthProvider as PermissionAuthProvider } from "./hooks/useAuth.jsx";
import { ToastProvider } from "./contexts/ToastContext";
import { EquipmentSearchProvider } from "./contexts/EquipmentSearchContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Importa tus vistas
import ContingenciesView from "./components/contingencies-view";
import HomePage from "./components/HomePage";
import LoginForm from "./components/LoginForm";
import ManualesView from "./components/manuales-view";
import MedicalDevicesView from "./components/medical-devices-view";
import PlanesMantenimientoView from "./components/planes-mantenimiento-view";
import PurchaseOrdersView from "./components/purchase-orders-view";
import ProfilePage from "./components/ProfilePage";
import MyTickets from "./components/MyTickets";
import ClosedTickets from "./components/ClosedTickets";
import DashboardView from "./components/Dashboard";
import ContactsView from "./components/Contacts";
import ControlPanel from "./components/control-panel";
import VistaAreasPrincipal from "./components/vista-areas";
import VistaPropietariosPrincipal from "./components/vista-propietarios-principal";
import VistaServiciosPrincipal from "./components/vista-servicios-principal";
import Usuarios from "./components/Usuarios";
import Navbar from "./components/Navbar";
import IndustrialDevicesView from "./components/IndustrialDevices";
import GestionTickets from "./components/GestionTickets";
import Footer from "./components/Footer";
import EquiposBajas from "./components/EquiposBajas";
import GuiasRapidas from "./components/GuiasRapidas";
import RepuestosView from "./components/RepuestosView";
import CapacitacionesView from "./components/CapacitacionesView";
import ConsultaIndustrialView from "./components/ConsultaIndustrialView";
import DebugRegistration from "./components/DebugRegistration";
import CompleteDebugTest from "./components/CompleteDebugTest";
import LogoutPage from "./components/LogoutPage";
import { useLocation } from "react-router-dom";

// Componente interno que usa useLocation
function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <SidebarProvider>
      {!isLoginPage && <Navbar />}

      <SidebarInset>
        {/* Main content wrapper with conditional padding */}
        <div className={isLoginPage ? "" : "pt-16"}>
          {/* All routes */}
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute requireAuth={false}>
                  <LoginForm />
                </ProtectedRoute>
              }
            />
            {/* Redirect /login to / for compatibility */}
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={true}>
                  <LoginForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/salir"
              element={
                <ProtectedRoute>
                  <LogoutPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipos/contingencias"
              element={
                <ProtectedRoute>
                  <ContingenciesView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipos/manuales"
              element={
                <ProtectedRoute>
                  <ManualesView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipos/biomedicos"
              element={
                <ProtectedRoute>
                  <MedicalDevicesView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/planes/preventivo"
              element={
                <ProtectedRoute>
                  <PlanesMantenimientoView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/repuestos"
              element={
                <ProtectedRoute>
                  <RepuestosView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipos/industriales"
              element={
                <ProtectedRoute>
                  <IndustrialDevicesView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipos/bajas"
              element={
                <ProtectedRoute>
                  <EquiposBajas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipos/guias-rapidas"
              element={
                <ProtectedRoute>
                  <GuiasRapidas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipos/consultas"
              element={
                <ProtectedRoute>
                  <ConsultaIndustrialView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/equipos/ordenes-compra"
              element={
                <ProtectedRoute>
                  <PurchaseOrdersView />
                </ProtectedRoute>
              }
            />

            <Route
              path="/ordenes/mis-tickets"
              element={
                <ProtectedRoute>
                  <MyTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ordenes/tickets-cerrados"
              element={
                <ProtectedRoute>
                  <ClosedTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ordenes/gestion-tickets"
              element={
                <ProtectedRoute>
                  <GestionTickets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/reportes"
              element={
                <ProtectedRoute>
                  <DashboardView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/config/contactos"
              element={
                <ProtectedRoute>
                  <ContactsView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/graficas"
              element={
                <ProtectedRoute>
                  <ControlPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/config/areas"
              element={
                <ProtectedRoute>
                  <VistaAreasPrincipal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/propietarios"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <VistaPropietariosPrincipal />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute>
                  <AdminRoute>
                    <Usuarios />
                  </AdminRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/config/servicios"
              element={
                <ProtectedRoute>
                  <VistaServiciosPrincipal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/capacitaciones"
              element={
                <ProtectedRoute>
                  <CapacitacionesView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/debug/register"
              element={
                <ProtectedRoute requireAuth={false}>
                  <DebugRegistration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/debug/complete"
              element={
                <ProtectedRoute requireAuth={false}>
                  <CompleteDebugTest />
                </ProtectedRoute>
              }
            />
          </Routes>

          {!isLoginPage && <Footer />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Componente principal que envuelve todo en Router
export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <PermissionAuthProvider>
            <EquipmentSearchProvider>
              <AppContent />
            </EquipmentSearchProvider>
          </PermissionAuthProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
