import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { categoriesAPI } from '../../utils/api.js';
import { Skeleton } from '../ui/Skeleton.jsx';

const GRADIENTS = [
  'from-violet-500/80 to-purple-700/80',
  'from-amber-400/80 to-orange-600/80',
  'from-emerald-400/80 to-teal-600/80',
  'from-rose-400/80 to-pink-600/80',
  'from-sky-400/80 to-blue-600/80',
  'from-yellow-400/80 to-amber-600/80',
  'from-fuchsia-400/80 to-purple-600/80',
  'from-cyan-400/80 to-sky-600/80',
];

const BG_PATTERNS = [
  "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%)",
  "radial-gradient(circle at 70% 70%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 40%)",
  "radial-gradient(circle at 50% 80%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.1) 0%, transparent 40%)",
];

export default function CategoryGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesAPI.getAll().then(r => r.data.categories),
    staleTime: 10 * 60 * 1000,
  });

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <h2 className="section-title mb-3">Shop by Category</h2>
        <p className="text-slate-400">Explore our curated collections</p>
        <div className="w-20 h-1 bg-gradient-brand rounded-full mx-auto mt-4" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-2xl" />)
          : data?.map((cat, i) => {
              const grad = GRADIENTS[i % GRADIENTS.length];
              const pattern = BG_PATTERNS[i % BG_PATTERNS.length];
              return (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    className={`group relative flex flex-col justify-between h-44 p-5 rounded-2xl overflow-hidden bg-gradient-to-br ${grad} shadow-lg hover:shadow-xl transition-all duration-300`}
                    style={{ backgroundImage: `${pattern}` }}
                  >
                    {/* Glassmorphism inner card */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${grad}`} />
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ backgroundImage: pattern }}
                    />

                    {/* Decorative circle */}
                    <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-sm" />
                    <div className="absolute -right-2 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-md" />

                    {/* Product count pill */}
                    <div className="relative z-10 self-start">
                      <span className="text-xs font-medium bg-white/20 backdrop-blur-sm text-white px-2.5 py-1 rounded-full border border-white/30">
                        {cat.productCount || 0} items
                      </span>
                    </div>

                    {/* Category name + arrow */}
                    <div className="relative z-10">
                      <p className="text-white font-bold text-lg leading-tight drop-shadow-sm mb-1">
                        {cat.name}
                      </p>
                      {cat.description && (
                        <p className="text-white/70 text-xs line-clamp-1">{cat.description}</p>
                      )}
                      <div className="mt-3 flex items-center gap-1 text-white/80 text-xs font-medium group-hover:text-white group-hover:gap-2 transition-all">
                        Shop now <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })
        }
      </div>
    </section>
  );
}
