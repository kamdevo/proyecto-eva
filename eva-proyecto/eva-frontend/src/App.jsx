import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// Importa tus vistas
import ContingenciesView from "./components/contingencies-view";
import HomePage from "./components/HomePage";
<<<<<<< HEAD
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProfilePage from "./components/ProfilePage";

import IndustrialDevices from "./components/EquiposIndustriales";
const App = () => {
  return (
    <div>
      <Navbar />

      <ProfilePage />
    </div>
=======
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

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        {/* Menú de navegación */}
        <nav className="mb-6 flex flex-wrap gap-4">
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/"
          >
            Inicio
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/login"
          >
            Login
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/contingencias"
          >
            Contingencias
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/manuales"
          >
            Manuales
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/dispositivos-medicos"
          >
            Dispositivos Médicos
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/planes-mantenimiento"
          >
            Planes de Mantenimiento
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/ordenes-compra"
          >
            Órdenes de Compra
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/perfil"
          >
            Perfil
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/mis-tickets"
          >
            Mis Tickets
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/tickets-cerrados"
          >
            Tickets Cerrados
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/dashboard"
          >
            Dashboard
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/contacts"
          >
            Contactos
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/control-panel"
          >
            Panel de Control
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/areas"
          >
            Áreas
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/propietarios"
          >
            Propietarios
          </Link>
          <Link
            className="text-blue-600 dark:text-blue-400 hover:underline"
            to="/servicios"
          >
            Servicios
          </Link>
        </nav>

        {/* Rutas */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/contingencias" element={<ContingenciesView />} />
          <Route path="/manuales" element={<ManualesView />} />
          <Route
            path="/dispositivos-medicos"
            element={<MedicalDevicesView />}
          />
          <Route
            path="/planes-mantenimiento"
            element={<PlanesMantenimientoView />}
          />
          <Route path="/ordenes-compra" element={<PurchaseOrdersView />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/mis-tickets" element={<MyTickets />} />
          <Route path="/tickets-cerrados" element={<ClosedTickets />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/contacts" element={<ContactsView />} />
          <Route path="/control-panel" element={<ControlPanel />} />
          <Route path="/areas" element={<VistaAreasPrincipal />} />
          <Route
            path="/propietarios"
            element={<VistaPropietariosPrincipal />}
          />
          <Route path="/servicios" element={<VistaServiciosPrincipal />} />
        </Routes>
      </div>
    </Router>
>>>>>>> main
  );
}
