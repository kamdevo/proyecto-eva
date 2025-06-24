import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

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
export default function App() {
  return (
    <>
      {" "}
      <Router>
        <Navbar />
        {/* ProfilePage route without padding */}
        <Routes>
          <Route path="/perfil" element={<ProfilePage />} />
        </Routes>

        {/* Main content wrapper with top padding to avoid navbar overlap */}
        <div className="pt-16">
          {/* Other routes */}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/equipos/contingencias"
              element={<ContingenciesView />}
            />
            <Route path="/equipos/manuales" element={<ManualesView />} />
            <Route
              path="/equipos/biomedicos"
              element={<MedicalDevicesView />}
            />
            <Route
              path="/planes/preventivo"
              element={<PlanesMantenimientoView />}
            />
            <Route path="/repuestos" element={<RepuestosView />} />
            <Route
              path="/equipos/industriales"
              element={<IndustrialDevicesView />}
            />
            <Route path="/equipos/bajas" element={<EquiposBajas />} />
            <Route path="/equipos/guias-rapidas" element={<GuiasRapidas />} />
            <Route
              path="/equipos/ordenes-compra"
              element={<PurchaseOrdersView />}
            />

            <Route path="/ordenes/mis-tickets" element={<MyTickets />} />
            <Route
              path="/ordenes/tickets-cerrados"
              element={<ClosedTickets />}
            />
            <Route
              path="/ordenes/gestion-tickets"
              element={<GestionTickets />}
            />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/dashboard/reportes" element={<DashboardView />} />
            <Route path="/config/contactos" element={<ContactsView />} />
            <Route path="/dashboard/graficas" element={<ControlPanel />} />
            <Route path="/config/areas" element={<VistaAreasPrincipal />} />
            <Route
              path="/admin/propietarios"
              element={<VistaPropietariosPrincipal />}
            />
            <Route path="/admin/usuarios" element={<Usuarios />} />
            <Route
              path="/config/servicios"
              element={<VistaServiciosPrincipal />}
            />
            <Route path="/capacitaciones" element={<CapacitacionesView />} />
          </Routes>

          <Footer />
        </div>
      </Router>
    </>
  );
}
