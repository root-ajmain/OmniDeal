import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsAPI } from '../../utils/api.js';
import ProductGrid from '../product/ProductGrid.jsx';

export default function FeaturedProducts() {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsAPI.getFeatured().then(r => r.data.products),
  });

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="section-title mb-2">Featured Products</h2>
            <div className="w-16 h-1 bg-gradient-brand rounded-full" />
          </div>
          <Link to="/products?badge=featured" className="text-brand-600 hover:text-brand-500 text-sm font-medium transition-colors">
            View all →
          </Link>
        </div>
        <ProductGrid products={data} isLoading={isLoading} />
      </div>
    </section>
  );
}
