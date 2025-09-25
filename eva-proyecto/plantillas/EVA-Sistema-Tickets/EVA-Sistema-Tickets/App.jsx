import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar";
import { TicketsProvider } from "./context/TicketsContext";

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
import TestView from "./components/TestView";
import { useLocation } from "react-router-dom";

// Componente interno que usa useLocation
function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <TicketsProvider>
      <SidebarProvider>
        {!isLoginPage && <Navbar />}

        <SidebarInset>
        <Routes>
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/" element={<div className={isLoginPage ? "" : "pt-16"}><LoginForm />{!isLoginPage && <Footer />}</div>} />
          <Route path="/home" element={<div className="pt-16"><HomePage /><Footer /></div>} />
          <Route path="/equipos/contingencias" element={<div className="pt-16"><ContingenciesView /><Footer /></div>} />
          <Route path="/equipos/manuales" element={<div className="pt-16"><ManualesView /><Footer /></div>} />
          <Route path="/equipos/biomedicos" element={<div className="pt-16"><MedicalDevicesView /><Footer /></div>} />
          <Route path="/planes/preventivo" element={<div className="pt-16"><PlanesMantenimientoView /><Footer /></div>} />
          <Route path="/repuestos" element={<div className="pt-16"><RepuestosView /><Footer /></div>} />
          <Route path="/equipos/industriales" element={<div className="pt-16"><IndustrialDevicesView /><Footer /></div>} />
          <Route path="/equipos/bajas" element={<div className="pt-16"><EquiposBajas /><Footer /></div>} />
          <Route path="/equipos/guias-rapidas" element={<div className="pt-16"><GuiasRapidas /><Footer /></div>} />
          <Route path="/equipos/ordenes-compra" element={<div className="pt-16"><PurchaseOrdersView /><Footer /></div>} />
          <Route path="/ordenes/mis-tickets" element={<div className="pt-16"><MyTickets /><Footer /></div>} />
          <Route path="/ordenes/tickets-cerrados" element={<div className="pt-16"><ClosedTickets /><Footer /></div>} />
          <Route path="/ordenes/gestion-tickets" element={<div className="pt-16"><GestionTickets /><Footer /></div>} />
          <Route path="/dashboard" element={<div className="pt-16"><DashboardView /><Footer /></div>} />
          <Route path="/dashboard/reportes" element={<div className="pt-16"><DashboardView /><Footer /></div>} />
          <Route path="/config/contactos" element={<div className="pt-16"><ContactsView /><Footer /></div>} />
          <Route path="/dashboard/graficas" element={<div className="pt-16"><ControlPanel /><Footer /></div>} />
          <Route path="/config/areas" element={<div className="pt-16"><VistaAreasPrincipal /><Footer /></div>} />
          <Route path="/admin/propietarios" element={<div className="pt-16"><VistaPropietariosPrincipal /><Footer /></div>} />
          <Route path="/admin/usuarios" element={<div className="pt-16"><Usuarios /><Footer /></div>} />
          <Route path="/config/servicios" element={<div className="pt-16"><VistaServiciosPrincipal /><Footer /></div>} />
          <Route path="/capacitaciones" element={<div className="pt-16"><CapacitacionesView /><Footer /></div>} />
          <Route path="/test" element={<div className="pt-16"><TestView /><Footer /></div>} />
        </Routes>
        </SidebarInset>
      </SidebarProvider>
    </TicketsProvider>
  );
}

// Componente principal que envuelve todo en Router
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
