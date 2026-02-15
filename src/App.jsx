import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignUpPage from './pages/SignUpPage';
import StudentDashboard from './pages/StudentDashboard';
import StorePage from './pages/StorePage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import Navbar from './components/shared/Navbar';
import { useAuth } from './hooks/useAuth';

/**
 * AuthBootstrap
 *
 * Rendered once, inside <Router>, so that useNavigate is available.
 * Calling useAuth() here starts the Supabase onAuthStateChange listener
 * for the full app lifetime — restoring any existing session on load and
 * reacting to future sign-in / sign-out events.
 *
 * Renders nothing to the DOM.
 */
function AuthBootstrap() {
  useAuth();
  return null;
}

/**
 * App – root component.
 *
 * Route protection:
 *   Public          →  /  and  /signup
 *   ProtectedRoute  →  any authenticated user   (/dashboard, /store)
 *   AdminRoute      →  role === 'admin' only     (/admin/*)
 *
 * Role is enforced server-side by Supabase RLS.  These components are
 * a UX guard only — they prevent accidental navigation and provide
 * clean redirects, but cannot be bypassed to obtain real data.
 */
function App() {
  return (
    <Router>
      {/* Boot the auth session listener exactly once */}
      <AuthBootstrap />

      {/* Global Navbar - appears on all pages */}
      <Navbar />

      <Routes>
        {/* ── Public ───────────────────────────────────────────── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<SignUpPage />} />

        {/* ── Authenticated users (admin OR student) ───────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/store"     element={<StorePage />} />
        </Route>

        {/* ── Admin only ───────────────────────────────────────── */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
