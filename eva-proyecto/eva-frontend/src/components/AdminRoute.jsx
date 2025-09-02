import { useAuth } from '../hooks/useAuth.jsx';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children, requireSuperAdmin = false }) => {
  const { isAdmin, isSuperAdmin, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  if (requireSuperAdmin && !isSuperAdmin()) {
    return <Navigate to="/home" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
