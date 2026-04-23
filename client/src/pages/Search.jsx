import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search as SearchIcon } from 'lucide-react';
import { productsAPI } from '../utils/api.js';
import ProductGrid from '../components/product/ProductGrid.jsx';
import BackButton from '../components/ui/BackButton.jsx';

export default function Search() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'search', q],
    queryFn: () => productsAPI.getAll({ search: q, limit: 24 }).then(r => r.data),
    enabled: !!q,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <BackButton className="mb-6" />
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SearchIcon className="w-6 h-6 text-brand-600" />
          <h1 className="text-2xl font-display font-bold text-gray-900">
            {q ? `Results for "${q}"` : 'Search Products'}
          </h1>
        </div>
        {data?.pagination && (
          <p className="text-slate-500 text-sm">{data.pagination.total} products found</p>
        )}
      </div>

      {!q ? (
        <div className="text-center py-20">
          <SearchIcon className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400">Enter a search term to find products</p>
        </div>
      ) : (
        <ProductGrid products={data?.products} isLoading={isLoading} />
      )}
    </div>
  );
}
