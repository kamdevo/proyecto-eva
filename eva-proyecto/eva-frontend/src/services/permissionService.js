/**
 * Servicio de permisos para el frontend
 * Maneja la verificación de permisos basada en el sistema de acciones del backend
 */

class PermissionService {
  constructor() {
    this.permissions = {};
    this.userRole = null;
    this.userId = null;
  }

  /**
   * Inicializar el servicio con los permisos del usuario
   * @param {Object} user - Objeto usuario con permisos
   */
  initialize(user) {
    
    if (user && user.permissions) {
      this.permissions = user.permissions;
      this.userRole = user.rol_id;
      this.userId = user.id;
      
    } else {
      // CORRECCIÓN: Inicializar con los datos básicos del usuario aunque no tenga permissions
      if (user) {
        this.userRole = user.rol_id;
        this.userId = user.id;
        this.permissions = {}; // Objeto vacío pero no null
      }
    }
  }

  /**
   * Limpiar permisos (para logout)
   */
  clear() {
    this.permissions = {};
    this.userRole = null;
    this.userId = null;
    // Debug logging disabled for production
    // console.log('🔐 [PERMISSIONS] Permisos limpiados');
  }

  /**
   * Verificar si el usuario es administrador
   * @returns {boolean}
   */
  isAdmin() {
    return this.userRole === 1;
  }

  /**
   * Verificar si el usuario tiene permiso para leer un módulo
   * @param {string} module - Nombre del módulo
   * @returns {boolean}
   */
  canRead(module) {
    if (this.isAdmin()) return true;
    
    const modulePermissions = this.permissions[module];
    return modulePermissions ? modulePermissions.leer : false;
  }

  /**
   * Verificar si el usuario tiene permiso para insertar en un módulo
   * @param {string} module - Nombre del módulo
   * @returns {boolean}
   */
  canInsert(module) {
    if (this.isAdmin()) return true;
    
    const modulePermissions = this.permissions[module];
    return modulePermissions ? modulePermissions.insertar : false;
  }

  /**
   * Verificar si el usuario tiene permiso para editar en un módulo
   * @param {string} module - Nombre del módulo
   * @returns {boolean}
   */
  canEdit(module) {
    if (this.isAdmin()) return true;
    
    const modulePermissions = this.permissions[module];
    return modulePermissions ? modulePermissions.editar : false;
  }

  /**
   * Verificar si el usuario tiene permiso para eliminar en un módulo
   * @param {string} module - Nombre del módulo
   * @returns {boolean}
   */
  canDelete(module) {
    if (this.isAdmin()) return true;
    
    const modulePermissions = this.permissions[module];
    return modulePermissions ? modulePermissions.eliminar : false;
  }

  /**
   * Verificar si el usuario tiene algún permiso en un módulo
   * @param {string} module - Nombre del módulo
   * @returns {boolean}
   */
  hasAnyPermission(module) {
    if (this.isAdmin()) return true;
    
    const modulePermissions = this.permissions[module];
    if (!modulePermissions) return false;
    
    return modulePermissions.leer || 
           modulePermissions.insertar || 
           modulePermissions.editar || 
           modulePermissions.eliminar;
  }

  /**
   * Obtener todos los permisos de un módulo
   * @param {string} module - Nombre del módulo
   * @returns {Object|null}
   */
  getModulePermissions(module) {
    if (this.isAdmin()) {
      return {
        leer: true,
        insertar: true,
        editar: true,
        eliminar: true
      };
    }
    
    return this.permissions[module] || null;
  }

  /**
   * Obtener lista de módulos con acceso de lectura
   * @returns {Array}
   */
  getReadableModules() {
    if (this.isAdmin()) {
      return Object.keys(this.permissions);
    }
    
    return Object.keys(this.permissions).filter(module => 
      this.permissions[module].leer
    );
  }

  /**
   * Mapeo de rutas del frontend a módulos del backend
   */
  static ROUTE_MODULE_MAPPING = {
    '/equipos/biomedicos': 'equipos',
    '/equipos/industriales': 'equipos industriales',
    '/equipos/ordenes-compra': 'soportes compra',
    '/equipos/bajas': 'bajas equipos biomedicos',
    '/equipos/contingencias': 'contingencias',
    '/equipos/guias-rapidas': 'guias rapidas',
    '/equipos/manuales': 'manuales',
    '/equipos/consultas': 'equipos',
    '/planes/preventivo': 'planes mantenimiento',
    '/ordenes/mis-tickets': 'tickets propios',
    '/ordenes/gestion-tickets': 'tickets activos',
    '/ordenes/tickets-cerrados': 'tickets cerrados',
    '/repuestos': 'repuestos',
    '/capacitaciones': 'capacitaciones',
    '/dashboard/reportes': 'reportes',
    '/dashboard/graficas': 'reportes',
    '/config/servicios': 'servicios',
    '/config/contactos': 'contactos',
    '/config/areas': 'areas',
    '/admin/usuarios': 'usuarios',
    '/admin/propietarios': 'contactos'
  };

  /**
   * Verificar si el usuario puede acceder a una ruta específica
   * @param {string} route - Ruta del frontend
   * @returns {boolean}
   */
  canAccessRoute(route) {
    if (this.isAdmin()) return true;
    
    const module = PermissionService.ROUTE_MODULE_MAPPING[route];
    if (!module) {
      // Debug logging disabled for production
      // console.warn(`⚠️ [PERMISSIONS] Ruta no mapeada: ${route}`);
      return false;
    }
    
    return this.canRead(module);
  }

  /**
   * Filtrar elementos de menú basado en permisos
   * @param {Array} menuItems - Array de elementos de menú
   * @returns {Array}
   */
  filterMenuItems(menuItems) {
    if (this.isAdmin()) {
      return menuItems;
    }
    return menuItems.filter(item => {
      // Si tiene href directo, verificar acceso
      if (item.href) {
        return this.canAccessRoute(item.href);
      }
      
      // Si tiene submenu, filtrar submenu
      if (item.submenu && item.submenu.length > 0) {
        const filteredSubmenu = item.submenu.filter(subItem => 
          this.canAccessRoute(subItem.href)
        );
        
        // Solo mostrar el item principal si tiene al menos un subitem accesible
        if (filteredSubmenu.length > 0) {
          item.submenu = filteredSubmenu;
          return true;
        }
        return false;
      }
      
      // Por defecto, permitir items sin href ni submenu (como separadores)
      return true;
    });
  }

  /**
   * Debug: Mostrar información de permisos en consola (disabled for production)
   */
  debugPermissions() {
    // Debug logging disabled for production
    // console.group('🔐 [PERMISSIONS DEBUG]');
    // console.log('User ID:', this.userId);
    // console.log('Role ID:', this.userRole);
    // console.log('Is Admin:', this.isAdmin());
    // console.log('Permissions:', this.permissions);
    // console.log('Readable Modules:', this.getReadableModules());
    // console.groupEnd();
  }
}

// Crear instancia única del servicio
const permissionService = new PermissionService();

export default permissionService;
