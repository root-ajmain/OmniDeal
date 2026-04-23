import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar.jsx';
import useAdminAuthStore from '../../store/adminAuthStore.js';

const LABELS = {
  '': 'Dashboard',
  products: 'Products',
  categories: 'Categories',
  orders: 'Orders',
  customers: 'Customers',
  reviews: 'Reviews',
  coupons: 'Coupons',
  analytics: 'Analytics',
  banners: 'Banners',
  'flash-sales': 'Flash Sales',
  returns: 'Returns',
  settings: 'Site Settings',
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user } = useAdminAuthStore();

  const segments = location.pathname.split('/').filter(Boolean);
  const crumbs = [
    { label: 'Dashboard', path: '/' },
    ...segments.map((seg, i) => ({
      label: LABELS[seg] || seg,
      path: '/' + segments.slice(0, i + 1).join('/'),
    })),
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full z-50 lg:hidden"
            >
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center px-5 shrink-0 gap-4 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 flex-1 min-w-0">
            {crumbs.map((crumb, i) => (
              <div key={crumb.path} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                <span className={`text-sm truncate ${i === crumbs.length - 1 ? 'text-gray-800 font-semibold' : 'text-slate-400'}`}>
                  {crumb.label}
                </span>
              </div>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
              <Bell className="w-4.5 h-4.5 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <p className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
