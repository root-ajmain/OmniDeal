import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../store/cartStore.js';
import { formatPrice } from '../utils/helpers.js';
import BackButton from '../components/ui/BackButton.jsx';
import { FREE_DELIVERY_THRESHOLD } from '../utils/constants.js';

export default function Cart() {
  const { items, removeItem, updateQuantity, getSubtotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const subtotal = getSubtotal();
  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 60;
  const total = subtotal + deliveryCharge;

  if (!items.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-800 mb-3">Your cart is empty</h2>
        <p className="text-slate-400 mb-8">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn-primary inline-flex">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <BackButton className="mb-6" />
      <h1 className="text-2xl font-display font-bold text-gray-900 mb-8">Shopping Cart ({items.length})</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map(item => (
              <motion.div
                key={item.key}
                layout
                exit={{ opacity: 0, x: -20 }}
                className="card p-5 flex gap-4"
              >
                <Link to={`/product/${item.slug}`}>
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl bg-gray-100 shrink-0" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.slug}`}>
                    <h3 className="text-gray-800 font-medium hover:text-brand-700 transition-colors line-clamp-2">{item.name}</h3>
                  </Link>
                  {item.variantInfo && <p className="text-slate-500 text-xs mt-1">{item.variantInfo}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center glass rounded-xl">
                      <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="px-3 py-2 text-slate-400 hover:text-gray-900 text-base leading-none">−</button>
                      <span className="text-gray-800 text-sm w-8 text-center font-medium">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="px-3 py-2 text-slate-400 hover:text-gray-900 text-base leading-none">+</button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-brand-600 font-bold">{formatPrice(item.price * item.quantity)}</span>
                      <button onClick={() => removeItem(item.key)} className="text-slate-400 hover:text-red-400 transition-colors text-sm">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button onClick={clearCart} className="text-sm text-slate-500 hover:text-red-400 transition-colors">
            Clear cart
          </button>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="card p-6 space-y-4 sticky top-20">
            <h3 className="font-semibold text-gray-800">Order Summary</h3>

            {subtotal < FREE_DELIVERY_THRESHOLD && (
              <div className="p-3 bg-brand-600/10 rounded-xl border border-brand-600/20">
                <p className="text-xs text-slate-400">
                  Add <span className="text-brand-600 font-semibold">{formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)}</span> more for free delivery!
                </p>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-brand rounded-full transition-all" style={{ width: `${(subtotal / FREE_DELIVERY_THRESHOLD) * 100}%` }} />
                </div>
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery</span>
                <span className={deliveryCharge === 0 ? 'text-emerald-500' : ''}>{deliveryCharge === 0 ? 'FREE' : formatPrice(deliveryCharge)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span className="text-brand-600 text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            <Link to="/checkout" className="w-full btn-primary py-3 flex items-center justify-center gap-2">
              Proceed to Checkout
            </Link>
            <Link to="/products" className="block text-center text-sm text-slate-500 hover:text-gray-700 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
