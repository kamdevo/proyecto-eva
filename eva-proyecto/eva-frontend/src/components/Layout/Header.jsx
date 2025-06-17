import React from 'react';
import { FaBars, FaUser, FaSignOutAlt, FaBell } from 'react-icons/fa';

const Header = ({ user, onLogout, onToggleSidebar, sidebarOpen }) => {
  return (
    <header className="main-header">
      <div className="header-left">
        <button 
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars />
        </button>
        <div className="logo-container">
          <h1>EVA - Sistema de Gestión</h1>
        </div>
      </div>
      
      <div className="header-right">
        <div className="notifications">
          <button className="notification-btn">
            <FaBell />
            <span className="notification-badge">3</span>
          </button>
        </div>
        
        <div className="user-menu">
          <div className="user-info">
            <FaUser className="user-icon" />
            <span className="user-name">{user?.nombre || 'Usuario'}</span>
          </div>
          <button 
            className="logout-btn"
            onClick={onLogout}
            title="Cerrar sesión"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
