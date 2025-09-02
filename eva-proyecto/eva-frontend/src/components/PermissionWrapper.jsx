import { useAuth } from '../hooks/useAuth.jsx';

const PermissionWrapper = ({ 
  children, 
  module, 
  action = 'leer', 
  fallback = null,
  requireAdmin = false,
  requireSuperAdmin = false 
}) => {
  const { hasPermission, isAdmin, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return <div>Cargando...</div>;
  }

  // Check super admin requirement
  if (requireSuperAdmin && !isSuperAdmin()) {
    return fallback || <div>Acceso denegado</div>;
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin()) {
    return fallback || <div>Acceso denegado</div>;
  }

  // Check module permission
  if (module && !hasPermission(module, action)) {
    return fallback || <div>Sin permisos para esta acción</div>;
  }

  return children;
};

export default PermissionWrapper;
