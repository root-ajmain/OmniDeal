import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Eye } from 'lucide-react';
import { ordersAPI } from '../utils/api.js';
import { formatPrice, formatDate, statusColor, statusLabel } from '../utils/helpers.js';
import BackButton from '../components/ui/BackButton.jsx';

const STATUSES = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', { search: debouncedSearch, status, page }],
    queryFn: () => ordersAPI.getAll({ search: debouncedSearch, status, page, limit: 20 }).then(r => r.data),
  });

  const handleSearch = (e) => setSearch(e.target.value);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl font-display font-bold text-gray-900">Orders</h1>
        {data?.pagination && <span className="badge bg-dark-700 text-slate-400">{data.pagination.total}</span>}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center glass rounded-xl px-3 gap-2 flex-1 min-w-48">
          <Search className="w-4 h-4 text-slate-500" />
          <input value={search} onChange={handleSearch} placeholder="Search order, name, phone..." className="flex-1 bg-transparent text-gray-800 placeholder-slate-500 outline-none py-2.5 text-sm" />
        </div>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="input-field w-auto">
          {STATUSES.map(s => <option key={s} value={s}>{s ? statusLabel[s] : 'All Status'}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Order', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 text-xs font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-gray-50 rounded animate-pulse" /></td></tr>
                ))
              : data?.orders?.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-brand-600 text-sm font-medium">{order.orderNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 text-sm">{order.delivery?.name}</p>
                      <p className="text-slate-500 text-xs">{order.delivery?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{order.items?.length}</td>
                    <td className="px-4 py-3 text-brand-600 text-sm font-semibold">{formatPrice(order.pricing?.total)}</td>
                    <td className="px-4 py-3">
                      <span className="text-slate-400 text-xs capitalize">{order.payment?.method}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${statusColor[order.status]}`}>{statusLabel[order.status]}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(order.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link to={`/orders/${order._id}`} className="btn-ghost p-1.5">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        {!isLoading && !data?.orders?.length && (
          <div className="text-center py-10 text-slate-500">No orders found</div>
        )}
      </div>

      {/* Pagination */}
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
