import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, ChevronRight, Clock } from 'lucide-react';
import { flashSaleAPI } from '../../utils/api.js';
import ProductCard from '../product/ProductCard.jsx';

function Countdown({ endsAt }) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(endsAt) - Date.now());
      setTime({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const pad = n => String(n).padStart(2, '0');

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="w-4 h-4 text-red-400" />
      {[time.h, time.m, time.s].map((val, i) => (
        <span key={i}>
          <span className="inline-flex items-center justify-center bg-gray-900 text-white text-sm font-mono font-bold w-9 h-9 rounded-lg">{pad(val)}</span>
          {i < 2 && <span className="text-gray-700 font-bold mx-0.5">:</span>}
        </span>
      ))}
    </div>
  );
}

export default function FlashSaleSection() {
  const { data } = useQuery({
    queryKey: ['flash-sale-live'],
    queryFn: () => flashSaleAPI.getLive().then(r => r.data),
    refetchInterval: 60000,
  });

  const sale = data?.sale;
  if (!sale || !sale.items?.length) return null;

  const products = sale.items
    .filter(item => item.product)
    .map(item => ({
      ...item.product,
      pricing: { ...item.product?.pricing, sale: item.salePrice },
      _flashSaleStock: item.stockLimit ? item.stockLimit - item.soldCount : null,
    }));

  return (
    <section className="py-16 bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 border-y border-red-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-gray-900">{sale.title || 'Flash Sale'}</h2>
              {sale.description && <p className="text-slate-500 text-sm">{sale.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Countdown endsAt={sale.endsAt} />
            <Link to="/flash-sale" className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-semibold">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.slice(0, 5).map((product, i) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
