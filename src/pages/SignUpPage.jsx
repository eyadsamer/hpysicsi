import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
} from '../utils/validation';
import { parseAuthError } from '../utils/errorHandling';

/**
 * SignUpPage
 *
 * Two tabs, each a single step.
 *
 * ── Sign-up (tab = 'signup') ─────────────────────────────────────────
 *   name + email + password + confirm password
 *   → signUp(email, password)
 *   → session starts immediately (if email confirmations are disabled)
 *   → profile fields saved, redirect
 *
 * ── Log-in (tab = 'login') ───────────────────────────────────────────
 *   email + password
 *   → signIn(email, password)
 *   → session starts immediately, redirect
 */
const SignUpPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, signIn, updateProfile } = useAuth();
  const { user, profile } = useAuthStore();

  const [activeTab, setActiveTab] = useState('signup');

  // ── Sign-up fields ────────────────────────────────────────────────
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');

  // ── Login fields ──────────────────────────────────────────────────
  const [loginEmail,    setLoginEmail]    = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  // ── Redirect once session + profile land in the store ─────────────
  // This fires after both signUp() and signIn() succeed, because
  // onAuthStateChange (in AuthBootstrap) updates the store automatically.
  useEffect(() => {
    if (!user || !profile) return;

    const from = location.state?.from?.pathname;
    navigate(
      from || (profile.role === 'admin' ? '/admin' : '/dashboard'),
      { replace: true },
    );
  }, [user, profile]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tab switch ────────────────────────────────────────────────────
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  // ── Sign-up submit ────────────────────────────────────────────────
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    const nameCheck = validateName(name);
    if (!nameCheck.valid) { setError(nameCheck.message); return; }

    const emailCheck = validateEmail(email);
    if (!emailCheck.valid) { setError(emailCheck.message); return; }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) { setError(passCheck.message); return; }

    const matchCheck = validatePasswordMatch(password, confirm);
    if (!matchCheck.valid) { setError(matchCheck.message); return; }

    setLoading(true);
    try {
      await signUp(email.trim(), password);

      // Save extra profile fields now that the account exists.
      // updateProfile() reads user.id from the store which onAuthStateChange
      // has already populated by the time signUp() resolves.
      await updateProfile({
        full_name: name.trim(),
      });

      // Redirect is handled by the useEffect above once profile is in the store.
    } catch (err) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Log-in submit ─────────────────────────────────────────────────
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');

    const emailCheck = validateEmail(loginEmail);
    if (!emailCheck.valid) { setError(emailCheck.message); return; }

    if (!loginPassword) { setError('Password is required.'); return; }

    setLoading(true);
    try {
      await signIn(loginEmail.trim(), loginPassword);
      // Redirect handled by the useEffect above.
    } catch (err) {
      setError(parseAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Styles ────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%',
    backgroundColor: 'transparent',
    border: '2px solid #6D28D9',
    borderRadius: '16px',
    padding: '20px 24px',
    color: 'white',
    fontSize: '1.5rem',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const primaryBtn = (disabled = false) => ({
    width: '100%',
    backgroundColor: disabled ? '#4B1DA3' : '#6D28D9',
    color: 'white',
    fontWeight: 'bold',
    padding: '20px',
    borderRadius: '16px',
    fontSize: '1.75rem',
    textTransform: 'uppercase',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    marginTop: '32px',
    opacity: disabled ? 0.7 : 1,
  });

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#111827',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        {/* ── Header ───────────────────────────────────────────────── */}
        <div style={{
          width: '100%',
          backgroundColor: '#6D28D9',
          borderRadius: '40px',
          padding: '48px 0',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <h1 style={{
            color: 'white',
            fontSize: '4rem',
            fontFamily: 'Impact, Arial Black, sans-serif',
            fontStyle: 'italic',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            WELCOME !
          </h1>
        </div>

        {/* ── Tab toggle ───────────────────────────────────────────── */}
        <div style={{
          width: '100%',
          maxWidth: '448px',
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 16px',
          marginBottom: '8px',
        }}>
          {[
            { key: 'signup', label: 'Sign-up' },
            { key: 'login',  label: 'Log-in'  },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleTabSwitch(key)}
              style={{
                fontSize: '2rem',
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontStyle: 'italic',
                textTransform: 'uppercase',
                paddingBottom: '4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: activeTab === key ? '#6D28D9' : 'white',
                borderBottom: activeTab === key ? '4px solid #6D28D9' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{
          width: '100%',
          height: '2px',
          backgroundColor: 'rgba(109,40,217,0.3)',
          marginBottom: '32px',
        }} />

        {/* ── Error banner ─────────────────────────────────────────── */}
        {error && (
          <div style={{
            width: '100%',
            backgroundColor: 'rgba(239,68,68,0.15)',
            border: '1px solid #EF4444',
            borderRadius: '12px',
            padding: '14px 20px',
            color: '#FCA5A5',
            fontSize: '1rem',
            marginBottom: '20px',
            boxSizing: 'border-box',
          }}>
            {error}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            SIGN-UP  (tab = 'signup')
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'signup' && (
          <form
            onSubmit={handleSignUp}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              disabled={loading}
              autoComplete="name"
            />

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={inputStyle}
              disabled={loading}
              autoComplete="email"
            />

            <input
              type="password"
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
              disabled={loading}
              autoComplete="new-password"
            />

            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              style={inputStyle}
              disabled={loading}
              autoComplete="new-password"
            />

            <button type="submit" disabled={loading} style={primaryBtn(loading)}>
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>
        )}

        {/* ══════════════════════════════════════════════════════════
            LOG-IN  (tab = 'login')
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'login' && (
          <form
            onSubmit={handleSignIn}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <input
              type="email"
              placeholder="Email address"
              value={loginEmail}
              onChange={e => setLoginEmail(e.target.value)}
              style={inputStyle}
              disabled={loading}
              autoComplete="email"
            />

            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={e => setLoginPassword(e.target.value)}
              style={inputStyle}
              disabled={loading}
              autoComplete="current-password"
            />

            <button type="submit" disabled={loading} style={primaryBtn(loading)}>
              {loading ? 'Signing in…' : 'Log In'}
            </button>
          </form>
        )}

        {/* ── Back to home ─────────────────────────────────────────── */}
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
    </div>
  );
};

export default SignUpPage;
