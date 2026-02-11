import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * ProtectedRoute
 *
 * Wraps any route that requires an authenticated session.
 * - While the session is being resolved (`loading === true`), renders a
 *   full-screen spinner so there is no flash of redirect.
 * - Once resolved, redirects unauthenticated visitors to /signup,
 *   preserving the original destination in `state.from` so the
 *   login page can redirect back after sign-in.
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<StudentDashboard />} />
 *   </Route>
 */
export default function ProtectedRoute() {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  // ── 1. Session not yet resolved ────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#111827',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            border: '4px solid #6D28D9',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── 2. No session → redirect to login, remember where we came from ──
  if (!user) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  // ── 3. Authenticated → render the nested route ─────────────────────
  return <Outlet />;
}
