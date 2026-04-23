import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useAuthStore = create(persist(
  (set, get) => ({
    user: null,
    token: null,
    isLoading: false,

    setAuth: (user, token) => set({ user, token }),
    clearAuth: () => set({ user: null, token: null }),

    login: async (email, password) => {
      set({ isLoading: true });
      try {
        const res = await axios.post(`${API}/auth/login`, { email, password });
        set({ user: res.data.user, token: res.data.token, isLoading: false });
        return res.data;
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    register: async (name, email, password, phone) => {
      set({ isLoading: true });
      try {
        const res = await axios.post(`${API}/auth/register`, { name, email, password, phone });
        set({ user: res.data.user, token: res.data.token, isLoading: false });
        return res.data;
      } catch (err) {
        set({ isLoading: false });
        throw err;
      }
    },

    logout: () => {
      set({ user: null, token: null });
    },

    fetchMe: async () => {
      const { token } = get();
      if (!token) return;
      try {
        const res = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        set({ user: res.data.user });
      } catch {
        set({ user: null, token: null });
      }
    },

    updateProfile: async (data) => {
      const { token } = get();
      const res = await axios.put(`${API}/auth/profile`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: res.data.user });
      return res.data;
    },
  }),
  {
    name: 'omnideal-auth',
    partialize: (state) => ({ user: state.user, token: state.token }),
  }
));

export default useAuthStore;
