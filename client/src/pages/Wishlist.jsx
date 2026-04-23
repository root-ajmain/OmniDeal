import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import useWishlistStore from '../store/wishlistStore.js';
import { productsAPI } from '../utils/api.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import BackButton from '../components/ui/BackButton.jsx';

export default function Wishlist() {
  const { items } = useWishlistStore();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist-products', items],
    queryFn: async () => {
      if (!items.length) return { products: [] };
      const results = await Promise.all(items.map(id => productsAPI.getById(id).then(r => r.data.product).catch(() => null)));
      return { products: results.filter(Boolean) };
    },
    enabled: items.length > 0,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <BackButton className="mb-6" />
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
        <h1 className="text-2xl font-display font-bold text-gray-900">My Wishlist</h1>
        {items.length > 0 && <span className="badge bg-pink-500/20 text-pink-400">{items.length}</span>}
      </div>

      {!items.length ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400 text-lg mb-3">Your wishlist is empty</p>
          <Link to="/products" className="btn-primary inline-flex">Browse Products</Link>
        </div>
      ) : (
        <ProductGrid products={data?.products} isLoading={isLoading} />
      )}
    </div>
  );
}
