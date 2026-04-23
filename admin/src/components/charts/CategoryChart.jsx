import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { adminAPI } from '../../utils/api.js';
import { formatPrice } from '../../utils/helpers.js';

const COLORS = ['#d97706', '#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#ef4444'];

export default function CategoryChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['category-chart'],
    queryFn: () => adminAPI.getCategoryChart().then(r => r.data.data),
  });

  return (
    <div className="card p-5 space-y-4 h-full">
      <h3 className="font-semibold text-gray-800">Revenue by Category</h3>
      {isLoading ? (
        <div className="h-48 animate-pulse bg-gray-50 rounded-xl" />
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data || []} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="revenue" nameKey="_id">
              {(data || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => formatPrice(v)} contentStyle={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12, color: '#111827' }} />
            <Legend formatter={(v) => <span style={{ color: '#6b7280', fontSize: 12 }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
