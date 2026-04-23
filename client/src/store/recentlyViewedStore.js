import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useRecentlyViewedStore = create(persist(
  (set, get) => ({
    items: [],
    add: (product) => {
      const { items } = get();
      const filtered = items.filter(p => p._id !== product._id);
      const slim = {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        images: product.images?.slice(0, 1),
        pricing: product.pricing,
        avgRating: product.avgRating,
        reviewCount: product.reviewCount,
        badges: product.badges,
        category: product.category,
        inventory: product.inventory,
      };
      set({ items: [slim, ...filtered].slice(0, 10) });
    },
    clear: () => set({ items: [] }),
  }),
  { name: 'omnideal-recently-viewed' }
));

export default useRecentlyViewedStore;
