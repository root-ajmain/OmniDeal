import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';
import { ProductCardSkeleton } from '../ui/Skeleton.jsx';

export default function SuggestedProducts({ products = [], isLoading, title = 'You May Also Like' }) {
  if (!isLoading && !products.length) return null;

  return (
    <section className="mt-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="section-title">{title}</h2>
          <div className="w-16 h-1 bg-gradient-brand rounded-full mt-2" />
        </div>
        <Link to="/products" className="text-brand-600 hover:text-brand-500 text-sm font-medium transition-colors">
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.slice(0, 8).map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))
        }
      </div>
    </section>
  );
}
