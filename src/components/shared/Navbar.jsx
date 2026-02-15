import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';

/**
 * Navbar
 * 
 * Responsive navigation bar with authentication state handling:
 * - Public: Home, Login, Signup
 * - Authenticated: Dashboard, Logout
 * - Admin: Admin Dashboard link
 * - Mobile: Hamburger menu
 */
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile } = useAuthStore();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      setMobileMenuOpen(false);
    } catch (err) {
      console.error('Sign-out error:', err.message);
    }
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav style={{
      backgroundColor: '#1F2937',
      borderBottom: '2px solid #6D28D9',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '80px',
        }}>
          {/* Logo */}
          <Link
            to="/"
            onClick={handleNavClick}
            style={{
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontStyle: 'italic',
              fontSize: '1.5rem',
              color: '#6D28D9',
              textDecoration: 'none',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            PHYSICS APP
          </Link>

          {/* Desktop Navigation */}
          <div style={{
            display: 'none',
            gap: '32px',
            alignItems: 'center',
          }}
          className="desktop-nav">
            {!user ? (
              <>
                {/* Public Links */}
                <Link
                  to="/"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#6D28D9'}
                  onMouseLeave={(e) => e.target.style.color = 'white'}
                >
                  Home
                </Link>
                <Link
                  to="/signup"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#6D28D9'}
                  onMouseLeave={(e) => e.target.style.color = 'white'}
                >
                  Login / Signup
                </Link>
              </>
            ) : (
              <>
                {/* Authenticated Links */}
                <Link
                  to="/"
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '1rem',
                    fontWeight: '500',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#6D28D9'}
                  onMouseLeave={(e) => e.target.style.color = 'white'}
                >
                  Home
                </Link>

                {profile?.role === 'admin' ? (
                  <Link
                    to="/admin"
                    style={{
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#6D28D9'}
                    onMouseLeave={(e) => e.target.style.color = 'white'}
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    style={{
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '1rem',
                      fontWeight: '500',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#6D28D9'}
                    onMouseLeave={(e) => e.target.style.color = 'white'}
                  >
                    Dashboard
                  </Link>
                )}

                {/* User Info & Logout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                    {profile?.full_name || profile?.email || 'User'}
                  </span>
                  {profile?.role === 'admin' && (
                    <span style={{
                      backgroundColor: '#6D28D9',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                    }}>
                      Admin
                    </span>
                  )}
                  <button
                    onClick={handleSignOut}
                    style={{
                      backgroundColor: 'transparent',
                      border: '2px solid #6D28D9',
                      color: '#6D28D9',
                      padding: '6px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#6D28D9';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#6D28D9';
                    }}
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'block',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '8px',
            }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              // Close icon
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              // Hamburger icon
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{
            paddingBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
          className="mobile-menu">
            {!user ? (
              <>
                {/* Public Links */}
                <Link
                  to="/"
                  onClick={handleNavClick}
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    padding: '12px 0',
                    borderBottom: '1px solid #374151',
                  }}
                >
                  Home
                </Link>
                <Link
                  to="/signup"
                  onClick={handleNavClick}
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    padding: '12px 0',
                    borderBottom: '1px solid #374151',
                  }}
                >
                  Login / Signup
                </Link>
              </>
            ) : (
              <>
                {/* Authenticated Links */}
                <Link
                  to="/"
                  onClick={handleNavClick}
                  style={{
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    padding: '12px 0',
                    borderBottom: '1px solid #374151',
                  }}
                >
                  Home
                </Link>

                {profile?.role === 'admin' ? (
                  <Link
                    to="/admin"
                    onClick={handleNavClick}
                    style={{
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      padding: '12px 0',
                      borderBottom: '1px solid #374151',
                    }}
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={handleNavClick}
                    style={{
                      color: 'white',
                      textDecoration: 'none',
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      padding: '12px 0',
                      borderBottom: '1px solid #374151',
                    }}
                  >
                    Dashboard
                  </Link>
                )}

                {/* User Info */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px 0',
                  borderBottom: '1px solid #374151',
                }}>
                  <span style={{ color: '#9CA3AF', fontSize: '0.9rem' }}>
                    Logged in as:
                  </span>
                  <span style={{ color: 'white', fontSize: '1rem', fontWeight: '500' }}>
                    {profile?.full_name || profile?.email || 'User'}
                  </span>
                  {profile?.role === 'admin' && (
                    <span style={{
                      backgroundColor: '#6D28D9',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      alignSelf: 'flex-start',
                    }}>
                      Admin
                    </span>
                  )}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleSignOut}
                  style={{
                    backgroundColor: 'transparent',
                    border: '2px solid #6D28D9',
                    color: '#6D28D9',
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* CSS for responsive behavior */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}
