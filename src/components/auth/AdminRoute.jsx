import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * AdminRoute — guards any route that requires is_admin === true.
 * Role is enforced server-side by RLS; this is a UX guard only.
 */
export default function AdminRoute() {
  const { user, profile, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/signup" state={{ from: location }} replace />;
  if (!profile?.is_admin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function Spinner() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 48, height: 48, border: '4px solid #6D28D9', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
