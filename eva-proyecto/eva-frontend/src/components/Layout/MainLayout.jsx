import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import './MainLayout.css';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="main-layout">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        onToggleSidebar={toggleSidebar}
        sidebarOpen={sidebarOpen}
      />
      <div className="layout-content">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
