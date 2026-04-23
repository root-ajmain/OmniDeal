import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getFeaturedImage } from '../utils/helpers.js';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

      addItem: (product, quantity = 1, variantInfo = '') => {
        const key = `${product._id}-${variantInfo}`;
        set(state => {
          const existing = state.items.find(i => i.key === key);
          if (existing) {
            return {
              items: state.items.map(i =>
                i.key === key ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return {
            items: [...state.items, {
              key,
              _id: product._id,
              name: product.name,
              image: getFeaturedImage(product.images),
              price: product.pricing?.sale || product.pricing?.regular || 0,
              regularPrice: product.pricing?.regular || 0,
              quantity,
              variantInfo,
              slug: product.slug,
            }],
          };
        });
        set({ isOpen: true });
      },

      removeItem: (key) => set(s => ({ items: s.items.filter(i => i.key !== key) })),

      updateQuantity: (key, quantity) => {
        if (quantity < 1) return get().removeItem(key);
        set(s => ({ items: s.items.map(i => i.key === key ? { ...i, quantity } : i) }));
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'omnideal-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export default useCartStore;
