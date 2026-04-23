import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { adminAPI } from '../utils/api.js';
import { formatPrice } from '../utils/helpers.js';
import BackButton from '../components/ui/BackButton.jsx';
import RevenueChart from '../components/charts/RevenueChart.jsx';
import CategoryChart from '../components/charts/CategoryChart.jsx';

export default function Analytics() {
  const { data: lowStock } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => adminAPI.getLowStock().then(r => r.data.products),
  });

  const { data: revenue7d } = useQuery({
    queryKey: ['revenue-chart', 7],
    queryFn: () => adminAPI.getRevenueChart(7).then(r => r.data.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BackButton />
        <h1 className="text-xl font-display font-bold text-gray-900">Analytics</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <CategoryChart />
      </div>

      {/* 7-day orders bar */}
      {revenue7d?.length > 0 && (
        <div className="card p-5 space-y-4">
          <h3 className="font-semibold text-gray-800">Last 7 Days — Orders</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={revenue7d} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a26', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#f1f5f9', fontSize: 12 }} />
              <Bar dataKey="orders" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Low Stock */}
      {lowStock?.length > 0 && (
        <div className="card">
          <div className="p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">⚠️ Low Stock Alert</h3>
            <p className="text-slate-500 text-xs mt-1">Products at or below low stock threshold</p>
          </div>
          <div className="divide-y divide-gray-100">
            {lowStock.map(p => (
              <div key={p._id} className="flex items-center gap-3 p-4">
                {p.images?.[0] && <img src={p.images[0].url} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-dark-700 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 text-sm truncate">{p.name}</p>
                  <p className="text-slate-500 text-xs">{p.category?.name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${p.inventory.quantity === 0 ? 'text-red-400' : 'text-orange-400'}`}>
                    {p.inventory.quantity} left
                  </p>
                  <p className="text-slate-500 text-xs">Alert at {p.inventory.lowStockThreshold}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
