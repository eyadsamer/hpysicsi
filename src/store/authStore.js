import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Global auth state managed by Zustand.
 * - `user`    : raw Supabase auth.User object (or null)
 * - `profile` : public.profiles row (contains role, full_name, etc.)
 * - `loading` : true while the initial session is being resolved
 *
 * NOTE: server data (courses, enrollments, etc.) should live in React Query,
 * not here.  This store only tracks who is logged in.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,

      // ── setters called by the useAuth hook ──────────────────────────
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),

      /** Wipes all auth state (called on sign-out). */
      clearAuth: () => set({ user: null, profile: null, loading: false }),

      // ── derived helpers ─────────────────────────────────────────────
      /** Returns true if a session exists. */
      isAuthenticated: () => !!get().user,

      /** Returns true if the current user has the 'admin' role. */
      isAdmin: () => get().profile?.role === 'admin',

      /** Returns true if the current user has the 'user' role. */
      isRegularUser: () => get().profile?.role === 'user',
    }),
    {
      name: 'physics-auth',       // localStorage key
      partialize: (state) => ({   // only persist these fields across page reloads
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);
