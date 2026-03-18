import { useAuth } from '../hooks/useAuth.jsx';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children, requireSuperAdmin = false, allowAdvanced = false }) => {
  const { isAdmin, isSuperAdmin, user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  const isRole123 = () => {
    if (!user) return false;
    const roleId = parseInt(user.rol_id);
    return [1, 2, 3].includes(roleId);
  };

  if (requireSuperAdmin && !isSuperAdmin()) {
    return <Navigate to="/home" replace />;
  }

  if (allowAdvanced) {
    if (!isRole123()) {
      return <Navigate to="/home" replace />;
    }
  } else if (!isAdmin()) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
