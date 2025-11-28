import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { useAuth as useOriginalAuth } from '../contexts/AuthContext';
import apiClient from '../config/apiClient';
import permissionService from '../services/permissionService';

const PermissionContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user: originalUser, isAuthenticated, isLoading } = useOriginalAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPermissions = async () => {
      try {
        
        if (originalUser && originalUser.id && isAuthenticated) {
          
          // Fetch user permissions
          try {
            // CORRECCIÓN: Usar SIEMPRE el endpoint self-permissions para todos los usuarios
            // El backend ya maneja correctamente los permisos según el rol
            const permissionsUrl = `/v1/user/permissions`;
              
            const response = await apiClient.get(permissionsUrl);
            
            
            if (response.data && response.data.success) {
              const rawPermissions = response.data.data || response.data.permissions || {};
              
              // CORREGIR: Convertir objeto de permisos a array que espera el frontend
              let permissionsData = [];
              
              if (typeof rawPermissions === 'object' && !Array.isArray(rawPermissions)) {
                // Convertir objeto {equipos: {leer: true, ...}, usuarios: {...}} a array
                permissionsData = Object.entries(rawPermissions).map(([moduleName, perms]) => ({
                  modulo_name: moduleName,
                  ...perms
                }));
              } else if (Array.isArray(rawPermissions)) {
                permissionsData = rawPermissions;
              }
              
              setPermissions(permissionsData);
              
              // Inicializar permissionService con los permisos cargados
              if (originalUser) {
                permissionService.initialize(originalUser, permissionsData);
              }
            } else {
              setPermissions([]);
            }
          } catch (permError) {
            console.error('❌ [PERMISOS] Error cargando permisos:', permError);
            // Set empty permissions array to avoid undefined
            setPermissions([]);
          }
        } else {
          setPermissions([]);
        }
      } catch (error) {
        console.error('❌ Error initializing permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    
    if (!isLoading && originalUser) {
      initPermissions();
    }
  }, [originalUser, isAuthenticated, isLoading]);

  const hasPermission = useCallback((moduleName, action = 'leer') => {
    if (!originalUser) {
      return false;
    }
    
    // Convert rol_id to number to ensure proper comparison
    const userRoleId = parseInt(originalUser.rol_id);
    
    // Super admin (role 1) has ALL permissions - no restrictions
    if (userRoleId === 1) {
      return true;
    }
    
    // Admin (role 2) has most permissions
    if (userRoleId === 2) {
      return true;
    }
    
    // Advanced user (role 3) - limited delete permissions
    if (userRoleId === 3) {
      if (action === 'eliminar') return false;
      return true;
    }
    
    // SIEMPRE usar permisos de la base de datos para todos los roles (excepto super admin)
    
    // Si no hay permisos cargados, permitir para admins y algunos módulos básicos para usuarios
    if (!permissions.length) {
      if (userRoleId <= 2) return true; // Admins siempre
      
      // Para usuarios normales, permitir módulos básicos
      const basicModules = ['dashboard', 'equipos', 'tickets-propios', 'correctivos'];
      if (basicModules.includes(moduleName.toLowerCase()) && action === 'leer') {
        return true;
      }
      return false;
    }
    
    // Buscar el permiso específico del módulo
    const modulePermission = permissions.find(p => 
      p.modulo_name?.toLowerCase() === moduleName.toLowerCase()
    );
    
    if (!modulePermission) {
      return userRoleId <= 2; // Solo admins si no hay permiso específico
    }
    
    // Verificar el permiso específico
    const result = modulePermission[action] === 1 || modulePermission[action] === true;
    
    return result;
  }, [originalUser, permissions]);

  const hasModuleAccess = (moduleName) => {
    return hasPermission(moduleName, 'leer');
  };

  const canCreate = (moduleName) => {
    return hasPermission(moduleName, 'insertar');
  };

  const canEdit = (moduleName) => {
    return hasPermission(moduleName, 'editar');
  };

  const canDelete = (moduleName) => {
    return hasPermission(moduleName, 'eliminar');
  };

  const isAdmin = () => {
    if (!originalUser) return false;
    const userRoleId = parseInt(originalUser.rol_id);
    const result = userRoleId === 1 || userRoleId === 2;
    return result;
  };

  const isSuperAdmin = () => {
    if (!originalUser) return false;
    const userRoleId = parseInt(originalUser.rol_id);
    const result = userRoleId === 1;
    return result;
  };

  const value = {
    user: originalUser,
    permissions,
    loading: loading || isLoading,
    hasPermission,
    hasModuleAccess,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
    isSuperAdmin,
    setUser: () => {}, // Not needed since we use original auth
    setPermissions
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
