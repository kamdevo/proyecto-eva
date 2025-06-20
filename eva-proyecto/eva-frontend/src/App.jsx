<<<<<<< HEAD
import React from "react";
import { PlanesMantenimientoView } from "./components/planes-mantenimiento-view";
import MyTickets from "./components/MyTickets";
function App() {
  return (
    <div className="App">
      <MyTickets />
    </div>
  );
}

export default App;
=======
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

// Importa tus vistas
import ContingenciesView from './components/contingencies-view';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import ManualesView from './components/manuales-view';
import MedicalDevicesView from './components/medical-devices-view';
import PlanesMantenimientoView from './components/planes-mantenimiento-view';
import PurchaseOrdersView from './components/purchase-orders-view';
import ProfilePage from './components/ProfilePage';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
        {/* Menú de navegación */}
        <nav className="mb-6 flex flex-wrap gap-4">
          <Link className="text-blue-600 dark:text-blue-400 hover:underline" to="/">Inicio</Link>
          <Link className="text-blue-600 dark:text-blue-400 hover:underline" to="/login">Login</Link>
          <Link className="text-blue-600 dark:text-blue-400 hover:underline" to="/contingencias">Contingencias</Link>
          <Link className="text-blue-600 dark:text-blue-400 hover:underline" to="/manuales">Manuales</Link>
          <Link className="text-blue-600 dark:text-blue-400 hover:underline" to="/dispositivos-medicos">Dispositivos Médicos</Link>
          <Link className="text-blue-600 dark:text-blue-400 hover:underline" to="/planes-mantenimiento">Planes de Mantenimiento</Link>
          <Link className="text-blue-600 dark:text-blue-400 hover:underline" to="/ordenes-compra">Órdenes de Compra</Link>
          <Link className="text-blue-600 dark:text-blue-400 hover:underline" to="/perfil">Perfil</Link>
        </nav>

        {/* Rutas */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/contingencias" element={<ContingenciesView />} />
          <Route path="/manuales" element={<ManualesView />} />
          <Route path="/dispositivos-medicos" element={<MedicalDevicesView />} />
          <Route path="/planes-mantenimiento" element={<PlanesMantenimientoView />} />
          <Route path="/ordenes-compra" element={<PurchaseOrdersView />} />
          <Route path="/perfil" element={<ProfilePage />} />
        </Routes>
      </div>
    </Router>
  );
}
>>>>>>> 23637563b083878132f45728b67ce7eb51159446
