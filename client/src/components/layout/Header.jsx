import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, Package } from 'lucide-react';
import useCartStore from '../../store/cartStore.js';
import useWishlistStore from '../../store/wishlistStore.js';
import useAuthStore from '../../store/authStore.js';
import { categoriesAPI } from '../../utils/api.js';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catDropdown, setCatDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userRef = useRef(null);

  const cartCount = useCartStore(s => s.getItemCount());
  const openCart = useCartStore(s => s.openCart);
  const wishCount = useWishlistStore(s => s.items.length);
  const { user, logout } = useAuthStore();

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll().then(r => r.data.categories),
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); setCatDropdown(false); setUserDropdown(false); }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => { if (userRef.current && !userRef.current.contains(e.target)) setUserDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200' : 'bg-white border-b border-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center shadow-brand">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="font-display font-bold text-xl gradient-text">OmniDeal</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <Link to="/" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/' ? 'text-brand-600 bg-brand-600/10' : 'text-slate-500 hover:text-gray-900 hover:bg-gray-50'}`}>
              Home
            </Link>
            <Link to="/products" className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/products' ? 'text-brand-600 bg-brand-600/10' : 'text-slate-500 hover:text-gray-900 hover:bg-gray-50'}`}>
              All Products
            </Link>
            <Link to="/flash-sale" className="px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5">
              <span className="w-4 h-4 bg-red-500 rounded flex items-center justify-center"><svg className="w-2.5 h-2.5 text-white fill-white" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></span>
              Flash Sale
            </Link>

            {/* Categories dropdown */}
            <div className="relative">
              <button
                onMouseEnter={() => setCatDropdown(true)}
                onMouseLeave={() => setCatDropdown(false)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Categories <ChevronDown className="w-3 h-3" />
              </button>
              <AnimatePresence>
                {catDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={() => setCatDropdown(true)}
                    onMouseLeave={() => setCatDropdown(false)}
                    className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-card overflow-hidden z-50"
                  >
                    {catData?.map(cat => (
                      <Link key={cat._id} to={`/category/${cat.slug}`} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-amber-50 hover:text-brand-700 transition-colors">
                        <span className="w-5 h-5 rounded bg-amber-100 flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10M7 12h10M7 17h10" /></svg>
                        </span>
                        {cat.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="flex-1" />

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden sm:flex items-center bg-gray-100 rounded-xl px-3 py-2 gap-2 w-48 lg:w-64 focus-within:ring-2 focus-within:ring-brand-500/30 focus-within:bg-white transition-all border border-transparent focus-within:border-brand-500/30">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="bg-transparent text-sm text-gray-800 placeholder-slate-400 outline-none w-full"
            />
          </form>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/wishlist" className="btn-ghost relative p-2.5">
              <Heart className="w-5 h-5" />
              {wishCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{wishCount}</span>
              )}
            </Link>

            <button onClick={openCart} className="btn-ghost relative p-2.5">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <motion.span key={cartCount} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-0.5 right-0.5 w-4 h-4 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </motion.span>
              )}
            </button>

            <Link to="/track-order" className="btn-ghost p-2.5 hidden lg:flex">
              <Package className="w-5 h-5" />
            </Link>

            {/* User */}
            <div className="relative" ref={userRef}>
              <button onClick={() => setUserDropdown(v => !v)} className="btn-ghost p-2.5 flex items-center gap-2">
                {user ? (
                  <div className="w-7 h-7 bg-gradient-brand rounded-full flex items-center justify-center text-white text-xs font-bold shadow-brand">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <User className="w-5 h-5" />
                )}
              </button>
              <AnimatePresence>
                {userDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-card overflow-hidden z-50"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                          <p className="text-slate-400 text-xs truncate">{user.email}</p>
                        </div>
                        <Link to="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <User className="w-4 h-4" /> My Account
                        </Link>
                        <Link to="/account" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <Package className="w-4 h-4" /> My Orders
                        </Link>
                        <button onClick={() => { logout(); setUserDropdown(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 border-t border-gray-100">
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 font-medium">
                          Sign In
                        </Link>
                        <Link to="/register" className="flex items-center gap-3 px-4 py-3 text-sm text-brand-600 hover:bg-amber-50 font-medium border-t border-gray-100">
                          Create Account
                        </Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(v => !v)} className="btn-ghost p-2 md:hidden">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1"
          >
            <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-xl px-3 py-2.5 gap-2 mb-3">
              <Search className="w-4 h-4 text-slate-400" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="bg-transparent text-sm text-gray-800 placeholder-slate-400 outline-none flex-1" />
            </form>
            {[
              { to: '/', label: 'Home' },
              { to: '/products', label: 'All Products' },
              { to: '/flash-sale', label: 'Flash Sale' },
              { to: '/track-order', label: 'Track Order' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="block px-3 py-2.5 text-gray-700 hover:text-brand-600 hover:bg-amber-50 rounded-xl text-sm font-medium transition-colors">{link.label}</Link>
            ))}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <p className="text-slate-400 text-xs px-3 mb-1 font-medium">CATEGORIES</p>
              {catData?.map(cat => (
                <Link key={cat._id} to={`/category/${cat.slug}`} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-brand-600 hover:bg-amber-50 rounded-xl transition-colors">
                  <span className="w-5 h-5 rounded bg-amber-100 flex items-center justify-center shrink-0"><svg className="w-3 h-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></span>
                  {cat.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
