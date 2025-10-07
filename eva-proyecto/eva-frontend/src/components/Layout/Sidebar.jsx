import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../config/apiClient';
import {
  FaHome,
  FaTools,
  FaUsers,
  FaBuilding,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaFileAlt,
  FaCalendarAlt,
  FaWarehouse,
  FaChevronDown,
  FaChevronRight,
  FaDesktop,
  FaIndustry,
  FaUserMd,
  FaShieldAlt,
  FaExclamationTriangle,
  FaSearch,
  FaPhone,
  FaMapMarkerAlt,
  FaBoxes,
  FaWrench,
  FaBook,
  FaTicketAlt,
  FaWrenchIcon,
  FaCalendar,
  FaTimes,
  FaLock
} from "react-icons/fa";

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, hasModuleAccess, permissions } = useAuth();

  // Cargar módulos desde la BD
  useEffect(() => {
    const loadModules = async () => {
      try {
        console.log('🔍 Cargando módulos desde BD...');
        const response = await apiClient.get('/v1/modulos');
        console.log('📂 Módulos recibidos:', response.data);
        
        if (response.data.success && response.data.data) {
          setModules(response.data.data);
          console.log('✅ Módulos cargados:', response.data.data.length);
        }
      } catch (error) {
        console.error('❌ Error cargando módulos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // Mapear íconos para los módulos
  const getModuleIcon = (moduleName) => {
    const iconMap = {
      'equipos': <FaDesktop />,
      'equipos industriales': <FaIndustry />,
      'usuarios': <FaUsers />,
      'servicios': <FaBuilding />,
      'areas': <FaMapMarkerAlt />,
      'tickets propios': <FaTicketAlt />,
      'tickets activos': <FaClipboardList />,
      'tickets cerrados': <FaTimes />,
      'correctivos': <FaWrench />,
      'preventivos': <FaTools />,
      'calibraciones': <FaShieldAlt />,
      'repuestos': <FaBoxes />,
      'manuales': <FaBook />,
      'contactos': <FaPhone />,
      'reportes': <FaChartBar />,
      'observaciones': <FaFileAlt />,
      'planes mantenimiento': <FaCalendar />,
      'guias rapidas': <FaFileAlt />,
      'propietarios': <FaUserMd />,
      'contingencias': <FaExclamationTriangle />,
    };
    
    return iconMap[moduleName?.toLowerCase()] || <FaCog />;
  };

  // Obtener ruta basada en el nombre del módulo
  const getModulePath = (moduleName) => {
    const pathMap = {
      'equipos': '/equipos',
      'equipos industriales': '/equipos-industriales',
      'usuarios': '/usuarios',
      'servicios': '/servicios',
      'areas': '/areas',
      'tickets propios': '/mis-tickets',
      'tickets activos': '/tickets-activos',
      'tickets cerrados': '/tickets-cerrados',
      'correctivos': '/correctivos-generales',
      'preventivos': '/mantenimiento',
      'calibraciones': '/calibracion',
      'repuestos': '/repuestos',
      'manuales': '/manuales',
      'contactos': '/contactos',
      'reportes': '/reportes',
      'observaciones': '/observaciones',
      'planes mantenimiento': '/planes-mantenimiento',
      'guias rapidas': '/guias-rapidas',
      'propietarios': '/propietarios',
      'contingencias': '/contingencias',
    };
    
    return pathMap[moduleName?.toLowerCase()] || `/${moduleName?.toLowerCase().replace(/\s+/g, '-')}`;
  };

  // Verificar si el usuario tiene acceso al módulo
  const checkModuleAccess = (moduleName) => {
    if (!user) {
      console.log(`❌ Sin usuario para verificar acceso a "${moduleName}"`);
      return false;
    }
    
    console.log(`🔍 Verificando acceso a módulo "${moduleName}" para usuario rol ${user.rol_id}`);
    
    // Super admin y admin tienen acceso a todo
    if (user.rol_id === 1 || user.rol_id === 2) {
      console.log(`✅ Admin/SuperAdmin - acceso completo a "${moduleName}"`);
      return true;
    }
    
    // Verificar permisos específicos usando los permisos de la BD
    const result = hasModuleAccess(moduleName);
    console.log(`🎯 Acceso a "${moduleName}": ${result ? '✅ PERMITIDO' : '❌ DENEGADO'}`);
    
    return result;
  };

  if (loading) {
    return (
      <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <nav className="sidebar-nav">
          <div className="loading-modules">
            <FaCog className="spin" />
            {isOpen && <span>Cargando módulos...</span>}
          </div>
        </nav>
      </aside>
    );
  }

  // Siempre mostrar Dashboard
  const menuItems = [
    {
      key: "dashboard",
      title: "Dashboard",
      icon: <FaHome />,
      path: "/dashboard",
      enabled: true,
      hasAccess: true
    },
    // Agregar módulos dinámicos de la BD
    ...modules.map(module => {
      const hasAccess = checkModuleAccess(module.name);
      return {
        key: module.name.toLowerCase().replace(/\s+/g, '_'),
        title: module.name.charAt(0).toUpperCase() + module.name.slice(1),
        icon: getModuleIcon(module.name),
        path: getModulePath(module.name),
        enabled: hasAccess,
        hasAccess: hasAccess,
        moduleName: module.name
      };
    })
  ];

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li 
              key={item.key} 
              className={`nav-item ${item.hasAccess ? 'enabled' : 'disabled'}`}
              title={!item.hasAccess ? `Sin acceso a ${item.title}` : ''}
            >
              {item.hasAccess ? (
                // MÓDULO HABILITADO - Con navegación
                <Link
                  to={item.path}
                  className={`nav-link ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {isOpen && <span className="nav-text">{item.title}</span>}
                </Link>
              ) : (
                // MÓDULO DESHABILITADO - Solo visual
                <div
                  className="nav-link disabled-module"
                  style={{
                    opacity: 0.5,
                    cursor: 'not-allowed',
                    color: '#999',
                    pointerEvents: 'none'
                  }}
                >
                  <span className="nav-icon" style={{ opacity: 0.6 }}>
                    {item.icon}
                  </span>
                  {isOpen && (
                    <>
                      <span className="nav-text" style={{ opacity: 0.6 }}>
                        {item.title}
                      </span>
                      <FaLock 
                        style={{ 
                          marginLeft: 'auto', 
                          fontSize: '12px',
                          opacity: 0.7,
                          color: '#dc3545'
                        }} 
                      />
                    </>
                  )}
                </div>
              )}
              
              {/* Mostrar información de debug en desarrollo */}
              {process.env.NODE_ENV === 'development' && isOpen && (
                <small 
                  style={{ 
                    fontSize: '10px', 
                    opacity: 0.6, 
                    marginLeft: '40px',
                    display: 'block'
                  }}
                >
                  {item.moduleName && (
                    <>
                      Módulo: {item.moduleName} | 
                      Acceso: {item.hasAccess ? '✅' : '❌'} |
                      Rol: {user?.rol_id}
                    </>
                  )}
                </small>
              )}
            </li>
          ))}
        </ul>
        
        {/* Información de debug del usuario actual */}
        {process.env.NODE_ENV === 'development' && isOpen && user && (
          <div className="debug-info" style={{ 
            margin: '20px 10px', 
            padding: '10px', 
            backgroundColor: 'rgba(0,0,0,0.1)', 
            borderRadius: '5px',
            fontSize: '12px'
          }}>
            <div><strong>Debug Info:</strong></div>
            <div>Usuario: {user.nombre} {user.apellido}</div>
            <div>Rol: {user.rol_id}</div>
            <div>Permisos: {permissions?.length || 0} módulos</div>
            <div>Módulos cargados: {modules.length}</div>
            <div>Habilitados: {menuItems.filter(m => m.hasAccess).length}</div>
            <div>Deshabilitados: {menuItems.filter(m => !m.hasAccess).length}</div>
          </div>
        )}
      </nav>
      
      {/* Estilos CSS en línea para los módulos deshabilitados */}
      <style jsx>{`
        .nav-item.disabled {
          position: relative;
        }
        
        .nav-item.disabled::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.1);
          pointer-events: none;
          z-index: 1;
        }
        
        .disabled-module {
          background: none !important;
          transform: none !important;
          transition: none !important;
        }
        
        .disabled-module:hover {
          background: none !important;
          transform: none !important;
        }
        
        .loading-modules {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          color: #666;
        }
        
        .loading-modules .spin {
          animation: spin 2s linear infinite;
          margin-right: 10px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
