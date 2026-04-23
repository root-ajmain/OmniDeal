import { motion } from 'framer-motion';
import ProductCard from './ProductCard.jsx';
import { ProductCardSkeleton } from '../ui/Skeleton.jsx';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function ProductGrid({ products, isLoading, cols = 4 }) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
  }[cols] || 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  if (isLoading) {
    return (
      <div className={`grid ${gridCols} gap-4`}>
        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">🛍️</p>
        <p className="text-slate-400 text-lg">No products found</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`grid ${gridCols} gap-4`}
    >
      {products.map(product => (
        <motion.div key={product._id} variants={item}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
