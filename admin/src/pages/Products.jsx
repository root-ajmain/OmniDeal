import { useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAPI } from '../utils/api.js';
import { formatPrice, getFeaturedImage } from '../utils/helpers.js';
import BackButton from '../components/ui/BackButton.jsx';

export default function Products() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => productsAPI.getAll({ search, page, limit: 15 }).then(r => r.data),
    placeholderData: keepPreviousData,
  });

  const { mutate: deleteProduct } = useMutation({
    mutationFn: (id) => productsAPI.delete(id),
    onSuccess: () => { toast.success('Product deleted'); qc.invalidateQueries({ queryKey: ['admin-products'] }); },
    onError: () => toast.error('Delete failed'),
  });

  const handleDelete = (id, name) => {
    if (confirm(`Delete "${name}"? This cannot be undone.`)) deleteProduct(id);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl font-display font-bold text-gray-900">Products</h1>
        {data?.pagination && <span className="badge bg-dark-700 text-slate-400">{data.pagination.total}</span>}
        <Link to="/products/new" className="ml-auto btn-primary">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="flex items-center glass rounded-xl px-3 gap-2">
        <Search className="w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search products..." className="flex-1 bg-transparent text-gray-800 placeholder-slate-500 outline-none py-2.5 text-sm" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Product', 'Category', 'Price', 'Stock', 'Status', 'Sales', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 text-xs font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="h-10 bg-gray-50 rounded animate-pulse" /></td></tr>)
              : data?.products?.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={getFeaturedImage(product.images)} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-dark-700 shrink-0" />
                        <div>
                          <p className="text-gray-700 text-sm font-medium line-clamp-1 max-w-[180px]">{product.name}</p>
                          {product.sku && <p className="text-slate-600 text-xs">{product.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{product.category?.name}</td>
                    <td className="px-4 py-3">
                      <p className="text-brand-600 text-sm font-medium">{formatPrice(product.pricing?.sale || product.pricing?.regular)}</p>
                      {product.pricing?.sale && <p className="text-slate-600 text-xs line-through">{formatPrice(product.pricing.regular)}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.inventory?.quantity === 0 ? 'text-red-400' : product.inventory?.quantity <= 5 ? 'text-orange-400' : 'text-emerald-400'}`}>
                        {product.inventory?.quantity ?? '∞'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${product.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : product.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-slate-500/10 text-slate-400'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{product.salesCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={`/products/${product._id}/edit`} className="btn-ghost p-1.5"><Edit className="w-4 h-4" /></Link>
                        <button onClick={() => handleDelete(product._id, product.name)} className="btn-ghost p-1.5 text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        {!isLoading && !data?.products?.length && <div className="text-center py-10 text-slate-500">No products found</div>}
      </div>

      {data?.pagination?.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-sm border transition-all ${p === page ? 'bg-brand-600/20 text-brand-600 border-brand-600/30' : 'text-slate-400 border-gray-200 hover:border-gray-200'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
