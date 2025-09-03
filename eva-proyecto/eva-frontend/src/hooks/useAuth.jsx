import { useState, useEffect, useContext, createContext, useCallback } from 'react';
import { useAuth as useOriginalAuth } from '../contexts/AuthContext';
import apiClient from '../config/apiClient';

const PermissionContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user: originalUser, isAuthenticated, isLoading } = useOriginalAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initPermissions = async () => {
      try {
        console.log('🔍 Original auth user:', originalUser);
        console.log('🔍 Is authenticated:', isAuthenticated);
        console.log('🔍 Is loading:', isLoading);
        
        if (originalUser && originalUser.id) {
          console.log('👤 User data from AuthContext:', originalUser);
          console.log('🎭 User role ID:', originalUser.rol_id, 'Type:', typeof originalUser.rol_id);
          
          // Fetch user permissions
          try {
            const response = await apiClient.get(`/usuarios/${originalUser.id}/permissions`);
            console.log('📋 Permissions response:', response.data);
            if (response.data.success) {
              setPermissions(response.data.data || []);
              console.log('✅ Permissions loaded:', response.data.data);
            }
          } catch (permError) {
            console.log('⚠️ Could not load permissions:', permError.message);
            // Don't fail if permissions can't be loaded - role-based logic should work
          }
        }
      } catch (error) {
        console.error('Error initializing permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isLoading) {
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
    
    // Basic user (role 4) - very restricted permissions
    if (userRoleId === 4) {
      // Only read access to equipment modules
      if (moduleName.includes('equipos') && action === 'leer') return true;
      if (moduleName === 'tickets propios' && (action === 'leer' || action === 'insertar' || action === 'editar')) return true;
      return false;
    }
    
    // Fallback to database permissions
    if (!permissions.length) {
      return userRoleId <= 2; // Default allow for admins
    }
    
    const modulePermission = permissions.find(p => 
      p.modulo_name?.toLowerCase() === moduleName.toLowerCase()
    );
    
    if (!modulePermission) {
      return userRoleId <= 2;
    }
    
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
    return originalUser?.rol_id === 1 || originalUser?.rol_id === 2;
  };

  const isSuperAdmin = () => {
    return originalUser?.rol_id === 1;
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
