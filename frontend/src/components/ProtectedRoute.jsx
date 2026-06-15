import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ allowedRoles }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-950">
        <div className="flex items-center gap-3 text-neutral-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-700 border-t-gold-500" />
          <p className="text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
