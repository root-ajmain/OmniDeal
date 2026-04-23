import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { settingsAPI } from '../../utils/api.js';

const DEFAULT_HEADLINE = {
  badge: 'New arrivals every week',
  line1: 'Shop The',
  highlight: 'Future',
  line2: 'of Retail',
  description: 'Discover thousands of premium products from electronics to fashion. Unbeatable prices, lightning-fast delivery, and an experience you\'ll love.',
};

const DEFAULT_SLIDES = [
  { imageUrl: 'https://picsum.photos/seed/hero1/1600/900', title: 'New Season Collection', subtitle: 'Up to 50% off' },
  { imageUrl: 'https://picsum.photos/seed/hero2/1600/900', title: 'Electronics Sale', subtitle: 'Best deals on gadgets' },
  { imageUrl: 'https://picsum.photos/seed/hero3/1600/900', title: 'Fashion Week', subtitle: 'Trending styles' },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState(1);

  const { data: settings } = useQuery({
    queryKey: ['site-settings'],
    queryFn: () => settingsAPI.get().then(r => r.data.settings),
    staleTime: 5 * 60 * 1000,
  });

  const headline = settings?.heroHeadline || DEFAULT_HEADLINE;
  const slides = settings?.heroSlides?.length ? settings.heroSlides : DEFAULT_SLIDES;

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => {
      setDir(1);
      setCurrent(c => (c + 1) % slides.length);
    }, 5000);
    return () => clearInterval(t);
  }, [slides.length]);

  const go = (idx) => {
    setDir(idx > current ? 1 : -1);
    setCurrent(idx);
  };
  const prev = () => go((current - 1 + slides.length) % slides.length);
  const next = () => go((current + 1) % slides.length);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background slider */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={slides[current].imageUrl}
            alt={slides[current].title}
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-20 w-full">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
          >
            <span className="text-sm text-amber-300 font-medium">{headline.badge}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6 text-white"
          >
            {headline.line1}{' '}
            <span className="text-amber-400">{headline.highlight}</span>{' '}
            {headline.line2}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg"
          >
            {headline.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 mb-12"
          >
            <Link to="/products" className="btn-primary text-base py-4 px-8 shadow-brand-lg">
              Shop Now
            </Link>
            <Link to="/category/electronics" className="text-base py-4 px-8 rounded-xl border border-white/30 text-white backdrop-blur-sm hover:bg-white/10 transition-all font-medium text-center">
              Explore Electronics
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-8"
          >
            {[
              { label: 'Products', value: '10K+' },
              { label: 'Happy Customers', value: '50K+' },
              { label: 'Categories', value: '100+' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-amber-400">{stat.value}</div>
                <div className="text-white/60 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Prev / Next arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`rounded-full transition-all ${i === current ? 'w-6 h-2.5 bg-amber-400' : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}

      {/* Trust badges */}
      <div className="absolute bottom-0 inset-x-0 border-t border-white/10 bg-black/30 backdrop-blur-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap justify-center gap-8">
          {[
            'Free delivery on ৳999+',
            '100% secure checkout',
            'Fast 24h shipping',
          ].map(label => (
            <div key={label} className="text-white/70 text-sm font-medium">
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
