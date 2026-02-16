import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: true,

      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (loading) => set({ loading }),
      clearAuth: () => set({ user: null, profile: null, loading: false }),

      isAuthenticated: () => !!get().user,
      // DB uses is_admin boolean (not a role string)
      isAdmin: () => get().profile?.is_admin === true,
    }),
    {
      name: 'physics-auth',
      partialize: (state) => ({ user: state.user, profile: state.profile }),
    }
  )
);
