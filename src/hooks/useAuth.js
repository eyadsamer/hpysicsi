import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, profile, loading, setUser, setProfile, setLoading, clearAuth } = useAuthStore();
  const navigate = useNavigate();

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchAndSetProfile(session.user.id);
      } else {
        clearAuth();
      }
    });

    return () => { mounted = false; subscription.unsubscribe(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  async function signUp(email, password, fullName) {
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  }

  async function updateProfile(fields) {
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase
      .from('profiles')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', user.id);
    if (error) throw error;
    await fetchAndSetProfile(user.id);
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    clearAuth();
    navigate('/signup');
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.is_admin === true,
    signUp,
    signIn,
    resetPassword,
    updatePassword,
    updateProfile,
    signOut,
  };
}
