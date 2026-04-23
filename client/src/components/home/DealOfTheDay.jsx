import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { productsAPI } from '../../utils/api.js';
import { formatPrice, getDiscountPercent, getFeaturedImage } from '../../utils/helpers.js';
import useCartStore from '../../store/cartStore.js';

function Countdown({ targetHours = 12 }) {
  const [time, setTime] = useState(targetHours * 3600);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(interval);
  }, []);

  const h = String(Math.floor(time / 3600)).padStart(2, '0');
  const m = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
  const s = String(time % 60).padStart(2, '0');

  return (
    <div className="flex items-center gap-2">
      {[[h, 'HRS'], [m, 'MIN'], [s, 'SEC']].map(([val, label]) => (
        <div key={label} className="flex flex-col items-center">
          <div className="w-14 h-14 bg-white border border-amber-200 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-2xl font-bold font-display text-brand-600">{val}</span>
          </div>
          <span className="text-slate-500 text-xs mt-1">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function DealOfTheDay() {
  const addItem = useCartStore(s => s.addItem);
  const { data: deal, isLoading } = useQuery({
    queryKey: ['deal-of-the-day'],
    queryFn: () => productsAPI.getDeal().then(r => r.data.product),
  });

  if (isLoading || !deal) return null;

  const discount = getDiscountPercent(deal.pricing?.regular, deal.pricing?.sale);
  const price = deal.pricing?.sale || deal.pricing?.regular;

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200">
        {/* Background orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-200/30 rounded-full blur-3xl" />

        <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-100 border border-amber-200 rounded-full px-4 py-1.5 mb-6">
              <span className="text-amber-700 text-sm font-semibold">Deal of the Day</span>
            </div>

            <h2 className="section-title mb-3">{deal.name}</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{deal.shortDescription || deal.description?.slice(0, 120) + '...'}</p>

            {/* Rating */}
            {deal.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(deal.avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-slate-400 text-sm">({deal.reviewCount} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl font-bold text-brand-600">{formatPrice(price)}</span>
              {deal.pricing?.sale && (
                <>
                  <span className="text-slate-500 line-through text-xl">{formatPrice(deal.pricing.regular)}</span>
                  <span className="badge bg-brand-600/20 text-brand-600 border border-brand-600/30 text-sm">-{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Countdown */}
            <div className="mb-6">
              <p className="text-slate-400 text-sm mb-3">Offer ends in:</p>
              <Countdown />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => { addItem(deal); toast.success('Added to cart!'); }}
                className="btn-primary flex-1 py-3"
              >
                Add to Cart
              </button>
              <Link to={`/product/${deal.slug || deal._id}`} className="btn-secondary px-6">
                View Details
              </Link>
            </div>
          </div>

          {/* Image */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="relative"
          >
            <div className="aspect-square max-w-sm mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/50 to-transparent rounded-3xl" />
              <img
                src={getFeaturedImage(deal.images)}
                alt={deal.name}
                className="w-full h-full object-cover rounded-3xl"
              />
              {discount > 0 && (
                <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-brand rounded-full flex flex-col items-center justify-center shadow-brand">
                  <span className="text-white text-xs font-bold">SAVE</span>
                  <span className="text-white text-lg font-bold leading-none">{discount}%</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
