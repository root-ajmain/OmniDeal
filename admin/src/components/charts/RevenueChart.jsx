import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminAPI } from '../../utils/api.js';
import { formatPrice } from '../../utils/helpers.js';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-card text-sm">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="text-amber-700 font-bold">{formatPrice(payload.find(p => p.dataKey === 'revenue')?.value)}</p>
      <p className="text-gray-500">{payload.find(p => p.dataKey === 'orders')?.value} orders</p>
    </div>
  );
};

export default function RevenueChart() {
  const [days, setDays] = useState(30);

  const { data, isLoading } = useQuery({
    queryKey: ['revenue-chart', days],
    queryFn: () => adminAPI.getRevenueChart(days).then(r => r.data.data),
  });

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-800">Revenue Overview</h3>
        <div className="flex gap-1">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${days === d ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse bg-gray-100 rounded-xl" />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data || []} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="_id" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `৳${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#d97706" strokeWidth={2} fill="url(#revenueGrad)" />
            <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} fill="none" strokeDasharray="4 4" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
