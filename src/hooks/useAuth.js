import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

/**
 * useAuth – central hook for all authentication operations.
 *
 * Call this once at the top of the tree (AuthBootstrap in App.jsx) to
 * activate the onAuthStateChange listener for the app lifetime.
 *
 * ── Auth model ────────────────────────────────────────────────────────
 *   Sign-up  : email + password  →  account created, session starts immediately
 *   Login    : email + password  →  session starts immediately
 *
 * REQUIRED Supabase dashboard setting:
 *   Authentication → Settings → "Enable email confirmations" can be OFF
 *   for development (instant signup) or ON for production (email verification).
 *
 * Exported helpers:
 *   signUp(email, password)          – create account, session starts immediately
 *   signIn(email, password)          – login with password
 *   resetPassword(email)             – send password reset email
 *   updatePassword(newPassword)      – update password (after reset)
 *   updateProfile(fields)            – save profile data (name, etc.)
 *   signOut()                        – clear session + store, redirect to /signup
 */
export function useAuth() {
  const { user, profile, loading, setUser, setProfile, setLoading, clearAuth } =
    useAuthStore();
  const navigate = useNavigate();

  // ── Bootstrap: resolve existing session on mount ──────────────────
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        fetchAndSetProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          await fetchAndSetProfile(session.user.id);
        } else {
          clearAuth();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Private helpers ────────────────────────────────────────────────

  async function fetchAndSetProfile(userId) {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('[useAuth] fetchAndSetProfile:', err.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  // ── Public API ─────────────────────────────────────────────────────

  /**
   * Create a new account with email + password.
   *
   * With "Enable email confirmations" turned OFF in Supabase, the session
   * is created immediately — no email verification is needed.
   * With it ON, user must verify email before signing in.
   * onAuthStateChange fires automatically, updating the store.
   *
   * @param {string} email    – Valid email address
   * @param {string} password – min 6 characters (Supabase default)
   * @throws {Error} on Supabase error (e.g. email already registered)
   */
  async function signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  }

  /**
   * Sign in an existing user with email + password.
   * Session is created immediately. onAuthStateChange updates the store.
   *
   * @param {string} email    – Valid email address
   * @param {string} password
   * @throws {Error} on wrong credentials
   */
  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  /**
   * Send a password reset email to the user.
   * User will receive an email with a link to reset their password.
   *
   * @param {string} email – Valid email address
   * @throws {Error} on Supabase error
   */
  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  /**
   * Update the current user's password.
   * Must be called while user has an active session (e.g., after reset link click).
   *
   * @param {string} newPassword – New password (min 6 characters)
   * @throws {Error} on Supabase error
   */
  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  }

  /**
   * Update the current user's profile row.
   * The `role` column is protected by RLS — it cannot be changed here.
   *
   * @param {{ full_name?: string, email?: string }} fields
   * @throws {Error} on DB error
   */
  async function updateProfile(fields) {
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;
    await fetchAndSetProfile(user.id);
  }

  /**
   * Sign out and redirect to /signup.
   * @throws {Error} if Supabase signOut fails
   */
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    clearAuth();
    navigate('/signup');
  }

  return {
    // state
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isRegularUser: profile?.role === 'user',
    // actions
    signUp,
    signIn,
    resetPassword,      // for password reset flow
    updatePassword,     // for password reset flow
    updateProfile,
    signOut,
  };
}
