import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

/**
 * AdminDashboard
 *
 * Admin-only page with:
 * - User statistics (Total Users, Active Users)
 * - Users list with email, role, and created date
 * - Clean, modern UI
 * 
 * Access is controlled by two layers:
 *   1. AdminRoute (frontend) – redirects non-admins before rendering
 *   2. Supabase RLS          – blocks all data queries for non-admins
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { profile } = useAuthStore();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch users and stats on mount
  useEffect(() => {
    fetchUsersAndStats();
  }, []);

  const fetchUsersAndStats = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      setUsers(profiles || []);

      // Calculate stats
      const total = profiles?.length || 0;
      // Active users = users who logged in within last 30 days (simplified)
      const active = total; // You can enhance this with actual last_login tracking

      setStats({
        totalUsers: total,
        activeUsers: active,
      });
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign-out error:', err.message);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      padding: '32px 24px',
      color: 'white',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            color: '#6D28D9',
            margin: 0,
            textTransform: 'uppercase',
          }}>
            Admin Dashboard
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ color: '#9CA3AF', fontSize: '0.95rem' }}>
              {profile?.full_name || profile?.email}
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
          </div>
        </div>

        {/* Statistics Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '48px',
        }}>
          <div style={{
            backgroundColor: '#1F2937',
            border: '2px solid #6D28D9',
            borderRadius: '24px',
            padding: '32px 24px',
          }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem', margin: '0 0 8px', fontWeight: '500' }}>
              Total Users
            </p>
            <p style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontSize: '3rem',
              color: '#6D28D9',
              margin: 0,
            }}>
              {loading ? '...' : stats.totalUsers}
            </p>
          </div>

          <div style={{
            backgroundColor: '#1F2937',
            border: '2px solid #10B981',
            borderRadius: '24px',
            padding: '32px 24px',
          }}>
            <p style={{ color: '#9CA3AF', fontSize: '0.9rem', margin: '0 0 8px', fontWeight: '500' }}>
              Active Users
            </p>
            <p style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontSize: '3rem',
              color: '#10B981',
              margin: 0,
            }}>
              {loading ? '...' : stats.activeUsers}
            </p>
          </div>
        </div>

        {/* Users List Section */}
        <div style={{
          backgroundColor: '#1F2937',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '32px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <h2 style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontSize: '1.5rem',
              color: 'white',
              margin: 0,
              textTransform: 'uppercase',
            }}>
              Users
            </h2>
            <button
              onClick={fetchUsersAndStats}
              disabled={loading}
              style={{
                backgroundColor: 'transparent',
                border: '2px solid #6D28D9',
                color: '#6D28D9',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              border: '1px solid #EF4444',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#FCA5A5',
              marginBottom: '24px',
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9CA3AF' }}>
              No users found
            </div>
          ) : (
            // Users Table - Desktop
            <>
              <div style={{ display: 'none' }} className="desktop-table">
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr',
                  gap: '16px',
                  padding: '12px 16px',
                  borderBottom: '1px solid #374151',
                  color: '#9CA3AF',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                }}>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Joined</div>
                </div>

                {users.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr',
                      gap: '16px',
                      padding: '16px',
                      borderBottom: '1px solid #374151',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ color: 'white', fontSize: '0.95rem' }}>
                      {user.email || 'N/A'}
                      {user.full_name && (
                        <div style={{ color: '#9CA3AF', fontSize: '0.85rem', marginTop: '4px' }}>
                          {user.full_name}
                        </div>
                      )}
                    </div>
                    <div>
                      <span style={{
                        backgroundColor: user.role === 'admin' ? '#6D28D9' : '#374151',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}>
                        {user.role || 'user'}
                      </span>
                    </div>
                    <div style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                      {formatDate(user.created_at)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Users Cards - Mobile */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="mobile-cards">
                {users.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      backgroundColor: '#111827',
                      border: '1px solid #374151',
                      borderRadius: '12px',
                      padding: '16px',
                    }}
                  >
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ color: 'white', fontSize: '1rem', fontWeight: '500', marginBottom: '4px' }}>
                        {user.email || 'N/A'}
                      </div>
                      {user.full_name && (
                        <div style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                          {user.full_name}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        backgroundColor: user.role === 'admin' ? '#6D28D9' : '#374151',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                      }}>
                        {user.role || 'user'}
                      </span>
                      <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
                        {formatDate(user.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Back to Home Link */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
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

      {/* Responsive CSS */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-table {
            display: block !important;
          }
          .mobile-cards {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
