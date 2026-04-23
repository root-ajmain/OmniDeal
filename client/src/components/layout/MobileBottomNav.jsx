import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import useCartStore from '../../store/cartStore.js';
import useWishlistStore from '../../store/wishlistStore.js';
import useAuthStore from '../../store/authStore.js';

const NAV = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/cart', icon: ShoppingCart, label: 'Cart', badge: 'cart' },
  { to: '/wishlist', icon: Heart, label: 'Wishlist', badge: 'wish' },
  { to: '/account', icon: User, label: 'Account', badge: 'user' },
];

export default function MobileBottomNav() {
  const location = useLocation();
  const cartCount = useCartStore(s => s.getItemCount());
  const wishCount = useWishlistStore(s => s.items.length);
  const user = useAuthStore(s => s.user);

  const getBadge = (badge) => {
    if (badge === 'cart') return cartCount;
    if (badge === 'wish') return wishCount;
    return 0;
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 safe-bottom shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV.map(item => {
          const isActive = location.pathname === item.to;
          const badgeCount = item.badge ? getBadge(item.badge) : 0;
          const to = item.to === '/account' && !user ? '/login' : item.to;

          return (
            <Link key={item.to} to={to} className="flex flex-col items-center gap-1 px-3 py-2 relative min-w-0">
              <div className="relative">
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                {badgeCount > 0 && (
                  <motion.span
                    key={badgeCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-brand-600 text-white text-xs rounded-full flex items-center justify-center font-bold leading-none"
                  >
                    {badgeCount > 9 ? '9+' : badgeCount}
                  </motion.span>
                )}
              </div>
              <span className={`text-xs font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-slate-400'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div layoutId="bottom-nav-indicator" className="absolute top-0 inset-x-3 h-0.5 bg-brand-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
