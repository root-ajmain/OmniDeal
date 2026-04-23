import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import useRecentlyViewedStore from '../../store/recentlyViewedStore.js';
import { formatPrice, getFeaturedImage } from '../../utils/helpers.js';

export default function RecentlyViewed({ excludeId }) {
  const items = useRecentlyViewedStore(s => s.items);
  const visible = items.filter(p => p._id !== excludeId).slice(0, 6);

  if (!visible.length) return null;

  return (
    <section className="py-12 border-t border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-slate-400" />
        <h2 className="text-xl font-display font-bold text-gray-900">Recently Viewed</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {visible.map((product, i) => {
          const image = getFeaturedImage(product.images);
          const price = product.pricing?.sale || product.pricing?.regular;
          return (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="shrink-0 w-40"
            >
              <Link to={`/product/${product.slug || product._id}`} className="block group card overflow-hidden">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img src={image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                </div>
                <div className="p-2">
                  <p className="text-gray-700 text-xs font-medium line-clamp-2 group-hover:text-brand-700 transition-colors">{product.name}</p>
                  <p className="text-brand-600 text-sm font-bold mt-1">{formatPrice(price)}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
