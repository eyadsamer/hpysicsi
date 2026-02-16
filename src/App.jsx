import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage         from './pages/HomePage';
import SignUpPage       from './pages/SignUpPage';
import StudentDashboard from './pages/StudentDashboard';
import StorePage        from './pages/StorePage';
import AdminDashboard   from './pages/AdminDashboard';
import AdminSessionsPage from './pages/AdminSessionsPage';
import AdminMediaPage   from './pages/AdminMediaPage';
import AdminUsersPage   from './pages/AdminUsersPage';
import AdminCoursesPage from './pages/AdminCoursesPage';
import ProtectedRoute   from './components/auth/ProtectedRoute';
import AdminRoute       from './components/auth/AdminRoute';
import Navbar           from './components/shared/Navbar';
import { useAuth }      from './hooks/useAuth';

function AuthBootstrap() {
  useAuth();
  return null;
}

function App() {
  return (
    <Router>
      <AuthBootstrap />
      <Navbar />

      <Routes>
        {/* ── Public ───────────────────────────────────────── */}
        <Route path="/"       element={<HomePage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login"  element={<SignUpPage />} />

        {/* ── Authenticated users ───────────────────────────── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/store"     element={<StorePage />} />
        </Route>

        {/* ── Admin only ───────────────────────────────────── */}
        <Route element={<AdminRoute />}>
          <Route path="/admin"          element={<AdminDashboard />} />
          <Route path="/admin/sessions" element={<AdminSessionsPage />} />
          <Route path="/admin/media"    element={<AdminMediaPage />} />
          <Route path="/admin/courses"  element={<AdminCoursesPage />} />
          <Route path="/admin/users"    element={<AdminUsersPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
