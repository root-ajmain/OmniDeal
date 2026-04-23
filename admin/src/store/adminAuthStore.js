import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAdminAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem('omnideal-admin-token', token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem('omnideal-admin-token');
        set({ user: null, token: null });
      },
    }),
    { name: 'omnideal-admin', partialize: s => ({ user: s.user, token: s.token }) }
  )
);

export default useAdminAuthStore;
