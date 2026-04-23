import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, User } from 'lucide-react';
import { adminAPI } from '../utils/api.js';
import { formatDate } from '../utils/helpers.js';
import BackButton from '../components/ui/BackButton.jsx';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', debouncedSearch, page],
    queryFn: () => adminAPI.getCustomers({ search: debouncedSearch, page, limit: 20 }).then(r => r.data),
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl font-display font-bold text-gray-900">Customers</h1>
        {data?.pagination && <span className="badge bg-dark-700 text-slate-400">{data.pagination.total}</span>}
      </div>

      <div className="flex items-center glass rounded-xl px-3 gap-2">
        <Search className="w-4 h-4 text-slate-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone..." className="flex-1 bg-transparent text-gray-800 placeholder-slate-500 outline-none py-2.5 text-sm" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              {['Customer', 'Email', 'Phone', 'Role', 'Joined', 'Last Login'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-slate-500 text-xs font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-50 rounded animate-pulse" /></td></tr>)
              : data?.customers?.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {c.avatar
                          ? <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                          : <div className="w-8 h-8 bg-gradient-brand rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{c.name?.[0]}</div>
                        }
                        <span className="text-gray-700 text-sm font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{c.email}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{c.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${c.role === 'admin' ? 'bg-brand-600/20 text-brand-600' : 'bg-slate-700 text-slate-400'}`}>{c.role}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(c.createdAt)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{c.lastLogin ? formatDate(c.lastLogin) : '—'}</td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        {!isLoading && !data?.customers?.length && <div className="text-center py-10 text-slate-500">No customers found</div>}
      </div>

      {data?.pagination?.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-9 h-9 rounded-lg text-sm border ${p === page ? 'bg-brand-600/20 text-brand-600 border-brand-600/30' : 'text-slate-400 border-gray-200 hover:border-gray-200'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
