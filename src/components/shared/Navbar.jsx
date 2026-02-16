import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile } = useAuthStore();
  const { signOut } = useAuth();
  const location = useLocation();
  const isAdmin = profile?.is_admin === true;

  const handleSignOut = async () => {
    try { await signOut(); } catch (err) { console.error(err.message); }
    setMobileOpen(false);
  };

  const linkStyle = (path) => ({
    color: location.pathname === path ? '#6D28D9' : 'white',
    textDecoration: 'none',
    fontSize: '1rem',
    fontWeight: '500',
    transition: 'color 0.2s',
  });

  const adminLinks = [
    { to: '/admin',          label: 'Overview' },
    { to: '/admin/sessions', label: 'Sessions' },
    { to: '/admin/media',    label: 'Media' },
    { to: '/admin/courses',  label: 'Courses' },
    { to: '/admin/users',    label: 'Users' },
  ];

  const isAdminArea = location.pathname.startsWith('/admin');

  return (
    <>
      <nav style={{ backgroundColor: '#1F2937', borderBottom: '2px solid #6D28D9', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '72px' }}>

            {/* Logo */}
            <Link to="/" style={{ fontFamily: 'Impact, Arial Black, sans-serif', fontStyle: 'italic', fontSize: '1.5rem', color: '#6D28D9', textDecoration: 'none', textTransform: 'uppercase' }}>
              PHYSICS APP
            </Link>

            {/* Desktop nav */}
            <div className="desktop-nav" style={{ display: 'none', gap: '28px', alignItems: 'center' }}>
              {!user ? (
                <>
                  <Link to="/" style={linkStyle('/')}>Home</Link>
                  <Link to="/signup" style={linkStyle('/signup')}>Login / Signup</Link>
                </>
              ) : isAdmin ? (
                <>
                  {adminLinks.map(({ to, label }) => (
                    <Link key={to} to={to} style={linkStyle(to)}
                      onMouseEnter={e => e.target.style.color = '#6D28D9'}
                      onMouseLeave={e => e.target.style.color = location.pathname === to ? '#6D28D9' : 'white'}>
                      {label}
                    </Link>
                  ))}
                  <UserChip profile={profile} isAdmin onSignOut={handleSignOut} />
                </>
              ) : (
                <>
                  <Link to="/" style={linkStyle('/')} onMouseEnter={e => e.target.style.color = '#6D28D9'} onMouseLeave={e => e.target.style.color = 'white'}>Home</Link>
                  <Link to="/dashboard" style={linkStyle('/dashboard')} onMouseEnter={e => e.target.style.color = '#6D28D9'} onMouseLeave={e => e.target.style.color = 'white'}>Dashboard</Link>
                  <UserChip profile={profile} onSignOut={handleSignOut} />
                </>
              )}
            </div>

            {/* Hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn"
              style={{ display: 'block', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div style={{ paddingBottom: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {!user ? (
                <>
                  <MobileLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
                  <MobileLink to="/signup" onClick={() => setMobileOpen(false)}>Login / Signup</MobileLink>
                </>
              ) : isAdmin ? (
                <>
                  {adminLinks.map(({ to, label }) => (
                    <MobileLink key={to} to={to} onClick={() => setMobileOpen(false)}>{label}</MobileLink>
                  ))}
                  <button onClick={handleSignOut} style={mobileLogoutStyle}>Logout</button>
                </>
              ) : (
                <>
                  <MobileLink to="/" onClick={() => setMobileOpen(false)}>Home</MobileLink>
                  <MobileLink to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</MobileLink>
                  <button onClick={handleSignOut} style={mobileLogoutStyle}>Logout</button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}

function UserChip({ profile, isAdmin, onSignOut }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>
        {profile?.full_name || profile?.email || 'User'}
      </span>
      {isAdmin && (
        <span style={{ backgroundColor: '#6D28D9', color: 'white', padding: '3px 10px', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
          Admin
        </span>
      )}
      <button onClick={onSignOut}
        style={{ background: 'transparent', border: '2px solid #6D28D9', color: '#6D28D9', padding: '5px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#6D28D9'; e.currentTarget.style.color = 'white'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#6D28D9'; }}>
        Logout
      </button>
    </div>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick}
      style={{ color: 'white', textDecoration: 'none', fontSize: '1rem', fontWeight: '500', padding: '12px 0', borderBottom: '1px solid #374151', display: 'block' }}>
      {children}
    </Link>
  );
}

const mobileLogoutStyle = {
  background: 'transparent', border: '2px solid #6D28D9', color: '#6D28D9',
  padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem',
  fontWeight: 'bold', width: '100%', marginTop: '8px',
};
