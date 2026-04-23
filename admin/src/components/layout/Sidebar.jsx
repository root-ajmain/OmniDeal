import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users, Star,
  Ticket, BarChart3, LogOut, Zap, Image,
  RotateCcw, Settings, ExternalLink, ChevronRight,
} from 'lucide-react';
import useAdminAuthStore from '../../store/adminAuthStore.js';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, color: 'text-sky-400' },
  { to: '/products', label: 'Products', icon: Package, color: 'text-violet-400' },
  { to: '/categories', label: 'Categories', icon: Tag, color: 'text-emerald-400' },
  { to: '/orders', label: 'Orders', icon: ShoppingBag, color: 'text-amber-400' },
  { to: '/customers', label: 'Customers', icon: Users, color: 'text-pink-400' },
  { to: '/reviews', label: 'Reviews', icon: Star, color: 'text-yellow-400' },
  { to: '/coupons', label: 'Coupons', icon: Ticket, color: 'text-cyan-400' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, color: 'text-indigo-400' },
];

const MARKETING = [
  { to: '/banners', label: 'Banners', icon: Image, color: 'text-orange-400' },
  { to: '/flash-sales', label: 'Flash Sales', icon: Zap, color: 'text-red-400' },
];

const STORE = [
  { to: '/returns', label: 'Returns', icon: RotateCcw, color: 'text-teal-400' },
  { to: '/settings', label: 'Site Settings', icon: Settings, color: 'text-slate-400' },
];

function NavItem({ to, label, icon: Icon, end, color, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
          isActive
            ? 'bg-white/10 text-white'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/10' : 'bg-white/5 group-hover:bg-white/10'} transition-colors`}>
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : color}`} />
            </div>
            {label}
          </div>
          {isActive && <ChevronRight className="w-3 h-3 text-white/50" />}
        </>
      )}
    </NavLink>
  );
}

function Section({ label, items, onClose }) {
  return (
    <div className="pt-4">
      <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider px-3 mb-2">{label}</p>
      <div className="space-y-0.5">
        {items.map(item => <NavItem key={item.to} {...item} onClick={onClose} />)}
      </div>
    </div>
  );
}

export default function Sidebar({ onClose }) {
  const { user, logout } = useAdminAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="w-64 h-full bg-slate-900 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-base tracking-tight">OmniDeal</p>
            <p className="text-slate-500 text-xs">Admin Panel</p>
          </div>
        </div>
        <a
          href={import.meta.env.VITE_CLIENT_URL || 'http://localhost:3000'}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-400 transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> View Store
        </a>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
        {NAV.map(item => <NavItem key={item.to} {...item} onClick={onClose} />)}
        <Section label="Marketing" items={MARKETING} onClose={onClose} />
        <Section label="Store" items={STORE} onClose={onClose} />
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl bg-white/5">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.name}</p>
            <p className="text-slate-500 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
