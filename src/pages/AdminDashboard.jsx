import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';

/**
 * AdminDashboard
 *
 * Admin-only page (teacher view).
 * Access is controlled by two layers:
 *   1. AdminRoute (frontend) – redirects non-admins before rendering
 *   2. Supabase RLS          – blocks all data queries for non-admins
 *
 * This is a scaffold; add course management, student lists, code
 * generation, etc. as separate components inside this page.
 */
const AdminDashboard = () => {
  const navigate   = useNavigate();
  const { signOut } = useAuth();
  const { profile } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut(); // clears store + navigates to /signup
    } catch (err) {
      console.error('Sign-out error:', err.message);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      padding: '32px',
      color: 'white',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '48px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <h1 style={{
          fontFamily: 'Impact, Arial Black, sans-serif',
          fontStyle: 'italic',
          fontSize: '3rem',
          color: '#6D28D9',
          margin: 0,
          textTransform: 'uppercase',
        }}>
          Admin Dashboard
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#9CA3AF', fontSize: '1rem' }}>
            {profile?.full_name || profile?.phone_number}
          </span>
          <span style={{
            backgroundColor: '#6D28D9',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Admin
          </span>
          <button
            onClick={handleSignOut}
            style={{
              backgroundColor: 'transparent',
              border: '2px solid #6D28D9',
              color: '#6D28D9',
              padding: '8px 20px',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Stat cards placeholder */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
        marginBottom: '48px',
      }}>
        {[
          { label: 'Total Students', value: '—' },
          { label: 'Active Courses', value: '—' },
          { label: 'Access Codes',   value: '—' },
        ].map(stat => (
          <div key={stat.label} style={{
            backgroundColor: '#1F2937',
            border: '2px solid #6D28D9',
            borderRadius: '24px',
            padding: '32px 24px',
          }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem', margin: '0 0 8px' }}>
              {stat.label}
            </p>
            <p style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontSize: '2.5rem',
              color: '#B3B3B3',
              margin: 0,
            }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Action buttons placeholder */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {['Manage Courses', 'Generate Codes', 'View Students'].map(action => (
          <button
            key={action}
            style={{
              backgroundColor: '#6D28D9',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              padding: '16px 32px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              cursor: 'pointer',
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontStyle: 'italic',
            }}
          >
            {action}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '48px' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            color: '#6b7280',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
