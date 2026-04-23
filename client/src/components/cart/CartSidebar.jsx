import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../../store/cartStore.js';
import { formatPrice } from '../../utils/helpers.js';
import { FREE_DELIVERY_THRESHOLD } from '../../utils/constants.js';

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getItemCount } = useCartStore();
  const navigate = useNavigate();
  const subtotal = getSubtotal();

  const handleCheckout = () => {
    closeCart();
    // Navigate after close animation starts — prevents backdrop from blocking checkout
    setTimeout(() => navigate('/checkout'), 50);
  };
  const remaining = FREE_DELIVERY_THRESHOLD - subtotal;

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm z-50 bg-white border-l border-gray-200 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Cart ({getItemCount()})</h2>
              <button onClick={closeCart} className="btn-ghost px-2 py-1 text-lg leading-none">✕</button>
            </div>

            {/* Free delivery bar */}
            {remaining > 0 && (
              <div className="px-5 py-3 bg-brand-600/10 border-b border-brand-600/20">
                <p className="text-xs text-slate-400">
                  Add <span className="text-brand-600 font-semibold">{formatPrice(remaining)}</span> more for free delivery!
                </p>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-brand rounded-full transition-all"
                    style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {remaining <= 0 && (
              <div className="px-5 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                <p className="text-xs text-emerald-500 font-medium">You qualify for free delivery!</p>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <AnimatePresence>
                {items.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <p className="text-slate-500">Your cart is empty</p>
                    <Link to="/products" onClick={closeCart} className="btn-primary mt-4 inline-flex text-sm">
                      Shop Now
                    </Link>
                  </div>
                ) : (
                  items.map(item => (
                    <motion.div
                      key={item.key}
                      layout
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-3 group"
                    >
                      <Link to={`/product/${item.slug}`} onClick={closeCart}>
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl bg-gray-100" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.slug}`} onClick={closeCart}>
                          <p className="text-gray-700 text-sm font-medium line-clamp-1 hover:text-brand-700 transition-colors">{item.name}</p>
                        </Link>
                        {item.variantInfo && <p className="text-slate-500 text-xs">{item.variantInfo}</p>}
                        <p className="text-brand-600 text-sm font-semibold mt-1">{formatPrice(item.price)}</p>

                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center glass rounded-lg">
                            <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="px-2 py-1 text-slate-400 hover:text-gray-900 transition-colors text-base leading-none">−</button>
                            <span className="text-gray-800 text-sm w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="px-2 py-1 text-slate-400 hover:text-gray-900 transition-colors text-base leading-none">+</button>
                          </div>
                          <button onClick={() => removeItem(item.key)} className="text-xs text-slate-400 hover:text-red-400 transition-colors">
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-gray-700 text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-5 border-t border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-gray-900 font-semibold text-lg">{formatPrice(subtotal)}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                </button>
                <Link to="/cart" onClick={closeCart} className="block text-center text-sm text-slate-400 hover:text-gray-800 transition-colors">
                  View Full Cart
                </Link>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
