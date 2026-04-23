import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggle: (productId) => {
        set(s => ({
          items: s.items.includes(productId)
            ? s.items.filter(id => id !== productId)
            : [...s.items, productId],
        }));
      },

      isWished: (productId) => get().items.includes(productId),

      clear: () => set({ items: [] }),
    }),
    { name: 'omnideal-wishlist' }
  )
);

export default useWishlistStore;
