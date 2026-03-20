import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import { AuthProvider as PermissionAuthProvider } from "./hooks/useAuth.jsx";
import { ToastProvider } from "./contexts/ToastContext";
import { EquipmentSearchProvider } from "./contexts/EquipmentSearchContext";
import { TicketsProvider } from "./contexts/TicketsContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { useLocation } from "react-router-dom";

// Componentes críticos (no lazy)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// 🚀 Lazy loading de vistas para mejor rendimiento
const ContingenciesView = lazy(() => import("./components/contingencies-view"));
const HomePage = lazy(() => import("./components/HomePage"));
const LoginPage = lazy(() => import("./components/LoginPage"));
const ManualesView = lazy(() => import("./components/manuales-view"));
const MedicalDevicesView = lazy(() => import("./components/medical-devices-view"));
const PlanesMantenimientoView = lazy(() => import("./components/planes-mantenimiento-view"));
const PurchaseOrdersView = lazy(() => import("./components/purchase-orders-view"));
const ProfilePage = lazy(() => import("./components/ProfilePage"));
const MyTickets = lazy(() => import("./components/MyTickets"));
const ClosedTickets = lazy(() => import("./components/ClosedTickets"));
const DashboardView = lazy(() => import("./components/Dashboard"));
const DashboardReportes = lazy(() => import("./components/DashboardReportesFuncional"));
const ContactsView = lazy(() => import("./components/vista-contactos-principal"));
const ControlPanel = lazy(() => import("./components/control-panel"));
const VistaAreasPrincipal = lazy(() => import("./components/vista-areas-principal"));
const VistaPropietariosPrincipal = lazy(() => import("./components/vista-propietarios-principal"));
const VistaServiciosPrincipal = lazy(() => import("./components/vista-servicios-principal"));
const VistaTiposMantenimiento = lazy(() => import("./components/vista-tipos-mantenimiento"));
const Usuarios = lazy(() => import("./components/Usuarios"));
const IndustrialDevicesView = lazy(() => import("./components/IndustrialDevices"));
const GestionTickets = lazy(() => import("./components/GestionTickets"));
const EquiposBajas = lazy(() => import("./components/EquiposBajas"));
const GuiasRapidas = lazy(() => import("./components/GuiasRapidas"));
const RepuestosView = lazy(() => import("./components/RepuestosView"));
const CapacitacionesView = lazy(() => import("./components/CapacitacionesView"));
const ConsultaIndustrialView = lazy(() => import("./components/ConsultaIndustrialView"));
const VistaMateriales = lazy(() => import("./components/vista-materiales"));
const VistaSedes = lazy(() => import("./components/vista-sedes"));
const DebugRegistration = lazy(() => import("./components/DebugRegistration"));
const CompleteDebugTest = lazy(() => import("./components/CompleteDebugTest"));
const LogoutPage = lazy(() => import("./components/LogoutPage"));
const ConfirmarCuenta = lazy(() => import("./pages/ConfirmarCuenta"));
const ReenviarVerificacion = lazy(() => import("./pages/ReenviarVerificacion"));
const VerificacionPendiente = lazy(() => import("./pages/VerificacionPendiente"));

// Componente de loading
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-[#1d293d]/5">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1d293d] mx-auto mb-4"></div>
      <p className="text-slate-600 text-sm">Cargando...</p>
    </div>
  </div>
);


// Componente interno que usa useLocation
function AppContent() {
  const location = useLocation();
  // Páginas que NO deben tener sidebar/navbar (standalone)
  const standalonePages = [
    "/",
    "/login",
    "/confirmar-cuenta",
    "/verificacion-pendiente",
    "/resend-verification"
  ];
  const isStandalonePage = standalonePages.some(page =>
    location.pathname === page || location.pathname.startsWith(page + "/")
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      {/* Rutas standalone sin sidebar/navbar */}
      {isStandalonePage ? (
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/confirmar-cuenta/:token"
            element={
              <ProtectedRoute requireAuth={false}>
                <ConfirmarCuenta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/verificacion-pendiente"
            element={
              <ProtectedRoute requireAuth={false}>
                <VerificacionPendiente />
              </ProtectedRoute>
            }
          />
          <Route
            path="/resend-verification"
            element={
              <ProtectedRoute requireAuth={false}>
                <ReenviarVerificacion />
              </ProtectedRoute>
            }
          />
        </Routes>
      ) : (
        /* Rutas con sidebar/navbar (layout principal) */
        <SidebarProvider>
          <Navbar />
          <SidebarInset>
            <div className="pt-16">
              <Routes>
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
                      <DashboardReportes />
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
                  path={"/config/tipos-mantenimiento"}
                  element={
                    <ProtectedRoute>
                      <AdminRoute allowAdvanced={true}>
                        <VistaTiposMantenimiento />
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
                  path="/config/materiales"
                  element={
                    <ProtectedRoute>
                      <AdminRoute allowAdvanced={true}>
                        <VistaMateriales />
                      </AdminRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/config/sedes"
                  element={
                    <ProtectedRoute>
                      <AdminRoute allowAdvanced={true}>
                        <VistaSedes />
                      </AdminRoute>
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
              <div className="mt-6">
                <Footer />
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      )}
    </Suspense>
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
              <TicketsProvider>
                <AppContent />
              </TicketsProvider>
            </EquipmentSearchProvider>
          </PermissionAuthProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>

  );
}
