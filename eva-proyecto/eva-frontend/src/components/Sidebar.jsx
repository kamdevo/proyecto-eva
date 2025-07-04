"use client";

import { useState } from "react";
import { Link } from "react-router-dom";

const Sidebar = ({
  activeView,
  setActiveView,
  sidebarOpen,
  setSidebarOpen,
}) => {
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "perfil", label: "Mi Perfil", icon: "👤" },
    { id: "reportes", label: "Reportes", icon: "📄" },
    { id: "evidencias", label: "Evidencias", icon: "📸" },
    { id: "archivos", label: "Archivos", icon: "📁" },
    {
      id: "equipos",
      label: "Equipos",
      icon: "🖥️",
      submenu: [{ id: "consultas", label: "Consultas", path: "/consultas" }],
    },
  ];

  return (
    <>
      <div
        className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🚀</span>
            <h2>Reportes Inovación</h2>
          </div>
          <button
            className="sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                {item.submenu ? (
                  <>
                    <button
                      className={`nav-item ${
                        expandedMenus[item.id] ? "expanded" : ""
                      }`}
                      onClick={() => toggleMenu(item.id)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      <span className="expand-icon">
                        {expandedMenus[item.id] ? "▼" : "▶"}
                      </span>
                    </button>
                    {expandedMenus[item.id] && (
                      <ul className="submenu">
                        {item.submenu.map((subItem) => (
                          <li key={subItem.id} className="submenu-item">
                            <Link
                              to={subItem.path}
                              className={`submenu-link ${
                                activeView === subItem.id ? "active" : ""
                              }`}
                              onClick={() => {
                                setActiveView(subItem.id);
                                setSidebarOpen(false);
                              }}
                            >
                              <span className="submenu-label">
                                {subItem.label}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <button
                    className={`nav-item ${
                      activeView === item.id ? "active" : ""
                    }`}
                    onClick={() => {
                      setActiveView(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="storage-info">
            <h4>Almacenamiento</h4>
            <div className="storage-bar">
              <div className="storage-used" style={{ width: "65%" }}></div>
            </div>
            <p>2.4 GB de 15 GB usados</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
