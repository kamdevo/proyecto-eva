import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaHome, FaTools, FaUsers, FaBuilding, FaClipboardList, 
  FaChartBar, FaCog, FaFileAlt, FaCalendarAlt, FaWarehouse,
  FaChevronDown, FaChevronRight, FaDesktop, FaIndustry,
  FaUserMd, FaShieldAlt, FaExclamationTriangle, FaSearch,
  FaPhone, FaMapMarkerAlt, FaBoxes, FaWrench, FaBook
} from 'react-icons/fa';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const menuItems = [
    {
      key: 'dashboard',
      title: 'Dashboard',
      icon: <FaHome />,
      path: '/dashboard'
    },
    {
      key: 'equipos',
      title: 'Equipos',
      icon: <FaDesktop />,
      submenu: [
        { title: 'Gestión de Equipos', path: '/equipos' },
        { title: 'Equipos Industriales', path: '/equipos-industriales' },
        { title: 'Equipos Biomédicos', path: '/equipos-biomedicos' },
        { title: 'Estados de Equipos', path: '/estados-equipos' },
        { title: 'Especificaciones', path: '/especificaciones' },
        { title: 'Manuales', path: '/manuales' },
        { title: 'Archivos', path: '/archivos' },
        { title: 'Contactos', path: '/contactos' },
        { title: 'Repuestos', path: '/repuestos' },
        { title: 'Bajas', path: '/bajas' }
      ]
    },
    {
      key: 'mantenimiento',
      title: 'Mantenimiento',
      icon: <FaTools />,
      submenu: [
        { title: 'Planes de Mantenimiento', path: '/planes-mantenimiento' },
        { title: 'Mantenimiento General', path: '/mantenimiento' },
        { title: 'Mantenimiento Industrial', path: '/mantenimiento-industrial' },
        { title: 'Correctivos Generales', path: '/correctivos-generales' },
        { title: 'Avances Correctivos', path: '/avances-correctivos' },
        { title: 'Calibración', path: '/calibracion' },
        { title: 'Calibración Industrial', path: '/calibracion-industrial' },
        { title: 'Vigencias', path: '/vigencias-mantenimiento' }
      ]
    },
    {
      key: 'ordenes',
      title: 'Órdenes de Trabajo',
      icon: <FaClipboardList />,
      submenu: [
        { title: 'Órdenes', path: '/ordenes' },
        { title: 'Órdenes de Compra', path: '/ordenes-compra' },
        { title: 'Trabajos', path: '/trabajos' },
        { title: 'Observaciones', path: '/observaciones' }
      ]
    },
    {
      key: 'organizacion',
      title: 'Organización',
      icon: <FaBuilding />,
      submenu: [
        { title: 'Empresas', path: '/empresas' },
        { title: 'Centros', path: '/centros' },
        { title: 'Sedes', path: '/sedes' },
        { title: 'Áreas', path: '/areas' },
        { title: 'Servicios', path: '/servicios' },
        { title: 'Pisos', path: '/pisos' },
        { title: 'Zonas', path: '/zonas' }
      ]
    },
    {
      key: 'usuarios',
      title: 'Usuarios y Roles',
      icon: <FaUsers />,
      submenu: [
        { title: 'Usuarios', path: '/usuarios' },
        { title: 'Roles', path: '/roles' },
        { title: 'Permisos', path: '/permisos' },
        { title: 'Técnicos', path: '/tecnicos' },
        { title: 'Zonas de Usuario', path: '/usuarios-zonas' }
      ]
    },
    {
      key: 'proveedores',
      title: 'Proveedores',
      icon: <FaWarehouse />,
      submenu: [
        { title: 'Proveedores', path: '/proveedores-mantenimiento' },
        { title: 'Propietarios', path: '/propietarios' },
        { title: 'Contacto', path: '/contacto' }
      ]
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.key} className="nav-item">
              {item.submenu ? (
                <>
                  <button
                    className={`nav-link submenu-toggle ${expandedMenus[item.key] ? 'expanded' : ''}`}
                    onClick={() => toggleMenu(item.key)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {isOpen && (
                      <>
                        <span className="nav-text">{item.title}</span>
                        <span className="expand-icon">
                          {expandedMenus[item.key] ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                      </>
                    )}
                  </button>
                  {expandedMenus[item.key] && isOpen && (
                    <ul className="submenu">
                      {item.submenu.map((subItem, index) => (
                        <li key={index} className="submenu-item">
                          <Link
                            to={subItem.path}
                            className={`submenu-link ${location.pathname === subItem.path ? 'active' : ''}`}
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {isOpen && <span className="nav-text">{item.title}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
