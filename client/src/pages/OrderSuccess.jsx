import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { formatPrice, formatDate } from '../utils/helpers.js';

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="w-24 h-24 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-8"
      >
        <CheckCircle className="w-12 h-12 text-emerald-400" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-3">Order Placed!</h1>
        <p className="text-slate-400 mb-8">Thank you for your order. We'll get it ready for delivery soon!</p>

        {order && (
          <div className="card p-6 text-left space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">Order Number</p>
                <p className="text-brand-600 font-bold text-lg">{order.orderNumber}</p>
              </div>
              <div className="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-brand-600" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Delivery to</span>
                <span className="text-gray-700">{order.delivery?.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Payment</span>
                <span className="text-gray-700 capitalize">{order.payment?.method}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-slate-400">Total</span>
                <span className="text-brand-600">{formatPrice(order.pricing?.total)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {order?.orderNumber && (
            <Link to={`/track-order/${order.orderNumber}`} className="btn-primary">
              <Package className="w-5 h-5" />
              Track Order
            </Link>
          )}
          <Link to="/products" className="btn-secondary">
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
