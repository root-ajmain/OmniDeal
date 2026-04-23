import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingBag, Package, Users, Star, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../utils/api.js';
import StatsCard from '../components/ui/StatsCard.jsx';
import RevenueChart from '../components/charts/RevenueChart.jsx';
import CategoryChart from '../components/charts/CategoryChart.jsx';
import { formatPrice, formatDate, statusColor, statusLabel } from '../utils/helpers.js';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminAPI.getDashboard().then(r => r.data),
    refetchInterval: 60000,
  });

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={stats ? formatPrice(stats.totalRevenue) : '—'}
          icon={DollarSign}
          iconBg="bg-emerald-500/20"
          iconColor="text-emerald-400"
          change={stats?.revenueGrowth}
          changeLabel="vs last month"
        />
        <StatsCard
          title="Total Orders"
          value={stats?.totalOrders || '—'}
          icon={ShoppingBag}
          iconBg="bg-blue-500/20"
          iconColor="text-blue-400"
          subtitle={`${stats?.todayOrders || 0} today`}
        />
        <StatsCard
          title="Active Products"
          value={stats?.totalProducts || '—'}
          icon={Package}
          iconBg="bg-brand-600/20"
          iconColor="text-brand-600"
        />
        <StatsCard
          title="Customers"
          value={stats?.totalCustomers || '—'}
          icon={Users}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <CategoryChart />
        </div>
      </div>

      {/* Recent Orders + Pending Reviews */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Recent Orders</h3>
            <Link to="/orders" className="text-brand-600 text-xs hover:text-brand-500">View all</Link>
          </div>
          <div className="divide-y divide-gray-100">
            {data?.recentOrders?.slice(0, 6).map(order => (
              <Link key={order._id} to={`/orders/${order._id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-gray-700 text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-slate-500 text-xs">{order.delivery?.name} · {formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-brand-600 text-sm font-semibold">{formatPrice(order.pricing?.total)}</p>
                  <span className={`badge text-xs ${statusColor[order.status]}`}>{statusLabel[order.status]}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pending reviews + Low stock */}
        <div className="space-y-4">
          {stats?.pendingReviews > 0 && (
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                  <Star className="w-4 h-4 text-yellow-400" />
                </div>
                <div>
                  <p className="text-gray-800 font-medium">{stats.pendingReviews} Pending Reviews</p>
                  <p className="text-slate-500 text-xs">Awaiting approval</p>
                </div>
              </div>
              <Link to="/reviews" className="btn-secondary w-full justify-center text-xs py-2">Review Now</Link>
            </div>
          )}

          <div className="card">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-400" />
                <h3 className="font-semibold text-gray-800">Status Overview</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {data?.statusCounts && Object.entries(data.statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`badge text-xs ${statusColor[status]}`}>{statusLabel[status] || status}</span>
                  <span className="text-slate-400 text-sm font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
