import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * AdminRoute
 *
 * Wraps any route that requires the 'admin' role.
 * Three outcomes:
 *   1. Session loading  → spinner (no premature redirect)
 *   2. Not authenticated → /signup
 *   3. Authenticated but role !== 'admin' → /dashboard (403-style redirect)
 *   4. Admin → renders the nested route
 *
 * Role is enforced on the *database* via RLS.
 * This component is a UX guard only – it prevents accidental navigation,
 * but an attacker who somehow reaches an admin page will receive no data
 * from Supabase because RLS will block every query.
 *
 * Usage in App.jsx:
 *   <Route element={<AdminRoute />}>
 *     <Route path="/admin" element={<AdminDashboard />} />
 *   </Route>
 */
export default function AdminRoute() {
  const { user, profile, loading } = useAuthStore();
  const location = useLocation();

  // ── 1. Still resolving session / profile ───────────────────────────
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

  // ── 2. Not authenticated ───────────────────────────────────────────
  if (!user) {
    return <Navigate to="/signup" state={{ from: location }} replace />;
  }

  // ── 3. Authenticated but NOT admin → send to student dashboard ─────
  if (profile?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // ── 4. Admin ───────────────────────────────────────────────────────
  return <Outlet />;
}
