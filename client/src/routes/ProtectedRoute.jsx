import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * ProtectedRoute – renders children only when a user is authenticated.
 *
 * Behaviour:
 *  1. While loading (e.g. verifying a persisted token) → shows a simple
 *     loading indicator.
 *  2. No token found → redirects to /login.
 *  3. Authenticated  → renders the nested route tree via <Outlet />.
 */
const ProtectedRoute = () => {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Checking authentication…
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

