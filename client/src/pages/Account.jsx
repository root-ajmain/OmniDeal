import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { User, Package, Heart, MapPin, Lock, LogOut, ChevronRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore.js';
import { ordersAPI } from '../utils/api.js';
import { formatPrice, formatDate, statusColor, statusLabel } from '../utils/helpers.js';

const TABS = [
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'security', label: 'Security', icon: Lock },
];

function ProfileTab({ user, onUpdate }) {
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '' });
  const [saving, setSaving] = useState(false);
  const updateProfile = useAuthStore(s => s.updateProfile);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 space-y-5">
      <h3 className="font-semibold text-gray-800 text-lg">Personal Information</h3>
      <div className="flex items-center gap-4 pb-5 border-b border-gray-100">
        <div className="w-16 h-16 bg-gradient-brand rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-brand">
          {user.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-lg">{user.name}</p>
          <p className="text-slate-500 text-sm">{user.email}</p>
        </div>
      </div>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-slate-500 text-sm mb-1.5 block">Full Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="text-slate-500 text-sm mb-1.5 block">Phone Number</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" placeholder="01XXXXXXXXX" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-slate-500 text-sm mb-1.5 block">Email Address</label>
            <input value={user.email} disabled className="input-field opacity-60 cursor-not-allowed" />
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary px-8">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

function OrdersTab() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersAPI.getMyOrders().then(r => r.data),
  });

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;

  const orders = data?.orders || [];

  if (!orders.length) return (
    <div className="card p-12 text-center">
      <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-500">No orders yet</p>
      <Link to="/products" className="btn-primary mt-4">Start Shopping</Link>
    </div>
  );

  return (
    <div className="space-y-3">
      {orders.map(order => (
        <div key={order._id} className="card p-4 hover:shadow-card transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-800">{order.orderNumber}</p>
              <p className="text-slate-500 text-xs mt-0.5">{formatDate(order.createdAt)} · {order.items?.length} item(s)</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-brand-600">{formatPrice(order.pricing?.total)}</p>
              <span className={`badge text-xs mt-1 ${statusColor[order.status]}`}>{statusLabel[order.status] || order.status}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex -space-x-2 flex-1">
              {order.items?.slice(0, 3).map((item, i) => (
                <img key={i} src={item.productImage || `https://picsum.photos/seed/${item.product}/40/40`} className="w-9 h-9 rounded-lg border-2 border-white object-cover" alt={item.productName} />
              ))}
              {order.items?.length > 3 && <div className="w-9 h-9 rounded-lg border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-slate-500">+{order.items.length - 3}</div>}
            </div>
            <Link to={`/track-order/${order.orderNumber}`} className="text-brand-600 text-sm font-medium hover:text-brand-700 flex items-center gap-1">
              Track <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function SecurityTab({ user }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const token = useAuthStore(s => s.token);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const axios = (await import('axios')).default;
      await axios.put(`${API}/auth/change-password`, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Password changed!');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 space-y-5">
      <h3 className="font-semibold text-gray-800 text-lg">Change Password</h3>
      {user.provider === 'google' ? (
        <p className="text-slate-500 text-sm">You signed in with Google. Password change not available.</p>
      ) : (
        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword', label: 'New Password' },
            { key: 'confirm', label: 'Confirm New Password' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-slate-500 text-sm mb-1.5 block">{f.label}</label>
              <input type="password" required value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className="input-field" />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary px-8">
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function Account() {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold text-gray-900">My Account</h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-gradient-brand text-white shadow-brand' : 'text-slate-600 hover:bg-gray-100'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
          <Link to="/wishlist" onClick={() => {}} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-gray-100">
            <Heart className="w-4 h-4" /> Wishlist
          </Link>
          <Link to="/return-request" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-gray-100">
            <Package className="w-4 h-4" /> Return / Refund
          </Link>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === 'profile' && <ProfileTab user={user} />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'security' && <SecurityTab user={user} />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
