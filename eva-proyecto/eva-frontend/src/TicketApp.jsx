/**
 * ========================================
 * TICKET APP - SISTEMA EVA
 * ========================================
 * 
 * Aplicación simplificada para los 3 componentes de tickets
 * - ClosedTickets
 * - GestionTickets  
 * - MyTickets
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// Importar los 3 componentes principales
import ClosedTickets from './components/Prueba tokects/ClosedTickets';
import GestionTickets from './components/Prueba tokects/GestionTickets';
import MyTickets from './components/Prueba tokects/MyTickets';

// Iconos
import { 
  FolderOpen, 
  Settings, 
  Plus, 
  Home,
  FileText,
  Users,
  Building
} from 'lucide-react';

// Componente de navegación principal
const TicketNavigation = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema EVA - Gestión de Tickets
          </h1>
          <p className="text-lg text-gray-600">
            Selecciona el módulo de tickets que deseas utilizar
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* ClosedTickets Card */}
          <Link to="/closed-tickets" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 hover:border-blue-300">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <FolderOpen className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Tickets Cerrados
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Consulta y gestiona tickets que han sido cerrados y completados
              </p>
              <div className="mt-4 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Consulta
                </span>
              </div>
            </div>
          </Link>

          {/* GestionTickets Card */}
          <Link to="/gestion-tickets" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 hover:border-green-300">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-lg mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Settings className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Gestión de Tickets
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Administra tickets activos, asigna técnicos y actualiza estados
              </p>
              <div className="mt-4 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Gestión
                </span>
              </div>
            </div>
          </Link>

          {/* MyTickets Card */}
          <Link to="/my-tickets" className="group">
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 hover:border-orange-300">
              <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-lg mx-auto mb-4 group-hover:bg-orange-200 transition-colors">
                <Plus className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
                Mis Tickets
              </h3>
              <p className="text-gray-600 text-center text-sm">
                Crea nuevos tickets para equipos biomédicos, industriales e infraestructura
              </p>
              <div className="mt-4 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Creación
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Overview */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Características del Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Gestión Completa</h4>
              <p className="text-sm text-gray-600">
                CRUD completo para todos los tipos de tickets
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Asignación de Técnicos</h4>
              <p className="text-sm text-gray-600">
                Asigna técnicos especializados por área
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-3">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Multi-Área</h4>
              <p className="text-sm text-gray-600">
                Biomédicos, Industriales e Infraestructura
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
            Estado del Sistema
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">3</div>
              <div className="text-sm text-gray-600">Módulos Activos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">100%</div>
              <div className="text-sm text-gray-600">Funcionalidad</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">✓</div>
              <div className="text-sm text-gray-600">Backend Integrado</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">✓</div>
              <div className="text-sm text-gray-600">Responsive</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de navegación superior para las páginas internas
const TopNavigation = ({ currentPage }) => {
  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/closed-tickets', label: 'Tickets Cerrados', icon: FolderOpen },
    { path: '/gestion-tickets', label: 'Gestión', icon: Settings },
    { path: '/my-tickets', label: 'Mis Tickets', icon: Plus },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Sistema EVA</span>
            </Link>
            
            <div className="hidden md:flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Wrapper para componentes con navegación
const PageWrapper = ({ children, currentPage }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavigation currentPage={currentPage} />
      <main>
        {children}
      </main>
    </div>
  );
};

// Componente principal de la aplicación
const TicketApp = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Página principal de navegación */}
          <Route path="/" element={<TicketNavigation />} />
          
          {/* Componente ClosedTickets */}
          <Route 
            path="/closed-tickets" 
            element={
              <PageWrapper currentPage="/closed-tickets">
                <ClosedTickets />
              </PageWrapper>
            } 
          />
          
          {/* Componente GestionTickets */}
          <Route 
            path="/gestion-tickets" 
            element={
              <PageWrapper currentPage="/gestion-tickets">
                <GestionTickets />
              </PageWrapper>
            } 
          />
          
          {/* Componente MyTickets */}
          <Route 
            path="/my-tickets" 
            element={
              <PageWrapper currentPage="/my-tickets">
                <MyTickets />
              </PageWrapper>
            } 
          />
          
          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#333',
              border: '1px solid #e5e7eb',
            },
          }}
        />
      </div>
    </Router>
  );
};

export default TicketApp;
